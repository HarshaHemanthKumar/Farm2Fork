import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput, ScrollView } from 'react-native';
import { getListings, getCategories } from '../api';
import useListingStore from '../stores/listingStore';

const BrowseScreen = ({ navigation }) => {
  const { listings, categories, loading, filters } = useListingStore();
  const { setListings, setCategories, setLoading, setFilters } = useListingStore();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.warn('Failed to fetch categories:', err);
    }
  };

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 20, page: 1 };
      if (search.trim()) params.search = search.trim();
      if (selectedCat) params.category_id = selectedCat;
      const res = await getListings(params);
      setListings(res.data?.listings || []);
    } catch (err) {
      console.warn('Failed to fetch listings:', err);
    }
    setLoading(false);
  }, [filters, search, selectedCat]);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchListings(); }, [fetchListings]);

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.catChip, selectedCat === item.id && styles.catChipActive]}
      onPress={() => setSelectedCat(selectedCat === item.id ? null : item.id)}
    >
      <Text style={styles.catIcon}>{item.icon_url}</Text>
      <Text style={[styles.catName, selectedCat === item.id && styles.catNameActive]}>{item.name_en}</Text>
    </TouchableOpacity>
  );

  const renderListing = ({ item }) => (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.listingImage}>
        <Text style={styles.listingEmoji}>
          {item.category?.icon_url || '🥬'}
        </Text>
        {item.is_organic && (
          <View style={styles.organicBadge}>
            <Text style={styles.organicText}>🌿 Organic</Text>
          </View>
        )}
      </View>
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.farmerRow}>
          <Text style={styles.farmerName}>👨‍🌾 {item.farmer?.name || 'Farmer'}</Text>
          {item.farmer?.farmerProfile?.is_verified && (
            <Text style={styles.verifiedBadge}>✓ Verified</Text>
          )}
        </View>
        <View style={styles.listingMeta}>
          <Text style={styles.price}>₹{item.price_per_kg}<Text style={styles.priceUnit}>/{item.unit}</Text></Text>
          <Text style={styles.qty}>{item.available_qty} {item.unit} left</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search fresh produce..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchListings}
            returnKeyType="search"
            placeholderTextColor="#9E9E9E"
          />
        </View>
      </View>

      {/* Categories Horizontal */}
      <FlatList
        horizontal
        data={[{ id: null, icon_url: '🏷️', name_en: 'All' }, ...categories]}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id || 'all'}
        showsHorizontalScrollIndicator={false}
        style={styles.catList}
        contentContainerStyle={styles.catListContent}
      />

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        <Text style={styles.resultCount}>{listings.length} items found</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['newest', 'price_asc', 'price_desc'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.sortChip, filters.sort === s && styles.sortChipActive]}
              onPress={() => setFilters({ sort: s })}
            >
              <Text style={[styles.sortText, filters.sort === s && styles.sortTextActive]}>
                {s === 'newest' ? '🆕 New' : s === 'price_asc' ? '💰 Low' : '💎 High'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Listings Grid */}
      <FlatList
        data={listings}
        renderItem={renderListing}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchListings} colors={['#2E7D32']} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🌱</Text>
              <Text style={styles.emptyTitle}>No produce found</Text>
              <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFDF7' },
  searchContainer: { padding: 16, paddingBottom: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 14, paddingHorizontal: 16, borderWidth: 2, borderColor: '#E0E0E0',
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#1A1A1A' },
  catList: { maxHeight: 80 },
  catListContent: { paddingHorizontal: 12, gap: 8 },
  catChip: {
    alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 14, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E0E0E0',
    marginHorizontal: 4, minWidth: 72,
  },
  catChipActive: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  catIcon: { fontSize: 24 },
  catName: { fontSize: 11, fontWeight: '600', color: '#757575', marginTop: 2 },
  catNameActive: { color: '#2E7D32' },
  sortBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  resultCount: { fontSize: 13, color: '#9E9E9E', fontWeight: '500' },
  sortChip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, marginLeft: 6 },
  sortChipActive: { backgroundColor: '#E8F5E9' },
  sortText: { fontSize: 12, fontWeight: '600', color: '#9E9E9E' },
  sortTextActive: { color: '#2E7D32' },
  row: { gap: 12, paddingHorizontal: 16 },
  listContent: { paddingBottom: 20, gap: 12 },
  listingCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#EEEEEE', elevation: 2,
  },
  listingImage: {
    height: 120, backgroundColor: '#E8F5E9', alignItems: 'center',
    justifyContent: 'center', position: 'relative',
  },
  listingEmoji: { fontSize: 48 },
  organicBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#C8E6C9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  organicText: { fontSize: 10, fontWeight: '700', color: '#1B5E20' },
  listingInfo: { padding: 12 },
  listingTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  farmerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  farmerName: { fontSize: 12, color: '#757575' },
  verifiedBadge: { fontSize: 10, color: '#2E7D32', fontWeight: '700' },
  listingMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  price: { fontSize: 18, fontWeight: '800', color: '#1B5E20' },
  priceUnit: { fontSize: 13, fontWeight: '500', color: '#9E9E9E' },
  qty: { fontSize: 12, color: '#9E9E9E', alignSelf: 'flex-end' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#757575' },
  emptyText: { fontSize: 14, color: '#9E9E9E', marginTop: 4 },
});

export default BrowseScreen;
