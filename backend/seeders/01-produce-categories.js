'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('produce_categories', [
      { id: uuidv4(), name_en: 'Tomato', name_hi: 'टमाटर', icon_url: '🍅', display_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), name_en: 'Potato', name_hi: 'आलू', icon_url: '🥔', display_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), name_en: 'Onion', name_hi: 'प्याज', icon_url: '🧅', display_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), name_en: 'Spinach', name_hi: 'पालक', icon_url: '🥬', display_order: 4, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), name_en: 'Cabbage', name_hi: 'पत्ता गोभी', icon_url: '🥗', display_order: 5, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), name_en: 'Carrot', name_hi: 'गाजर', icon_url: '🥕', display_order: 6, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), name_en: 'Brinjal', name_hi: 'बैंगन', icon_url: '🍆', display_order: 7, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), name_en: 'Okra', name_hi: 'भिंडी', icon_url: '🌿', display_order: 8, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), name_en: 'Green Chilli', name_hi: 'हरी मिर्च', icon_url: '🌶️', display_order: 9, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), name_en: 'Banana', name_hi: 'केला', icon_url: '🍌', display_order: 10, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), name_en: 'Mango', name_hi: 'आम', icon_url: '🥭', display_order: 11, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), name_en: 'Cauliflower', name_hi: 'फूलगोभी', icon_url: '🥦', display_order: 12, created_at: new Date(), updated_at: new Date() }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('produce_categories', null, {});
  }
};
