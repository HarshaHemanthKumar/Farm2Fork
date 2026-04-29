const sequelize = require('../config/database');
const User = require('./User');
const FarmerProfile = require('./FarmerProfile');
const DeliveryProfile = require('./DeliveryProfile');
const ProduceCategory = require('./ProduceCategory');
const Listing = require('./Listing');
const CommunityBasket = require('./CommunityBasket');
const Order = require('./Order');
const BasketMember = require('./BasketMember');
const Review = require('./Review');
const Notification = require('./Notification');
const DeliveryAssignment = require('./DeliveryAssignment');
const OtpSession = require('./OtpSession');

// =====================
// ASSOCIATIONS
// =====================

// User <-> FarmerProfile
User.hasOne(FarmerProfile, { foreignKey: 'user_id', as: 'farmerProfile' });
FarmerProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> DeliveryProfile
User.hasOne(DeliveryProfile, { foreignKey: 'user_id', as: 'deliveryProfile' });
DeliveryProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> Listings (Farmer)
User.hasMany(Listing, { foreignKey: 'farmer_id', as: 'listings' });
Listing.belongsTo(User, { foreignKey: 'farmer_id', as: 'farmer' });

// ProduceCategory <-> Listings
ProduceCategory.hasMany(Listing, { foreignKey: 'category_id', as: 'listings' });
Listing.belongsTo(ProduceCategory, { foreignKey: 'category_id', as: 'category' });

// User <-> Orders (Consumer)
User.hasMany(Order, { foreignKey: 'consumer_id', as: 'consumerOrders' });
Order.belongsTo(User, { foreignKey: 'consumer_id', as: 'consumer' });

// User <-> Orders (Farmer)
User.hasMany(Order, { foreignKey: 'farmer_id', as: 'farmerOrders' });
Order.belongsTo(User, { foreignKey: 'farmer_id', as: 'farmerUser' });

// User <-> Orders (Delivery)
User.hasMany(Order, { foreignKey: 'delivery_id', as: 'deliveryOrders' });
Order.belongsTo(User, { foreignKey: 'delivery_id', as: 'deliveryPartner' });

// Listing <-> Orders
Listing.hasMany(Order, { foreignKey: 'listing_id', as: 'orders' });
Order.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' });

// CommunityBasket <-> Orders
CommunityBasket.hasMany(Order, { foreignKey: 'basket_id', as: 'orders' });
Order.belongsTo(CommunityBasket, { foreignKey: 'basket_id', as: 'basket' });

// CommunityBasket <-> Listing
Listing.hasMany(CommunityBasket, { foreignKey: 'listing_id', as: 'baskets' });
CommunityBasket.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' });

// CommunityBasket <-> User (Creator)
User.hasMany(CommunityBasket, { foreignKey: 'created_by', as: 'createdBaskets' });
CommunityBasket.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// CommunityBasket <-> BasketMember
CommunityBasket.hasMany(BasketMember, { foreignKey: 'basket_id', as: 'members' });
BasketMember.belongsTo(CommunityBasket, { foreignKey: 'basket_id', as: 'basket' });

// User <-> BasketMember
User.hasMany(BasketMember, { foreignKey: 'consumer_id', as: 'basketMemberships' });
BasketMember.belongsTo(User, { foreignKey: 'consumer_id', as: 'consumer' });

// Order <-> BasketMember
Order.hasOne(BasketMember, { foreignKey: 'order_id', as: 'basketMember' });
BasketMember.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Order <-> Review
Order.hasOne(Review, { foreignKey: 'order_id', as: 'review' });
Review.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// User <-> Reviews (Reviewer)
User.hasMany(Review, { foreignKey: 'reviewer_id', as: 'givenReviews' });
Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });

// User <-> Reviews (Reviewee)
User.hasMany(Review, { foreignKey: 'reviewee_id', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'reviewee_id', as: 'reviewee' });

// User <-> Notifications
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Order <-> DeliveryAssignment
Order.hasMany(DeliveryAssignment, { foreignKey: 'order_id', as: 'deliveryAssignments' });
DeliveryAssignment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// User <-> DeliveryAssignment
User.hasMany(DeliveryAssignment, { foreignKey: 'delivery_id', as: 'assignments' });
DeliveryAssignment.belongsTo(User, { foreignKey: 'delivery_id', as: 'deliveryPartner' });

module.exports = {
  sequelize,
  User,
  FarmerProfile,
  DeliveryProfile,
  ProduceCategory,
  Listing,
  CommunityBasket,
  Order,
  BasketMember,
  Review,
  Notification,
  DeliveryAssignment,
  OtpSession
};
