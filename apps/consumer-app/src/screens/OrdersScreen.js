import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { getConsumerOrders } from '../api';

const STATUS_COLORS = {
  pending_payment: { bg: '#FFF3E0', text: '#E65100', label: 'Pending Payment' },
  confirmed: { bg: '#E3F2FD', text: '#1565C0', label: 'Confirmed' },
  farmer_accepted: { bg: '#E8F5E9', text: '#2E7D32', label: 'Farmer Accepted' },
  ready_for_pickup: { bg: '#FFF3E0', text: '#E65100', label: 'Ready for Pickup' },
  picked_up: { bg: '#E3F2FD', text: '#1565C0', label: 'Out for Delivery' },
  delivered: { bg: '#E8F5E9', text: '#1B5E20', label: 'Delivered ✓' },
  cancelled: { bg: '#FFEBEE', text: '#C62828', label: 'Cancelled' },
  refunded: { bg: '#F5F5F5', text: '#757575', label: 'Refunded' },
};

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      const res = await getConsumerOrders(params);
      setOrders(res.data?.orders || []);
    } catch (err) {
      console.warn('Failed to fetch orders:', err);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const renderOrder = ({ item }) => {
    const status = STATUS_COLORS[item.status] || STATUS_COLORS.confirmed;
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { id: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.orderIcon}>
          <Text style={styles.orderEmoji}>{item.listing?.images?.[0] ? '📦' : '🥬'}</Text>
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.orderTitle} numberOfLines={1}>{item.listing?.title || 'Order'}</Text>
          <Text style={styles.orderSub}>{item.quantity} {item.listing?.unit || 'kg'} • {item.farmerUser?.name || 'Farmer'}</Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>
        <View style={styles.orderRight}>
          <Text style={styles.orderAmount}>₹{parseFloat(item.total_amount).toFixed(0)}</Text>
          <Text style={styles.orderDate}>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const filters = ['all', 'confirmed', 'picked_up', 'delivered', 'cancelled'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      {/* Filters */}
      <FlatList
        horizontal
        data={filters}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : STATUS_COLORS[f]?.label || f}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      />

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} colors={['#2E7D32']} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptyText}>Start browsing fresh produce!</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFDF7' },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#1B5E20', letterSpacing: -0.5 },
  filters: { maxHeight: 48, marginBottom: 8 },
  filterChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0' },
  filterActive: { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#9E9E9E' },
  filterTextActive: { color: '#2E7D32' },
  list: { padding: 16, gap: 12 },
  orderCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: '#EEEEEE', elevation: 1, gap: 12,
  },
  orderIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  orderEmoji: { fontSize: 24 },
  orderInfo: { flex: 1, gap: 3 },
  orderTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  orderSub: { fontSize: 12, color: '#757575' },
  badge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  orderRight: { alignItems: 'flex-end' },
  orderAmount: { fontSize: 17, fontWeight: '800', color: '#1B5E20' },
  orderDate: { fontSize: 11, color: '#9E9E9E', marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#757575' },
  emptyText: { fontSize: 14, color: '#9E9E9E', marginTop: 4 },
});

export default OrdersScreen;
