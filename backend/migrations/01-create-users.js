'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Enable UUID extension
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      phone: { type: Sequelize.STRING(15), unique: true, allowNull: false },
      name: { type: Sequelize.STRING(100), allowNull: false },
      role: { type: Sequelize.ENUM('farmer', 'consumer', 'delivery', 'admin'), allowNull: false },
      profile_photo: { type: Sequelize.TEXT },
      language: { type: Sequelize.STRING(5), defaultValue: 'en' },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      stripe_customer_id: { type: Sequelize.STRING(100) },
      stripe_account_id: { type: Sequelize.STRING(100) },
      stripe_onboarding_complete: { type: Sequelize.BOOLEAN, defaultValue: false },
      fcm_token: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      deleted_at: { type: Sequelize.DATE }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  }
};
