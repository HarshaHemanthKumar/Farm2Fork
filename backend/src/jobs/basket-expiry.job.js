const Queue = require('bull');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined
};

const basketExpiryQueue = new Queue('basket-expiry', { redis: redisConfig });

// Process basket expiry check every 15 minutes
basketExpiryQueue.process(async (job) => {
  logger.info('Running basket expiry check...');

  const { CommunityBasket, BasketMember } = require('../models');
  const notificationService = require('../services/notification.service');

  try {
    // Find all open baskets past their expiry
    const expiredBaskets = await CommunityBasket.findAll({
      where: {
        status: 'open',
        expires_at: { [Op.lt]: new Date() }
      },
      include: [{ model: BasketMember, as: 'members' }]
    });

    for (const basket of expiredBaskets) {
      await basket.update({ status: 'expired' });

      // Notify all members
      const memberIds = basket.members.map(m => m.consumer_id);
      for (const memberId of memberIds) {
        await notificationService.sendPush(
          memberId,
          'Basket Expired',
          `The basket "${basket.name}" has expired. You can create a new one!`,
          { type: 'basket_expired', basketId: basket.id },
          'basket_update'
        );
      }

      logger.info(`Basket ${basket.id} expired with ${basket.current_families} members`);
    }

    // Also warn baskets expiring in 2 hours
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const soonExpiringBaskets = await CommunityBasket.findAll({
      where: {
        status: 'open',
        expires_at: {
          [Op.between]: [new Date(), twoHoursFromNow]
        }
      }
    });

    for (const basket of soonExpiringBaskets) {
      await notificationService.sendPush(
        basket.created_by,
        'Basket Expiring Soon',
        `Your basket expires in 2 hours and has only ${basket.current_families} members. Share to fill it!`,
        { type: 'basket_expiring', basketId: basket.id },
        'basket_update'
      );
    }

    return { expired: expiredBaskets.length, warned: soonExpiringBaskets.length };
  } catch (err) {
    logger.error('Basket expiry job failed:', err.message);
    throw err;
  }
});

/**
 * Schedule recurring basket expiry check every 15 minutes
 */
async function startBasketExpiryScheduler() {
  // Remove any existing repeatable jobs
  const existingJobs = await basketExpiryQueue.getRepeatableJobs();
  for (const job of existingJobs) {
    await basketExpiryQueue.removeRepeatableByKey(job.key);
  }

  // Add repeatable job every 15 minutes
  await basketExpiryQueue.add({}, { repeat: { every: 15 * 60 * 1000 } });
  logger.info('Basket expiry scheduler started (every 15 minutes)');
}

module.exports = { basketExpiryQueue, startBasketExpiryScheduler };
