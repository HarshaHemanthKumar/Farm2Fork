import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://172.16.10.33:3000/api/v1';
const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((res) => res.data, (err) => {
  if (err.response?.status === 401) { AsyncStorage.removeItem('auth_token'); AsyncStorage.removeItem('auth_user'); }
  return Promise.reject(err.response?.data || err);
});

export const sendOtp = (phone) => api.post('/auth/otp/send', { phone });
export const verifyOtp = (phone, otp) => api.post('/auth/otp/verify', { phone, otp });
export const register = (data) => api.post('/auth/register', data);
export const getMyListings = (params) => api.get('/listings/farmer/mine', { params });
export const createListing = (data) => api.post('/listings', data);
export const updateListing = (id, data) => api.put(`/listings/${id}`, data);
export const deleteListing = (id) => api.delete(`/listings/${id}`);
export const getCategories = () => api.get('/listings/categories');
export const getFarmerOrders = (params) => api.get('/orders/farmer/mine', { params });
export const farmerAcceptOrder = (id) => api.put(`/orders/${id}/farmer-accept`);
export const farmerReadyOrder = (id) => api.put(`/orders/${id}/farmer-ready`);
export const onboardStripe = () => api.post('/stripe/farmer/onboard');
export const getStripeStatus = () => api.get('/stripe/farmer/status');

export default api;
