const { User, FarmerProfile } = require('../models');
const stripeService = require('../services/stripe.service');
const { asyncHandler, successResponse } = require('../utils/helpers');
const { errors } = require('../utils/errors');
const logger = require('../utils/logger');

const onboardFarmer = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.userId);
  if (!user) throw errors.notFound('User');

  let accountId = user.stripe_account_id;
  if (!accountId) {
    const account = await stripeService.createExpressAccount(null, user.phone);
    accountId = account.id;
    await user.update({ stripe_account_id: accountId });
  }

  const link = await stripeService.createAccountLink(accountId);
  successResponse(res, { url: link.url });
});

const getFarmerStatus = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.userId);
  if (!user || !user.stripe_account_id) {
    return successResponse(res, { onboarded: false, charges_enabled: false, payouts_enabled: false });
  }
  const status = await stripeService.getAccountStatus(user.stripe_account_id);
  if (status.onboarded && !user.stripe_onboarding_complete) {
    await user.update({ stripe_onboarding_complete: true });
  }
  successResponse(res, status);
});

const handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripeService.constructEvent(req.body, sig);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const { Order, User: UserModel } = require('../models');

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      const orderId = pi.metadata.orderId;
      if (orderId && orderId !== 'pending') {
        await Order.update({ status: 'confirmed' }, { where: { id: orderId, status: 'pending_payment' } });
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      const orderId = pi.metadata.orderId;
      if (orderId && orderId !== 'pending') {
        await Order.update({ status: 'payment_failed' }, { where: { id: orderId } });
      }
      break;
    }
    case 'account.updated': {
      const account = event.data.object;
      if (account.charges_enabled) {
        await UserModel.update(
          { stripe_onboarding_complete: true },
          { where: { stripe_account_id: account.id } }
        );
      }
      break;
    }
    case 'transfer.created':
      logger.info('Transfer created:', event.data.object.id);
      break;
    default:
      logger.info(`Unhandled webhook event: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = { onboardFarmer, getFarmerStatus, handleWebhook };
