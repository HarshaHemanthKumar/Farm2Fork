import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { getFarmerOrders, farmerAcceptOrder, farmerReadyOrder } from '../api';

const STATUS_MAP = {
  confirmed: { bg: '#E3F2FD', text: '#1565C0', label: 'New Order', action: 'Accept', emoji: '🔔' },
  farmer_accepted: { bg: '#FFF3E0', text: '#E65100', label: 'Accepted', action: 'Mark Ready', emoji: '✅' },
  ready_for_pickup: { bg: '#E8F5E9', text: '#2E7D32', label: 'Ready', action: null, emoji: '📦' },
  picked_up: { bg: '#E3F2FD', text: '#1565C0', label: 'Picked Up', action: null, emoji: '🛵' },
  delivered: { bg: '#E8F5E9', text: '#1B5E20', label: 'Delivered', action: null, emoji: '✓' },
  cancelled: { bg: '#FFEBEE', text: '#C62828', label: 'Cancelled', action: null, emoji: '✕' },
};

const FarmerOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFarmerOrders({});
      setOrders(res.data?.orders || []);
    } catch (err) { console.warn(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, []);

  const handleAction = async (order) => {
    const status = order.status;
    try {
      if (status === 'confirmed') {
        await farmerAcceptOrder(order.id);
        Alert.alert('Accepted!', 'Delivery partner will be assigned soon.');
      } else if (status === 'farmer_accepted') {
        await farmerReadyOrder(order.id);
        Alert.alert('Ready!', 'Delivery partner notified for pickup.');
      }
      fetchOrders();
    } catch (err) {
      Alert.alert('Error', err?.error?.message || 'Action failed');
    }
  };

  const renderOrder = ({ item }) => {
    const s = STATUS_MAP[item.status] || STATUS_MAP.confirmed;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.orderIdRow}>
            <Text style={styles.emoji}>{s.emoji}</Text>
            <Text style={styles.orderId}>Order #{item.id?.slice(-6)}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.listingName}>{item.listing?.title || 'Produce'}</Text>
          <Text style={styles.meta}>👤 {item.consumer?.name || 'Consumer'} • {item.quantity} {item.listing?.unit || 'kg'}</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amount}>₹{parseFloat(item.total_amount).toFixed(0)}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>
        {s.action && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(item)}>
            <Text style={styles.actionText}>{s.action}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>{orders.filter(o => o.status === 'confirmed').length} new</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} colors={['#2E7D32']} />}
        ListEmptyComponent={!loading && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📬</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFDF7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', padding: 20, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#1B5E20' },
  subtitle: { fontSize: 14, fontWeight: '600', color: '#E65100' },
  list: { padding: 16, gap: 12, paddingBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#EEEEEE', elevation: 1, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingBottom: 0 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emoji: { fontSize: 18 },
  orderId: { fontSize: 13, fontWeight: '600', color: '#757575' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 14, paddingTop: 8 },
  listingName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  meta: { fontSize: 13, color: '#757575', marginTop: 4 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  amount: { fontSize: 18, fontWeight: '800', color: '#1B5E20' },
  date: { fontSize: 12, color: '#9E9E9E', alignSelf: 'flex-end' },
  actionBtn: { backgroundColor: '#2E7D32', padding: 14, alignItems: 'center' },
  actionText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#757575' },
});

export default FarmerOrdersScreen;
