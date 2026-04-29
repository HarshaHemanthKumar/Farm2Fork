'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('farmer_profiles', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      farm_name: { type: Sequelize.STRING(150), allowNull: false },
      farm_address: { type: Sequelize.TEXT, allowNull: false },
      farm_lat: { type: Sequelize.DECIMAL(10, 8), allowNull: false },
      farm_lng: { type: Sequelize.DECIMAL(11, 8), allowNull: false },
      farm_size_acres: { type: Sequelize.DECIMAL(6, 2) },
      description: { type: Sequelize.TEXT },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      bank_account_last4: { type: Sequelize.STRING(4) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('farmer_profiles'); }
};
