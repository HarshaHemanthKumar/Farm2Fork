const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FarmerProfile = sequelize.define('FarmerProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  farm_name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  farm_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  farm_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  farm_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  farm_size_acres: {
    type: DataTypes.DECIMAL(6, 2)
  },
  description: {
    type: DataTypes.TEXT
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  bank_account_last4: {
    type: DataTypes.STRING(4)
  }
}, {
  tableName: 'farmer_profiles',
  underscored: true,
  timestamps: true
});

module.exports = FarmerProfile;
