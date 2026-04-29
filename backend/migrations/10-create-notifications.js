'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      title: { type: Sequelize.STRING(200), allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: false },
      type: { type: Sequelize.STRING(50), allowNull: false },
      data: { type: Sequelize.JSONB },
      is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
      sent_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('notifications'); }
};
