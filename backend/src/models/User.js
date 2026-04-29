const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phone: {
    type: DataTypes.STRING(15),
    unique: true,
    allowNull: false,
    validate: {
      is: /^\+91[6-9]\d{9}$/
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('farmer', 'consumer', 'delivery', 'admin'),
    allowNull: false
  },
  profile_photo: {
    type: DataTypes.TEXT
  },
  language: {
    type: DataTypes.STRING(5),
    defaultValue: 'en'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  stripe_customer_id: {
    type: DataTypes.STRING(100)
  },
  stripe_account_id: {
    type: DataTypes.STRING(100)
  },
  stripe_onboarding_complete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fcm_token: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'users',
  underscored: true,
  paranoid: true, // soft deletes via deleted_at
  timestamps: true
});

module.exports = User;
