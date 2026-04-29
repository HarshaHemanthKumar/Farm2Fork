const { Order, Listing, User, FarmerProfile, DeliveryProfile, DeliveryAssignment } = require('../models');
const stripeService = require('../services/stripe.service');
const { calculateDeliveryFee } = require('../services/delivery-fee.service');
const notificationService = require('../services/notification.service');
const { addPayoutJob } = require('../jobs/payout.job');
const { asyncHandler, successResponse, createdResponse } = require('../utils/helpers');
const { errors } = require('../utils/errors');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || 5);

const createOrder = asyncHandler(async (req, res) => {
  const { listing_id, quantity, delivery_address, delivery_lat, delivery_lng, delivery_instructions, basket_id } = req.validatedBody;

  const listing = await Listing.findByPk(listing_id, {
    include: [{ model: User, as: 'farmer', include: [{ model: FarmerProfile, as: 'farmerProfile' }] }]
  });

  if (!listing || listing.status !== 'active') throw errors.listingNotActive();
  if (parseFloat(listing.available_qty) < quantity) throw errors.listingInsufficientStock();

  const consumer = await User.findByPk(req.user.userId);
  const subtotal = parseFloat((quantity * parseFloat(listing.price_per_kg)).toFixed(2));
  const platform_fee = parseFloat((subtotal * PLATFORM_FEE_PERCENT / 100).toFixed(2));
  const delivery_fee = await calculateDeliveryFee(listing.lat, listing.lng, delivery_lat, delivery_lng);
  const total_amount = parseFloat((subtotal + platform_fee + delivery_fee).toFixed(2));

  let paymentIntent = null;
  let stripe_payment_intent_id = null;
  let client_secret = null;

  if (consumer.stripe_customer_id && listing.farmer?.stripe_account_id) {
    try {
      paymentIntent = await stripeService.createPaymentIntent({
        amount: total_amount, customerId: consumer.stripe_customer_id,
        orderId: 'pending', farmerId: listing.farmer_id, consumerId: req.user.userId,
        farmerAccountId: listing.farmer.stripe_account_id, platformFee: platform_fee
      });
      stripe_payment_intent_id = paymentIntent.id;
      client_secret = paymentIntent.client_secret;
    } catch (err) {
      require('../utils/logger').warn('Stripe PI creation failed (non-blocking):', err.message);
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const order = await Order.create({
    consumer_id: req.user.userId, listing_id, farmer_id: listing.farmer_id,
    basket_id: basket_id || null, quantity, unit_price: listing.price_per_kg,
    subtotal, delivery_fee, platform_fee, total_amount, status: 'pending_payment',
    delivery_address, delivery_lat, delivery_lng, delivery_instructions,
    stripe_payment_intent_id, otp_for_delivery: otp
  });

  if (stripe_payment_intent_id) {
    try {
      await stripeService.stripe?.paymentIntents?.update?.(stripe_payment_intent_id, { metadata: { orderId: order.id } });
    } catch (e) { /* ignore */ }
  }

  createdResponse(res, { order, client_secret, payment_intent_id: stripe_payment_intent_id });
});

const confirmPayment = asyncHandler(async (req, res) => {
  const { order_id, payment_intent_id } = req.validatedBody;
  const order = await Order.findByPk(order_id);
  if (!order) throw errors.orderNotFound();
  if (order.consumer_id !== req.user.userId) throw errors.forbidden();
  if (order.status !== 'pending_payment') throw errors.orderAlreadyConfirmed();

  if (payment_intent_id && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
    const pi = await stripeService.getPaymentIntent(payment_intent_id);
    if (pi.status !== 'succeeded') throw errors.paymentIntentFailed();
  }

  await order.update({ status: 'confirmed' });
  const listing = await Listing.findByPk(order.listing_id);
  if (listing) {
    await listing.update({
      available_qty: parseFloat(listing.available_qty) - parseFloat(order.quantity),
      total_sold_kg: parseFloat(listing.total_sold_kg) + parseFloat(order.quantity)
    });
    if (parseFloat(listing.available_qty) <= 0) await listing.update({ status: 'sold_out' });
  }

  const consumer = await User.findByPk(order.consumer_id);
  await notificationService.notifyFarmerNewOrder(
    order.farmer_id, consumer.name, order.quantity, listing?.title || 'produce', order.total_amount
  );

  successResponse(res, { order });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: Listing, as: 'listing' },
      { model: User, as: 'consumer', attributes: ['id', 'name', 'phone', 'profile_photo'] },
      { model: User, as: 'farmerUser', attributes: ['id', 'name', 'phone'], include: [{ model: FarmerProfile, as: 'farmerProfile' }] },
      { model: User, as: 'deliveryPartner', attributes: ['id', 'name', 'phone'], include: [{ model: DeliveryProfile, as: 'deliveryProfile' }] }
    ]
  });
  if (!order) throw errors.orderNotFound();
  const userId = req.user.userId;
  if (![order.consumer_id, order.farmer_id, order.delivery_id].includes(userId) && req.user.role !== 'admin') {
    throw errors.forbidden();
  }
  successResponse(res, { order });
});

const getConsumerOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = { consumer_id: req.user.userId };
  if (status) where.status = status;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { rows: orders, count } = await Order.findAndCountAll({
    where, include: [{ model: Listing, as: 'listing', attributes: ['title', 'images', 'unit'] },
      { model: User, as: 'farmerUser', attributes: ['name'] }],
    order: [['created_at', 'DESC']], limit: parseInt(limit), offset
  });
  successResponse(res, { orders, total: count, page: parseInt(page) });
});

const getFarmerOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = { farmer_id: req.user.userId };
  if (status) where.status = status;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { rows: orders, count } = await Order.findAndCountAll({
    where, include: [{ model: Listing, as: 'listing', attributes: ['title', 'images', 'unit'] },
      { model: User, as: 'consumer', attributes: ['name', 'phone'] }],
    order: [['created_at', 'DESC']], limit: parseInt(limit), offset
  });
  successResponse(res, { orders, total: count, page: parseInt(page) });
});

const farmerAcceptOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) throw errors.orderNotFound();
  if (order.farmer_id !== req.user.userId) throw errors.forbidden();
  await order.update({ status: 'farmer_accepted' });

  // Find nearest available delivery partner
  const listing = await Listing.findByPk(order.listing_id);
  if (listing) {
    const deliveryPartners = await DeliveryProfile.findAll({
      where: { is_available: true },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: sequelize.literal(`(
        6371 * acos(cos(radians(${listing.lat})) * cos(radians(current_lat))
        * cos(radians(current_lng) - radians(${listing.lng}))
        + sin(radians(${listing.lat})) * sin(radians(current_lat)))
      ) ASC`),
      limit: 1
    });
    if (deliveryPartners.length > 0) {
      const dp = deliveryPartners[0];
      await DeliveryAssignment.create({
        order_id: order.id, delivery_id: dp.user_id, status: 'offered',
        earnings: parseFloat(order.delivery_fee) * 0.9
      });
      await notificationService.sendPush(dp.user_id, 'New Delivery Assignment!',
        `New pickup available nearby. Earnings: ₹${(parseFloat(order.delivery_fee) * 0.9).toFixed(0)}`,
        { type: 'assignment_offer', orderId: order.id }, 'delivery_update');
    }
  }
  successResponse(res, { order });
});

const farmerReadyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) throw errors.orderNotFound();
  if (order.farmer_id !== req.user.userId) throw errors.forbidden();
  await order.update({ status: 'ready_for_pickup' });
  if (order.delivery_id) {
    await notificationService.sendPush(order.delivery_id, 'Ready for Pickup!',
      'Order is ready. Head to the farm for pickup.', { orderId: order.id }, 'delivery_update');
  }
  successResponse(res, { order });
});

const pickupConfirm = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) throw errors.orderNotFound();
  if (order.delivery_id !== req.user.userId) throw errors.forbidden();
  await order.update({ status: 'picked_up' });
  const deliveryUser = await User.findByPk(req.user.userId);
  await notificationService.notifyConsumerOutForDelivery(order.consumer_id, deliveryUser.name, order.otp_for_delivery);
  successResponse(res, { order });
});

const deliveryConfirm = asyncHandler(async (req, res) => {
  const { otp } = req.validatedBody;
  const order = await Order.findByPk(req.params.id);
  if (!order) throw errors.orderNotFound();
  if (order.delivery_id !== req.user.userId) throw errors.forbidden();
  if (order.otp_for_delivery !== otp) throw errors.deliveryOtpInvalid();
  await order.update({ status: 'delivered', delivered_at: new Date() });

  await DeliveryAssignment.update({ status: 'completed', completed_at: new Date() },
    { where: { order_id: order.id, delivery_id: req.user.userId } });

  await addPayoutJob(order.id);
  await notificationService.notifyConsumerDelivered(order.consumer_id);
  successResponse(res, { order });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.validatedBody;
  const order = await Order.findByPk(req.params.id);
  if (!order) throw errors.orderNotFound();
  if (![order.consumer_id, order.farmer_id].includes(req.user.userId) && req.user.role !== 'admin') throw errors.forbidden();
  const cancellableStatuses = ['pending_payment', 'confirmed', 'farmer_accepted'];
  if (!cancellableStatuses.includes(order.status)) throw errors.orderCannotCancel();

  await order.update({ status: 'cancelled', cancelled_at: new Date(), cancellation_reason: reason });

  // Restore listing qty
  const listing = await Listing.findByPk(order.listing_id);
  if (listing && order.status !== 'pending_payment') {
    await listing.update({ available_qty: parseFloat(listing.available_qty) + parseFloat(order.quantity) });
  }

  if (order.stripe_payment_intent_id && order.status !== 'pending_payment') {
    try { await stripeService.createRefund(order.stripe_payment_intent_id); } catch (e) { /* log */ }
  }

  successResponse(res, { order });
});

module.exports = {
  createOrder, confirmPayment, getOrderById, getConsumerOrders, getFarmerOrders,
  farmerAcceptOrder, farmerReadyOrder, pickupConfirm, deliveryConfirm, cancelOrder
};
