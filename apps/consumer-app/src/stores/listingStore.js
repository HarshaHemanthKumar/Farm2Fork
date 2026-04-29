import { create } from 'zustand';

const useListingStore = create((set) => ({
  listings: [],
  categories: [],
  currentListing: null,
  loading: false,
  filters: { pincode: '', category_id: '', is_organic: false, sort: 'newest' },

  setListings: (listings) => set({ listings }),
  setCategories: (categories) => set({ categories }),
  setCurrentListing: (listing) => set({ currentListing: listing }),
  setLoading: (loading) => set({ loading }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
}));

export default useListingStore;
