import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create((set) => ({
  user: null, token: null, isLoading: true,
  setAuth: (user, token) => {
    set({ user, token, isLoading: false });
    AsyncStorage.setItem('auth_token', token);
    AsyncStorage.setItem('auth_user', JSON.stringify(user));
  },
  loadAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userStr = await AsyncStorage.getItem('auth_user');
      if (token && userStr) set({ token, user: JSON.parse(userStr), isLoading: false });
      else set({ isLoading: false });
    } catch { set({ isLoading: false }); }
  },
  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
