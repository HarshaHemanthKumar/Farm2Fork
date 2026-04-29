const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryAssignment = sequelize.define('DeliveryAssignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'orders', key: 'id' }
  },
  delivery_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  status: {
    type: DataTypes.ENUM('offered', 'accepted', 'rejected', 'completed'),
    defaultValue: 'offered'
  },
  offered_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  accepted_at: {
    type: DataTypes.DATE
  },
  completed_at: {
    type: DataTypes.DATE
  },
  earnings: {
    type: DataTypes.DECIMAL(8, 2)
  }
}, {
  tableName: 'delivery_assignments',
  underscored: true,
  timestamps: true
});

module.exports = DeliveryAssignment;
