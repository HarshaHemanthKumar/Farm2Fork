'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('listings', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      farmer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      category_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'produce_categories', key: 'id' } },
      title: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT },
      price_per_kg: { type: Sequelize.DECIMAL(8, 2), allowNull: false },
      unit: { type: Sequelize.ENUM('kg', 'dozen', 'piece', 'bunch'), defaultValue: 'kg' },
      available_qty: { type: Sequelize.DECIMAL(8, 2), allowNull: false },
      min_order_qty: { type: Sequelize.DECIMAL(8, 2), defaultValue: 0.5 },
      harvest_date: { type: Sequelize.DATEONLY, allowNull: false },
      expiry_date: { type: Sequelize.DATEONLY, allowNull: false },
      images: { type: Sequelize.ARRAY(Sequelize.TEXT) },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_organic: { type: Sequelize.BOOLEAN, defaultValue: false },
      status: { type: Sequelize.ENUM('draft', 'active', 'sold_out', 'expired'), defaultValue: 'draft' },
      pincode: { type: Sequelize.STRING(6), allowNull: false },
      lat: { type: Sequelize.DECIMAL(10, 8) },
      lng: { type: Sequelize.DECIMAL(11, 8) },
      total_sold_kg: { type: Sequelize.DECIMAL(8, 2), defaultValue: 0 },
      view_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      deleted_at: { type: Sequelize.DATE }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('listings');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_listings_unit";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_listings_status";');
  }
};
