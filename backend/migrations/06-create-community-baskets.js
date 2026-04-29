'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('community_baskets', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      listing_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'listings', key: 'id' } },
      name: { type: Sequelize.STRING(150), allowNull: false },
      created_by: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      target_families: { type: Sequelize.INTEGER, defaultValue: 10 },
      current_families: { type: Sequelize.INTEGER, defaultValue: 0 },
      min_total_kg: { type: Sequelize.DECIMAL(8, 2), allowNull: false },
      current_total_kg: { type: Sequelize.DECIMAL(8, 2), defaultValue: 0 },
      status: { type: Sequelize.ENUM('open', 'locked', 'confirmed', 'fulfilled', 'expired'), defaultValue: 'open' },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      pincode: { type: Sequelize.STRING(6), allowNull: false },
      delivery_lat: { type: Sequelize.DECIMAL(10, 8) },
      delivery_lng: { type: Sequelize.DECIMAL(11, 8) },
      delivery_address: { type: Sequelize.TEXT },
      notes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('community_baskets');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_community_baskets_status";');
  }
};
