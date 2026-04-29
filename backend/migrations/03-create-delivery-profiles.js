'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('delivery_profiles', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      vehicle_type: { type: Sequelize.ENUM('bike', 'auto', 'van'), allowNull: false },
      vehicle_number: { type: Sequelize.STRING(20), allowNull: false },
      license_number: { type: Sequelize.STRING(30), allowNull: false },
      service_radius_km: { type: Sequelize.INTEGER, defaultValue: 10 },
      is_available: { type: Sequelize.BOOLEAN, defaultValue: false },
      current_lat: { type: Sequelize.DECIMAL(10, 8) },
      current_lng: { type: Sequelize.DECIMAL(11, 8) },
      rating: { type: Sequelize.DECIMAL(3, 2), defaultValue: 5.00 },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('delivery_profiles');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_delivery_profiles_vehicle_type";');
  }
};
