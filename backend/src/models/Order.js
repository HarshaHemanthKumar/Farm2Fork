const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  consumer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  listing_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'listings', key: 'id' }
  },
  farmer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  delivery_id: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  },
  basket_id: {
    type: DataTypes.UUID,
    references: { model: 'community_baskets', key: 'id' }
  },
  quantity: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  delivery_fee: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    defaultValue: 0
  },
  platform_fee: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    defaultValue: 0
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'pending_payment', 'payment_failed', 'confirmed', 'farmer_accepted',
      'ready_for_pickup', 'picked_up', 'delivered', 'cancelled', 'refunded'
    ),
    defaultValue: 'pending_payment'
  },
  delivery_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  delivery_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  delivery_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  stripe_payment_intent_id: {
    type: DataTypes.STRING(100)
  },
  stripe_transfer_id: {
    type: DataTypes.STRING(100)
  },
  farmer_payout_amount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  delivery_instructions: {
    type: DataTypes.TEXT
  },
  otp_for_delivery: {
    type: DataTypes.STRING(6)
  },
  delivered_at: {
    type: DataTypes.DATE
  },
  cancelled_at: {
    type: DataTypes.DATE
  },
  cancellation_reason: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'orders',
  underscored: true,
  timestamps: true
});

module.exports = Order;
