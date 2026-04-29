const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CommunityBasket = sequelize.define('CommunityBasket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  listing_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'listings', key: 'id' }
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  target_families: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  current_families: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  min_total_kg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false
  },
  current_total_kg: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('open', 'locked', 'confirmed', 'fulfilled', 'expired'),
    defaultValue: 'open'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  delivery_lat: {
    type: DataTypes.DECIMAL(10, 8)
  },
  delivery_lng: {
    type: DataTypes.DECIMAL(11, 8)
  },
  delivery_address: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'community_baskets',
  underscored: true,
  timestamps: true
});

module.exports = CommunityBasket;
