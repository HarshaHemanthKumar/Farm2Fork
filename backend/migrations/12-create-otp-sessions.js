'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('otp_sessions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      phone: { type: Sequelize.STRING(15), allowNull: false },
      otp_hash: { type: Sequelize.STRING(64), allowNull: false },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      is_used: { type: Sequelize.BOOLEAN, defaultValue: false },
      attempt_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('otp_sessions');
  }
};
