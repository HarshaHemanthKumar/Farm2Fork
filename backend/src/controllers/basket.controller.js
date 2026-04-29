const { CommunityBasket, BasketMember, Listing, User, Order } = require('../models');
const notificationService = require('../services/notification.service');
const { asyncHandler, successResponse, createdResponse } = require('../utils/helpers');
const { errors } = require('../utils/errors');
const { Op } = require('sequelize');

const createBasket = asyncHandler(async (req, res) => {
  const data = req.validatedBody;
  const basket = await CommunityBasket.create({
    ...data, created_by: req.user.userId, status: 'open', current_families: 1
  });
  // Creator auto-joins
  await BasketMember.create({
    basket_id: basket.id, consumer_id: req.user.userId, quantity_kg: data.min_total_kg / data.target_families
  });
  createdResponse(res, { basket });
});

const getBaskets = asyncHandler(async (req, res) => {
  const { pincode, listing_id, status = 'open' } = req.query;
  const where = {};
  if (pincode) where.pincode = pincode;
  if (listing_id) where.listing_id = listing_id;
  if (status) where.status = status;
  const baskets = await CommunityBasket.findAll({
    where, include: [
      { model: Listing, as: 'listing', attributes: ['title', 'price_per_kg', 'images'] },
      { model: User, as: 'creator', attributes: ['name'] }
    ], order: [['created_at', 'DESC']]
  });
  successResponse(res, { baskets });
});

const getBasketById = asyncHandler(async (req, res) => {
  const basket = await CommunityBasket.findByPk(req.params.id, {
    include: [
      { model: Listing, as: 'listing' },
      { model: BasketMember, as: 'members', include: [{ model: User, as: 'consumer', attributes: ['id', 'name', 'profile_photo'] }] }
    ]
  });
  if (!basket) throw errors.notFound('Basket');
  successResponse(res, { basket });
});

const joinBasket = asyncHandler(async (req, res) => {
  const { quantity_kg } = req.validatedBody;
  const basket = await CommunityBasket.findByPk(req.params.id);
  if (!basket) throw errors.notFound('Basket');
  if (basket.status !== 'open') throw errors.basketLocked();
  if (new Date(basket.expires_at) < new Date()) throw errors.basketExpired();
  if (basket.current_families >= basket.target_families) throw errors.basketFull();

  const existing = await BasketMember.findOne({
    where: { basket_id: basket.id, consumer_id: req.user.userId }
  });
  if (existing) throw errors.basketAlreadyMember();

  await BasketMember.create({ basket_id: basket.id, consumer_id: req.user.userId, quantity_kg });

  const newFamilies = basket.current_families + 1;
  const newTotalKg = parseFloat(basket.current_total_kg) + parseFloat(quantity_kg);
  const updateData = { current_families: newFamilies, current_total_kg: newTotalKg };

  // Check lock conditions
  if (newTotalKg >= parseFloat(basket.min_total_kg) && newFamilies >= basket.target_families) {
    updateData.status = 'locked';
  }
  await basket.update(updateData);

  // Notify members
  const members = await BasketMember.findAll({ where: { basket_id: basket.id } });
  const memberIds = members.map(m => m.consumer_id);
  await notificationService.notifyBasketMemberJoined(memberIds, newFamilies, newTotalKg, basket.min_total_kg);

  if (updateData.status === 'locked') {
    await notificationService.notifyBasketLocked(memberIds);
  }

  // Emit socket event
  notificationService.emitToRoom(`basket:${basket.id}`, 'basket:member_joined', {
    basketId: basket.id, memberCount: newFamilies, totalKg: newTotalKg
  });

  successResponse(res, { basket: await CommunityBasket.findByPk(basket.id) });
});

const lockBasket = asyncHandler(async (req, res) => {
  const basket = await CommunityBasket.findByPk(req.params.id);
  if (!basket) throw errors.notFound('Basket');
  if (basket.created_by !== req.user.userId) throw errors.forbidden();
  if (basket.status !== 'open') throw errors.basketLocked();
  await basket.update({ status: 'locked' });
  const members = await BasketMember.findAll({ where: { basket_id: basket.id } });
  await notificationService.notifyBasketLocked(members.map(m => m.consumer_id));
  successResponse(res, { basket });
});

module.exports = { createBasket, getBaskets, getBasketById, joinBasket, lockBasket };
