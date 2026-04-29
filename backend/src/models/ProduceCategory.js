const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProduceCategory = sequelize.define('ProduceCategory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name_en: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  name_hi: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  icon_url: {
    type: DataTypes.TEXT
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'produce_categories',
  underscored: true,
  timestamps: true
});

module.exports = ProduceCategory;
