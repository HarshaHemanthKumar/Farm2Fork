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
export const updateAvailability = (data) => api.put('/delivery/availability', data);
export const getMyAssignments = () => api.get('/delivery/assignments/mine');
export const respondAssignment = (id, accepted) => api.put(`/delivery/assignments/${id}/respond`, { accepted });
export const updateLocation = (lat, lng) => api.put('/delivery/location', { lat, lng });
export const pickupConfirm = (id) => api.put(`/orders/${id}/pickup-confirm`);
export const deliveryConfirm = (id, otp) => api.put(`/orders/${id}/delivery-confirm`, { otp });

export default api;
