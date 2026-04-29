const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Calculate delivery fee based on road distance between farm and consumer
 * Uses Google Maps Distance Matrix API for actual road distance
 * Falls back to Haversine calculation if API is unavailable
 *
 * Fee Structure (INR):
 *   0–3 km    → ₹15 flat
 *   3–7 km    → ₹25 flat
 *   7–15 km   → ₹35 flat
 *   15–25 km  → ₹50 flat
 *   >25 km    → ₹50 + ₹2 per km beyond 25km
 *   Minimum   → ₹15
 */
async function calculateDeliveryFee(farmLat, farmLng, consumerLat, consumerLng) {
  let distanceKm;

  try {
    if (process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_MAPS_API_KEY !== 'placeholder') {
      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins: `${farmLat},${farmLng}`,
          destinations: `${consumerLat},${consumerLng}`,
          mode: 'driving',
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });

      const element = response.data.rows?.[0]?.elements?.[0];
      if (element && element.status === 'OK') {
        distanceKm = element.distance.value / 1000; // meters to km
        logger.info(`Delivery distance (Google Maps): ${distanceKm.toFixed(2)} km`);
      } else {
        throw new Error('Distance Matrix returned no results');
      }
    } else {
      throw new Error('Google Maps API key not configured');
    }
  } catch (err) {
    // Fallback: Haversine formula
    logger.warn(`Google Maps API unavailable, using Haversine fallback: ${err.message}`);
    distanceKm = haversineDistance(farmLat, farmLng, consumerLat, consumerLng);
    logger.info(`Delivery distance (Haversine): ${distanceKm.toFixed(2)} km`);
  }

  return getFeeForDistance(distanceKm);
}

/**
 * Haversine distance calculation (fallback)
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Fee structure lookup
 */
function getFeeForDistance(distanceKm) {
  if (distanceKm <= 3) return 15;
  if (distanceKm <= 7) return 25;
  if (distanceKm <= 15) return 35;
  if (distanceKm <= 25) return 50;
  // Beyond 25 km: ₹50 + ₹2 per km beyond 25
  return 50 + Math.ceil(distanceKm - 25) * 2;
}

module.exports = { calculateDeliveryFee, haversineDistance, getFeeForDistance };
