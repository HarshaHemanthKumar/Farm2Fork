'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reviews', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      order_id: { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'orders', key: 'id' } },
      reviewer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      reviewee_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      rating: { type: Sequelize.INTEGER, allowNull: false },
      comment: { type: Sequelize.TEXT },
      type: { type: Sequelize.ENUM('consumer_to_farmer', 'consumer_to_delivery', 'farmer_to_consumer') },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('reviews');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reviews_type";');
  }
};
