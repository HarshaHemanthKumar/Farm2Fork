'use strict';
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addIndex('listings', ['farmer_id'], { name: 'idx_listings_farmer' });
    await queryInterface.addIndex('listings', ['status'], { name: 'idx_listings_status' });
    await queryInterface.addIndex('listings', ['pincode'], { name: 'idx_listings_pincode' });
    await queryInterface.addIndex('listings', ['lat', 'lng'], { name: 'idx_listings_latlong' });
    await queryInterface.addIndex('orders', ['consumer_id'], { name: 'idx_orders_consumer' });
    await queryInterface.addIndex('orders', ['farmer_id'], { name: 'idx_orders_farmer' });
    await queryInterface.addIndex('orders', ['status'], { name: 'idx_orders_status' });
    await queryInterface.addIndex('basket_members', ['basket_id'], { name: 'idx_basket_members_basket' });
    await queryInterface.addIndex('notifications', ['user_id', 'is_read'], { name: 'idx_notifications_user' });
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('listings', 'idx_listings_farmer');
    await queryInterface.removeIndex('listings', 'idx_listings_status');
    await queryInterface.removeIndex('listings', 'idx_listings_pincode');
    await queryInterface.removeIndex('listings', 'idx_listings_latlong');
    await queryInterface.removeIndex('orders', 'idx_orders_consumer');
    await queryInterface.removeIndex('orders', 'idx_orders_farmer');
    await queryInterface.removeIndex('orders', 'idx_orders_status');
    await queryInterface.removeIndex('basket_members', 'idx_basket_members_basket');
    await queryInterface.removeIndex('notifications', 'idx_notifications_user');
  }
};
