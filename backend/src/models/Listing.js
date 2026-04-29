const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Listing = sequelize.define('Listing', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  farmer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'produce_categories', key: 'id' }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price_per_kg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false
  },
  unit: {
    type: DataTypes.ENUM('kg', 'dozen', 'piece', 'bunch'),
    defaultValue: 'kg'
  },
  available_qty: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false
  },
  min_order_qty: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0.5
  },
  harvest_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_organic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'sold_out', 'expired'),
    defaultValue: 'draft'
  },
  pincode: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  lat: {
    type: DataTypes.DECIMAL(10, 8)
  },
  lng: {
    type: DataTypes.DECIMAL(11, 8)
  },
  total_sold_kg: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'listings',
  underscored: true,
  paranoid: true,
  timestamps: true
});

module.exports = Listing;
