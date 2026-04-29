const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BasketMember = sequelize.define('BasketMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  basket_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'community_baskets', key: 'id' }
  },
  consumer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  order_id: {
    type: DataTypes.UUID,
    references: { model: 'orders', key: 'id' }
  },
  quantity_kg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'basket_members',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['basket_id', 'consumer_id']
    }
  ]
});

module.exports = BasketMember;
