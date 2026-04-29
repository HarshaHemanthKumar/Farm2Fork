const Queue = require('bull');
const logger = require('../utils/logger');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined
};

// Payout queue
const payoutQueue = new Queue('payouts', { redis: redisConfig });

payoutQueue.process(async (job) => {
  const { orderId } = job.data;
  logger.info(`Processing payout for order: ${orderId}`);

  const { Order, User } = require('../models');
  const stripeService = require('../services/stripe.service');
  const notificationService = require('../services/notification.service');

  try {
    // 1. Fetch order, verify status
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'farmerUser' }
      ]
    });

    if (!order || order.status !== 'delivered') {
      throw new Error(`Order ${orderId} not in delivered status`);
    }

    const farmer = order.farmerUser;
    if (!farmer.stripe_account_id) {
      throw new Error(`Farmer ${farmer.id} has no Stripe account`);
    }

    // 2. Calculate farmer payout: subtotal - platform_fee
    const payoutAmount = parseFloat(order.subtotal) - parseFloat(order.platform_fee);

    // 3. Create Stripe transfer
    const transfer = await stripeService.createTransfer({
      amount: payoutAmount,
      farmerAccountId: farmer.stripe_account_id,
      orderId
    });

    // 4. Update order
    await order.update({
      stripe_transfer_id: transfer.id,
      farmer_payout_amount: payoutAmount
    });

    // 5. Notify farmer
    await notificationService.sendPush(
      farmer.id,
      'Payout Received 💰',
      `₹${payoutAmount.toFixed(2)} has been transferred to your account for order.`,
      { type: 'payout', orderId },
      'payment_update'
    );

    logger.info(`Payout completed for order ${orderId}: ₹${payoutAmount}`);
    return { success: true, transferId: transfer.id };
  } catch (err) {
    logger.error(`Payout job failed for order ${orderId}:`, err.message);
    throw err; // Bull will retry
  }
});

// Retry config: 3 attempts with exponential backoff (1s, 5s, 30s)
payoutQueue.on('failed', (job, err) => {
  logger.error(`Payout job ${job.id} failed (attempt ${job.attemptsMade}):`, err.message);
  if (job.attemptsMade >= 3) {
    logger.error(`Payout job permanently failed for order: ${job.data.orderId}`);
    // TODO: Alert admin via notification
  }
});

/**
 * Add a payout job to the queue
 */
async function addPayoutJob(orderId) {
  return payoutQueue.add(
    { orderId },
    {
      attempts: 3,
      backoff: {
        type: 'custom',
        delay: (attemptsMade) => {
          const delays = [1000, 5000, 30000];
          return delays[attemptsMade - 1] || 30000;
        }
      }
    }
  );
}

module.exports = { payoutQueue, addPayoutJob };
