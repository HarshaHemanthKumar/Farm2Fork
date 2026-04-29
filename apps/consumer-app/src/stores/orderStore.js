import { create } from 'zustand';

const useOrderStore = create((set) => ({
  orders: [],
  activeOrders: [],
  currentOrder: null,
  loading: false,

  setOrders: (orders) => set({ orders }),
  setActiveOrders: (activeOrders) => set({ activeOrders }),
  setCurrentOrder: (order) => set({ currentOrder: order }),
  setLoading: (loading) => set({ loading }),
}));

export default useOrderStore;
