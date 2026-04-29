const { Listing, User, FarmerProfile, ProduceCategory, Review, CommunityBasket } = require('../models');
const { asyncHandler, successResponse, createdResponse } = require('../utils/helpers');
const { errors } = require('../utils/errors');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const getListings = asyncHandler(async (req, res) => {
  const {
    pincode, lat, lng, radius_km = 20, category_id,
    min_price, max_price, is_organic, sort = 'newest',
    page = 1, limit = 20, search
  } = req.query;

  const where = { status: 'active', is_active: true };
  const order = [];

  if (search) where.title = { [Op.iLike]: `%${search}%` };
  if (pincode) where.pincode = pincode;
  if (category_id) where.category_id = category_id;
  if (min_price) where.price_per_kg = { ...where.price_per_kg, [Op.gte]: parseFloat(min_price) };
  if (max_price) where.price_per_kg = { ...where.price_per_kg, [Op.lte]: parseFloat(max_price) };
  if (is_organic !== undefined) where.is_organic = is_organic === 'true';

  switch (sort) {
    case 'price_asc': order.push(['price_per_kg', 'ASC']); break;
    case 'price_desc': order.push(['price_per_kg', 'DESC']); break;
    default: order.push(['created_at', 'DESC']);
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  if (lat && lng) {
    const latVal = parseFloat(lat);
    const lngVal = parseFloat(lng);
    const radiusVal = parseFloat(radius_km);
    const distanceAttr = sequelize.literal(`(
      6371 * acos(cos(radians(${latVal})) * cos(radians(lat))
      * cos(radians(lng) - radians(${lngVal}))
      + sin(radians(${latVal})) * sin(radians(lat)))
    )`);
    where[Op.and] = [...(where[Op.and] || []), sequelize.where(distanceAttr, { [Op.lte]: radiusVal })];
  }

  const { rows: listings, count: total } = await Listing.findAndCountAll({
    where,
    include: [
      { model: User, as: 'farmer', attributes: ['id', 'name', 'profile_photo'],
        include: [{ model: FarmerProfile, as: 'farmerProfile', attributes: ['farm_name', 'is_verified'] }] },
      { model: ProduceCategory, as: 'category', attributes: ['id', 'name_en', 'name_hi', 'icon_url'] }
    ],
    order, limit: parseInt(limit), offset, distinct: true
  });

  successResponse(res, { listings, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
});

const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findByPk(req.params.id, {
    include: [
      { model: User, as: 'farmer', attributes: ['id', 'name', 'profile_photo'],
        include: [{ model: FarmerProfile, as: 'farmerProfile' }] },
      { model: ProduceCategory, as: 'category' }
    ]
  });
  if (!listing) throw errors.listingNotFound();
  await listing.update({ view_count: listing.view_count + 1 });

  const reviews = await Review.findAll({
    where: { reviewee_id: listing.farmer_id },
    include: [{ model: User, as: 'reviewer', attributes: ['name', 'profile_photo'] }],
    limit: 10, order: [['created_at', 'DESC']]
  });
  const activeBasketsCount = await CommunityBasket.count({ where: { listing_id: listing.id, status: 'open' } });
  successResponse(res, { listing, farmer: listing.farmer, reviews, activeBasketsCount });
});

const createListing = asyncHandler(async (req, res) => {
  const data = req.validatedBody;
  const farmerProfile = await FarmerProfile.findOne({ where: { user_id: req.user.userId } });
  if (!farmerProfile) throw errors.forbidden();

  const listing = await Listing.create({
    ...data, farmer_id: req.user.userId, status: 'active',
    lat: farmerProfile.farm_lat, lng: farmerProfile.farm_lng,
    expiry_date: data.expiry_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  const fullListing = await Listing.findByPk(listing.id, { include: [{ model: ProduceCategory, as: 'category' }] });
  createdResponse(res, { listing: fullListing });
});

const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findByPk(req.params.id);
  if (!listing) throw errors.listingNotFound();
  if (listing.farmer_id !== req.user.userId) throw errors.forbidden();
  await listing.update(req.validatedBody);
  const fullListing = await Listing.findByPk(listing.id, { include: [{ model: ProduceCategory, as: 'category' }] });
  successResponse(res, { listing: fullListing });
});

const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findByPk(req.params.id);
  if (!listing) throw errors.listingNotFound();
  if (listing.farmer_id !== req.user.userId) throw errors.forbidden();
  await listing.update({ status: 'expired', is_active: false });
  await listing.destroy();
  successResponse(res, null, 'Listing deleted successfully');
});

const getMyListings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = { farmer_id: req.user.userId };
  if (status) where.status = status;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { rows: listings, count: total } = await Listing.findAndCountAll({
    where, include: [{ model: ProduceCategory, as: 'category' }],
    order: [['created_at', 'DESC']], limit: parseInt(limit), offset, paranoid: false
  });

  const allListings = await Listing.findAll({
    where: { farmer_id: req.user.userId }, attributes: ['total_sold_kg', 'price_per_kg', 'status'], paranoid: false
  });
  const stats = {
    totalSold: allListings.reduce((s, l) => s + parseFloat(l.total_sold_kg || 0), 0),
    totalRevenue: allListings.reduce((s, l) => s + (parseFloat(l.total_sold_kg || 0) * parseFloat(l.price_per_kg)), 0),
    activeCount: allListings.filter(l => l.status === 'active').length
  };
  successResponse(res, { listings, stats, total, page: parseInt(page) });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await ProduceCategory.findAll({ order: [['display_order', 'ASC']] });
  successResponse(res, { categories });
});

module.exports = { getListings, getListingById, createListing, updateListing, deleteListing, getMyListings, getCategories };
