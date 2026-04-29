'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('delivery_assignments', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      order_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'orders', key: 'id' } },
      delivery_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      status: { type: Sequelize.ENUM('offered', 'accepted', 'rejected', 'completed'), defaultValue: 'offered' },
      offered_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      accepted_at: { type: Sequelize.DATE },
      completed_at: { type: Sequelize.DATE },
      earnings: { type: Sequelize.DECIMAL(8, 2) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('delivery_assignments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_delivery_assignments_status";');
  }
};
