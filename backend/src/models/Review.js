const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: { model: 'orders', key: 'id' }
  },
  reviewer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  reviewee_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  comment: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.ENUM('consumer_to_farmer', 'consumer_to_delivery', 'farmer_to_consumer')
  }
}, {
  tableName: 'reviews',
  underscored: true,
  timestamps: true
});

module.exports = Review;
