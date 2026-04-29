const axios = require('axios');

// Create Axios instance with default config
const client = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: Attach JWT
let getToken = () => null;
const setTokenGetter = (fn) => { getToken = fn; };

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: Handle 401
let onUnauthorized = () => {};
const setOnUnauthorized = (fn) => { onUnauthorized = fn; };

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) onUnauthorized();
    return Promise.reject(error.response?.data || error);
  }
);

// Auth APIs
const sendOtp = (phone) => client.post('/auth/otp/send', { phone });
const verifyOtp = (phone, otp) => client.post('/auth/otp/verify', { phone, otp });
const register = (data) => client.post('/auth/register', data);
const logout = () => client.post('/auth/logout');

// Listing APIs
const getListings = (params) => client.get('/listings', { params });
const getListing = (id) => client.get(`/listings/${id}`);
const createListing = (data) => client.post('/listings', data);
const updateListing = (id, data) => client.put(`/listings/${id}`, data);
const deleteListing = (id) => client.delete(`/listings/${id}`);
const getMyListings = (params) => client.get('/listings/farmer/mine', { params });
const getCategories = () => client.get('/listings/categories');

// Order APIs
const createOrder = (data) => client.post('/orders', data);
const confirmPayment = (data) => client.post('/orders/confirm-payment', data);
const getOrder = (id) => client.get(`/orders/${id}`);
const getConsumerOrders = (params) => client.get('/orders/consumer/mine', { params });
const getFarmerOrders = (params) => client.get('/orders/farmer/mine', { params });
const farmerAcceptOrder = (id) => client.put(`/orders/${id}/farmer-accept`);
const farmerReadyOrder = (id) => client.put(`/orders/${id}/farmer-ready`);
const pickupConfirm = (id) => client.put(`/orders/${id}/pickup-confirm`);
const deliveryConfirm = (id, otp) => client.put(`/orders/${id}/delivery-confirm`, { otp });
const cancelOrder = (id, reason) => client.put(`/orders/${id}/cancel`, { reason });

// Basket APIs
const createBasket = (data) => client.post('/baskets', data);
const getBaskets = (params) => client.get('/baskets', { params });
const getBasket = (id) => client.get(`/baskets/${id}`);
const joinBasket = (id, quantity_kg) => client.post(`/baskets/${id}/join`, { quantity_kg });
const lockBasket = (id) => client.post(`/baskets/${id}/lock`);

// Delivery APIs
const updateAvailability = (data) => client.put('/delivery/availability', data);
const getMyAssignments = () => client.get('/delivery/assignments/mine');
const respondAssignment = (id, accepted) => client.put(`/delivery/assignments/${id}/respond`, { accepted });
const updateLocation = (lat, lng) => client.put('/delivery/location', { lat, lng });

// Stripe APIs
const onboardFarmer = () => client.post('/stripe/farmer/onboard');
const getFarmerStripeStatus = () => client.get('/stripe/farmer/status');

module.exports = {
  client, setTokenGetter, setOnUnauthorized,
  sendOtp, verifyOtp, register, logout,
  getListings, getListing, createListing, updateListing, deleteListing, getMyListings, getCategories,
  createOrder, confirmPayment, getOrder, getConsumerOrders, getFarmerOrders,
  farmerAcceptOrder, farmerReadyOrder, pickupConfirm, deliveryConfirm, cancelOrder,
  createBasket, getBaskets, getBasket, joinBasket, lockBasket,
  updateAvailability, getMyAssignments, respondAssignment, updateLocation,
  onboardFarmer, getFarmerStripeStatus
};
