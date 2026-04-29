import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { getMyListings, deleteListing } from '../api';

const DashboardScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({ totalSold: 0, totalRevenue: 0, activeCount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyListings({});
      setListings(res.data?.listings || []);
      if (res.data?.stats) setStats(res.data.stats);
    } catch (err) { console.warn(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id) => {
    Alert.alert('Delete Listing', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteListing(id); fetchData(); } catch (e) { Alert.alert('Error', 'Failed to delete'); }
      }},
    ]);
  };

  const renderListing = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EditListing', { listing: item })} activeOpacity={0.8}>
      <View style={styles.cardImage}>
        <Text style={styles.cardEmoji}>{item.category?.icon_url || '🌿'}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardMeta}>₹{item.price_per_kg}/{item.unit} • {item.available_qty} left</Text>
        <View style={styles.cardBottom}>
          <View style={[styles.statusBadge, item.status === 'active' ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={[styles.statusText, item.status === 'active' ? styles.textActive : styles.textInactive]}>
              {item.status === 'active' ? '● Active' : item.status}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={styles.deleteBtn}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.statIcon}>📦</Text>
          <Text style={styles.statValue}>{stats.activeCount}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.statIcon}>⚖️</Text>
          <Text style={styles.statValue}>{stats.totalSold.toFixed(0)}kg</Text>
          <Text style={styles.statLabel}>Total Sold</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>₹{stats.totalRevenue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      {/* Listings Header */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>My Listings ({listings.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateListing')}>
          <Text style={styles.addBtnText}>+ New Listing</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={listings}
        renderItem={renderListing}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} colors={['#2E7D32']} />}
        ListEmptyComponent={!loading && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌾</Text>
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptyText}>Tap "New Listing" to sell your produce</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFDF7' },
  statsRow: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#757575', fontWeight: '600', marginTop: 2 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  listTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  addBtn: { backgroundColor: '#2E7D32', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: '#EEEEEE', overflow: 'hidden', elevation: 1 },
  cardImage: { width: 90, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 36 },
  cardInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  cardMeta: { fontSize: 13, color: '#757575', marginTop: 4 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  badgeActive: { backgroundColor: '#E8F5E9' },
  badgeInactive: { backgroundColor: '#F5F5F5' },
  statusText: { fontSize: 11, fontWeight: '700' },
  textActive: { color: '#2E7D32' },
  textInactive: { color: '#757575' },
  deleteBtn: { fontSize: 18, padding: 4 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#757575' },
  emptyText: { fontSize: 14, color: '#9E9E9E', marginTop: 4 },
});

export default DashboardScreen;
