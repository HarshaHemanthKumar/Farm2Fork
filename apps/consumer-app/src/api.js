import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Using ADB reverse: phone's localhost:3000 tunnels to PC's localhost:3000
const API_BASE = 'http://localhost:3000/api/v1';

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      AsyncStorage.removeItem('auth_token');
      AsyncStorage.removeItem('auth_user');
    }
    return Promise.reject(err.response?.data || err);
  }
);

// Auth
export const sendOtp = (phone) => api.post('/auth/otp/send', { phone });
export const verifyOtp = (phone, otp) => api.post('/auth/otp/verify', { phone, otp });
export const register = (data) => api.post('/auth/register', data);

// Listings
export const getListings = (params) => api.get('/listings', { params });
export const getListing = (id) => api.get(`/listings/${id}`);
export const getCategories = () => api.get('/listings/categories');

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const confirmPayment = (data) => api.post('/orders/confirm-payment', data);
export const getConsumerOrders = (params) => api.get('/orders/consumer/mine', { params });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const cancelOrder = (id, reason) => api.put(`/orders/${id}/cancel`, { reason });

// Baskets
export const getBaskets = (params) => api.get('/baskets', { params });
export const getBasket = (id) => api.get(`/baskets/${id}`);
export const createBasket = (data) => api.post('/baskets', data);
export const joinBasket = (id, qty) => api.post(`/baskets/${id}/join`, { quantity_kg: qty });

export default api;
