'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('basket_members', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      basket_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'community_baskets', key: 'id' } },
      consumer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      order_id: { type: Sequelize.UUID, references: { model: 'orders', key: 'id' } },
      quantity_kg: { type: Sequelize.DECIMAL(8, 2), allowNull: false },
      joined_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });
    await queryInterface.addConstraint('basket_members', {
      fields: ['basket_id', 'consumer_id'],
      type: 'unique',
      name: 'unique_basket_consumer'
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('basket_members'); }
};
