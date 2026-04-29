const { User, FarmerProfile, Listing, Order } = require('../models');
const { asyncHandler, successResponse } = require('../utils/helpers');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const getUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const where = {};
  if (role) where.role = role;
  if (search) where.name = { [Op.iLike]: `%${search}%` };
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { rows: users, count } = await User.findAndCountAll({
    where, include: [{ model: FarmerProfile, as: 'farmerProfile' }],
    order: [['created_at', 'DESC']], limit: parseInt(limit), offset, paranoid: false
  });
  successResponse(res, { users, total: count, page: parseInt(page) });
});

const getAdminListings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { rows: listings, count } = await Listing.findAndCountAll({
    where, include: [{ model: User, as: 'farmer', attributes: ['name', 'phone'] }],
    order: [['created_at', 'DESC']], limit: parseInt(limit), offset, paranoid: false
  });
  successResponse(res, { listings, total: count, page: parseInt(page) });
});

const getAdminOrders = asyncHandler(async (req, res) => {
  const { status, from_date, to_date, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;
  if (from_date || to_date) {
    where.created_at = {};
    if (from_date) where.created_at[Op.gte] = new Date(from_date);
    if (to_date) where.created_at[Op.lte] = new Date(to_date);
  }
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { rows: orders, count } = await Order.findAndCountAll({
    where, order: [['created_at', 'DESC']], limit: parseInt(limit), offset
  });
  successResponse(res, { orders, total: count, page: parseInt(page) });
});

const verifyFarmer = asyncHandler(async (req, res) => {
  await FarmerProfile.update({ is_verified: true }, { where: { user_id: req.params.id } });
  successResponse(res, null, 'Farmer verified');
});

const deactivateUser = asyncHandler(async (req, res) => {
  await User.update({ is_active: false }, { where: { id: req.params.id } });
  successResponse(res, null, 'User deactivated');
});

const getAnalytics = asyncHandler(async (req, res) => {
  const totalOrders = await Order.count();
  const gmv = await Order.sum('total_amount', { where: { status: 'delivered' } }) || 0;
  const activeFarmers = await User.count({ where: { role: 'farmer', is_active: true } });
  const activeConsumers = await User.count({ where: { role: 'consumer', is_active: true } });
  const pendingOrders = await Order.count({ where: { status: ['confirmed', 'farmer_accepted', 'ready_for_pickup', 'picked_up'] } });
  successResponse(res, { totalOrders, gmv, activeFarmers, activeConsumers, pendingOrders });
});

module.exports = { getUsers, getAdminListings, getAdminOrders, verifyFarmer, deactivateUser, getAnalytics };
