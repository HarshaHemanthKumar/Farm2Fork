const Stripe = require('stripe');
const logger = require('../utils/logger');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: process.env.STRIPE_API_VERSION || '2024-04-10'
});

const stripeService = {
  /**
   * Create a Stripe customer for consumers
   */
  async createCustomer(name, phone) {
    try {
      logger.info(`Stripe: Creating customer for ${phone}`);
      const customer = await stripe.customers.create({
        name,
        phone,
        metadata: { platform: 'farm2fork' }
      });
      logger.info(`Stripe: Customer created: ${customer.id}`);
      return customer;
    } catch (err) {
      logger.error('Stripe createCustomer error:', err.message);
      throw err;
    }
  },

  /**
   * Create a Stripe Express connected account for farmers
   */
  async createExpressAccount(email, phone) {
    try {
      logger.info(`Stripe: Creating Express account for ${phone}`);
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'IN',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        },
        business_type: 'individual',
        metadata: { platform: 'farm2fork', phone }
      });
      logger.info(`Stripe: Express account created: ${account.id}`);
      return account;
    } catch (err) {
      logger.error('Stripe createExpressAccount error:', err.message);
      throw err;
    }
  },

  /**
   * Create an account link for farmer onboarding
   */
  async createAccountLink(accountId) {
    try {
      logger.info(`Stripe: Creating account link for ${accountId}`);
      const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: process.env.STRIPE_FARMER_REFRESH_URL,
        return_url: process.env.STRIPE_FARMER_RETURN_URL,
        type: 'account_onboarding'
      });
      return link;
    } catch (err) {
      logger.error('Stripe createAccountLink error:', err.message);
      throw err;
    }
  },

  /**
   * Retrieve account status
   */
  async getAccountStatus(accountId) {
    try {
      const account = await stripe.accounts.retrieve(accountId);
      return {
        onboarded: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled
      };
    } catch (err) {
      logger.error('Stripe getAccountStatus error:', err.message);
      throw err;
    }
  },

  /**
   * Create a PaymentIntent for an order
   */
  async createPaymentIntent({ amount, customerId, orderId, farmerId, consumerId, farmerAccountId, platformFee }) {
    try {
      logger.info(`Stripe: Creating PaymentIntent for order ${orderId}, amount: ${amount}`);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to paise
        currency: 'inr',
        customer: customerId,
        metadata: { orderId, farmerId, consumerId, platform: 'farm2fork' },
        payment_method_types: ['card'],
        application_fee_amount: Math.round(platformFee * 100),
        transfer_data: {
          destination: farmerAccountId
        }
      });
      logger.info(`Stripe: PaymentIntent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (err) {
      logger.error('Stripe createPaymentIntent error:', err.message);
      throw err;
    }
  },

  /**
   * Retrieve PaymentIntent status
   */
  async getPaymentIntent(paymentIntentId) {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (err) {
      logger.error('Stripe getPaymentIntent error:', err.message);
      throw err;
    }
  },

  /**
   * Create a transfer to farmer after delivery
   */
  async createTransfer({ amount, farmerAccountId, orderId }) {
    try {
      logger.info(`Stripe: Creating transfer to ${farmerAccountId} for order ${orderId}`);
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: 'inr',
        destination: farmerAccountId,
        transfer_group: orderId
      });
      logger.info(`Stripe: Transfer created: ${transfer.id}`);
      return transfer;
    } catch (err) {
      logger.error('Stripe createTransfer error:', err.message);
      throw err;
    }
  },

  /**
   * Create a refund for a cancelled order
   */
  async createRefund(paymentIntentId) {
    try {
      logger.info(`Stripe: Creating refund for PI ${paymentIntentId}`);
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId
      });
      logger.info(`Stripe: Refund created: ${refund.id}`);
      return refund;
    } catch (err) {
      logger.error('Stripe createRefund error:', err.message);
      throw err;
    }
  },

  /**
   * Verify webhook signature
   */
  constructEvent(payload, signature) {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  }
};

module.exports = stripeService;
