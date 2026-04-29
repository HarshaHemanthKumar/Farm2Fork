'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('produce_categories', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      name_en: { type: Sequelize.STRING(100), allowNull: false },
      name_hi: { type: Sequelize.STRING(100), allowNull: false },
      icon_url: { type: Sequelize.TEXT },
      display_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('produce_categories'); }
};
