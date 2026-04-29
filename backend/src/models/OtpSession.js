const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OtpSession = sequelize.define('OtpSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  otp_hash: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  attempt_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'otp_sessions',
  underscored: true,
  timestamps: true
});

module.exports = OtpSession;
