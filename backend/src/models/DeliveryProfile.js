const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryProfile = sequelize.define('DeliveryProfile', {
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
  vehicle_type: {
    type: DataTypes.ENUM('bike', 'auto', 'van'),
    allowNull: false
  },
  vehicle_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  license_number: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  service_radius_km: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  current_lat: {
    type: DataTypes.DECIMAL(10, 8)
  },
  current_lng: {
    type: DataTypes.DECIMAL(11, 8)
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.00
  }
}, {
  tableName: 'delivery_profiles',
  underscored: true,
  timestamps: true
});

module.exports = DeliveryProfile;
