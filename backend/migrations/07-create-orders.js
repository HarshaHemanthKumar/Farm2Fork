'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('uuid_generate_v4()'), primaryKey: true },
      consumer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      listing_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'listings', key: 'id' } },
      farmer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      delivery_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' } },
      basket_id: { type: Sequelize.UUID, references: { model: 'community_baskets', key: 'id' } },
      quantity: { type: Sequelize.DECIMAL(8, 2), allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(8, 2), allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      delivery_fee: { type: Sequelize.DECIMAL(8, 2), allowNull: false, defaultValue: 0 },
      platform_fee: { type: Sequelize.DECIMAL(8, 2), allowNull: false, defaultValue: 0 },
      total_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: {
        type: Sequelize.ENUM('pending_payment', 'payment_failed', 'confirmed', 'farmer_accepted',
          'ready_for_pickup', 'picked_up', 'delivered', 'cancelled', 'refunded'),
        defaultValue: 'pending_payment'
      },
      delivery_address: { type: Sequelize.TEXT, allowNull: false },
      delivery_lat: { type: Sequelize.DECIMAL(10, 8), allowNull: false },
      delivery_lng: { type: Sequelize.DECIMAL(11, 8), allowNull: false },
      stripe_payment_intent_id: { type: Sequelize.STRING(100) },
      stripe_transfer_id: { type: Sequelize.STRING(100) },
      farmer_payout_amount: { type: Sequelize.DECIMAL(10, 2) },
      delivery_instructions: { type: Sequelize.TEXT },
      otp_for_delivery: { type: Sequelize.STRING(6) },
      delivered_at: { type: Sequelize.DATE },
      cancelled_at: { type: Sequelize.DATE },
      cancellation_reason: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('orders');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_status";');
  }
};
