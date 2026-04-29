const { DeliveryProfile, DeliveryAssignment, Order, User, Listing } = require('../models');
const notificationService = require('../services/notification.service');
const { asyncHandler, successResponse } = require('../utils/helpers');
const { errors } = require('../utils/errors');
const sequelize = require('../config/database');

const updateAvailability = asyncHandler(async (req, res) => {
  const { is_available, lat, lng } = req.validatedBody;
  await DeliveryProfile.update(
    { is_available, current_lat: lat, current_lng: lng },
    { where: { user_id: req.user.userId } }
  );
  successResponse(res, null, 'Availability updated');
});

const getMyAssignments = asyncHandler(async (req, res) => {
  const assignments = await DeliveryAssignment.findAll({
    where: { delivery_id: req.user.userId },
    include: [{
      model: Order, as: 'order',
      include: [
        { model: Listing, as: 'listing', attributes: ['title', 'images'] },
        { model: User, as: 'consumer', attributes: ['name', 'phone'] },
        { model: User, as: 'farmerUser', attributes: ['name', 'phone'] }
      ]
    }],
    order: [['created_at', 'DESC']]
  });
  successResponse(res, { assignments });
});

const respondToAssignment = asyncHandler(async (req, res) => {
  const { accepted } = req.validatedBody;
  const assignment = await DeliveryAssignment.findByPk(req.params.id);
  if (!assignment) throw errors.notFound('Assignment');
  if (assignment.delivery_id !== req.user.userId) throw errors.forbidden();

  if (accepted) {
    await assignment.update({ status: 'accepted', accepted_at: new Date() });
    await Order.update({ delivery_id: req.user.userId }, { where: { id: assignment.order_id } });
    notificationService.emitToRoom(`order:${assignment.order_id}`, 'order:status_update', {
      orderId: assignment.order_id, status: 'delivery_assigned', message: 'Delivery partner assigned'
    });
  } else {
    await assignment.update({ status: 'rejected' });
    // Find next nearest partner (up to 3 total attempts)
    const rejectedCount = await DeliveryAssignment.count({
      where: { order_id: assignment.order_id, status: 'rejected' }
    });
    if (rejectedCount < 3) {
      const order = await Order.findByPk(assignment.order_id, { include: [{ model: Listing, as: 'listing' }] });
      if (order?.listing) {
        const nextPartner = await DeliveryProfile.findOne({
          where: {
            is_available: true,
            user_id: { [require('sequelize').Op.notIn]:
              (await DeliveryAssignment.findAll({ where: { order_id: assignment.order_id }, attributes: ['delivery_id'] }))
                .map(a => a.delivery_id)
            }
          },
          order: sequelize.literal(`(6371 * acos(cos(radians(${order.listing.lat})) * cos(radians(current_lat)) * cos(radians(current_lng) - radians(${order.listing.lng})) + sin(radians(${order.listing.lat})) * sin(radians(current_lat)))) ASC`),
          limit: 1
        });
        if (nextPartner) {
          await DeliveryAssignment.create({
            order_id: assignment.order_id, delivery_id: nextPartner.user_id, status: 'offered',
            earnings: assignment.earnings
          });
        }
      }
    }
  }
  successResponse(res, { assignment });
});

const updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.validatedBody;
  await DeliveryProfile.update({ current_lat: lat, current_lng: lng }, { where: { user_id: req.user.userId } });
  // Find active orders for this delivery partner and emit location
  const activeOrders = await Order.findAll({
    where: { delivery_id: req.user.userId, status: ['picked_up', 'ready_for_pickup'] }
  });
  for (const order of activeOrders) {
    notificationService.emitToRoom(`order:${order.id}`, 'delivery:location', {
      lat, lng, deliveryId: req.user.userId
    });
  }
  successResponse(res, null, 'Location updated');
});

module.exports = { updateAvailability, getMyAssignments, respondToAssignment, updateLocation };
