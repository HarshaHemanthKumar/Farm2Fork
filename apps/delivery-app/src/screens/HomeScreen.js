import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Switch, Alert } from 'react-native';
import { getMyAssignments, respondAssignment, updateAvailability, pickupConfirm, deliveryConfirm } from '../api';
import useAuthStore from '../stores/authStore';

const HomeScreen = () => {
  const [assignments, setAssignments] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyAssignments();
      setAssignments(res.data?.assignments || []);
    } catch (e) { console.warn(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAssignments(); }, []);

  const toggleOnline = async (val) => {
    setIsOnline(val);
    try {
      await updateAvailability({ is_available: val, lat: 28.6139, lng: 77.2090 });
    } catch (e) { setIsOnline(!val); }
  };

  const handleRespond = async (id, accepted) => {
    try {
      await respondAssignment(id, accepted);
      Alert.alert(accepted ? 'Accepted! 🎉' : 'Rejected', accepted ? 'Head to the pickup location.' : 'Assignment declined.');
      fetchAssignments();
    } catch (e) { Alert.alert('Error', 'Failed to respond'); }
  };

  const handlePickup = async (orderId) => {
    try {
      await pickupConfirm(orderId);
      Alert.alert('Picked Up!', 'Head to the delivery address.');
      fetchAssignments();
    } catch (e) { Alert.alert('Error', e?.error?.message || 'Pickup failed'); }
  };

  const handleDeliver = (orderId) => {
    Alert.prompt?.('Delivery OTP', 'Enter the 6-digit OTP from consumer:', async (otp) => {
      try {
        await deliveryConfirm(orderId, otp);
        Alert.alert('Delivered! 🎉', 'Earnings have been credited.');
        fetchAssignments();
      } catch (e) { Alert.alert('Error', e?.error?.message || 'Invalid OTP'); }
    }) || Alert.alert('Deliver', 'Use the OTP verification on the order detail screen.');
  };

  const activeAssignments = assignments.filter(a => ['offered', 'accepted'].includes(a.status));
  const completedAssignments = assignments.filter(a => ['completed', 'rejected'].includes(a.status));

  const renderAssignment = ({ item }) => {
    const order = item.order || {};
    const isOffered = item.status === 'offered';
    const isAccepted = item.status === 'accepted';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.earningsRow}>
            <Text style={styles.earnings}>₹{parseFloat(item.earnings || 0).toFixed(0)}</Text>
            <Text style={styles.earningsLabel}>earnings</Text>
          </View>
          <View style={[styles.badge, isOffered ? styles.badgeNew : isAccepted ? styles.badgeActive : styles.badgeDone]}>
            <Text style={styles.badgeText}>{item.status === 'offered' ? '🔔 New' : item.status === 'accepted' ? '🚴 Active' : item.status === 'completed' ? '✓ Done' : '✕ Rejected'}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.orderTitle}>{order.listing?.title || 'Order'}</Text>
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.addressText} numberOfLines={2}>{order.delivery_address || 'Address not available'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detail}>👤 {order.consumer?.name || 'Consumer'}</Text>
            <Text style={styles.detail}>📞 {order.consumer?.phone || ''}</Text>
          </View>
        </View>

        {isOffered && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRespond(item.id, false)}>
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleRespond(item.id, true)}>
              <Text style={styles.acceptText}>Accept ✓</Text>
            </TouchableOpacity>
          </View>
        )}

        {isAccepted && order.status === 'ready_for_pickup' && (
          <TouchableOpacity style={styles.pickupBtn} onPress={() => handlePickup(order.id)}>
            <Text style={styles.pickupText}>📦 Confirm Pickup</Text>
          </TouchableOpacity>
        )}

        {isAccepted && order.status === 'picked_up' && (
          <TouchableOpacity style={styles.deliverBtn} onPress={() => handleDeliver(order.id)}>
            <Text style={styles.deliverText}>🏠 Confirm Delivery (OTP)</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Online Toggle */}
      <View style={styles.statusBar}>
        <View>
          <Text style={styles.statusTitle}>{isOnline ? '🟢 Online' : '🔴 Offline'}</Text>
          <Text style={styles.statusDesc}>{isOnline ? 'Accepting deliveries' : 'Not accepting deliveries'}</Text>
        </View>
        <Switch value={isOnline} onValueChange={toggleOnline} trackColor={{ true: '#C8E6C9' }} thumbColor={isOnline ? '#2E7D32' : '#BDBDBD'} />
      </View>

      {/* Active Assignments */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active ({activeAssignments.length})</Text>
      </View>

      <FlatList
        data={activeAssignments}
        renderItem={renderAssignment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAssignments} colors={['#2E7D32']} />}
        ListEmptyComponent={!loading && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛵</Text>
            <Text style={styles.emptyTitle}>{isOnline ? 'Waiting for assignments...' : 'Go online to receive assignments'}</Text>
          </View>
        )}
        ListFooterComponent={completedAssignments.length > 0 && (
          <View>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>History ({completedAssignments.length})</Text></View>
            {completedAssignments.slice(0, 5).map(a => (
              <View key={a.id} style={[styles.card, { opacity: 0.7 }]}>
                <View style={styles.cardBody}>
                  <Text style={styles.orderTitle}>{a.order?.listing?.title || 'Order'}</Text>
                  <Text style={styles.detail}>{a.status} • ₹{parseFloat(a.earnings || 0).toFixed(0)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFDF7' },
  statusBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEEEEE',
  },
  statusTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  statusDesc: { fontSize: 13, color: '#757575', marginTop: 2 },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#424242' },
  list: { padding: 16, gap: 12, paddingBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#EEEEEE', elevation: 1, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingBottom: 0 },
  earningsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  earnings: { fontSize: 22, fontWeight: '800', color: '#1B5E20' },
  earningsLabel: { fontSize: 12, color: '#757575' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  badgeNew: { backgroundColor: '#FFF3E0' },
  badgeActive: { backgroundColor: '#E3F2FD' },
  badgeDone: { backgroundColor: '#E8F5E9' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#424242' },
  cardBody: { padding: 14, paddingTop: 8 },
  orderTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  addressRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  addressIcon: { fontSize: 14 },
  addressText: { flex: 1, fontSize: 13, color: '#616161' },
  detailRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  detail: { fontSize: 13, color: '#757575' },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  rejectBtn: { flex: 1, padding: 14, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#EEEEEE' },
  rejectText: { fontWeight: '700', color: '#C62828', fontSize: 15 },
  acceptBtn: { flex: 1, padding: 14, alignItems: 'center', backgroundColor: '#E8F5E9' },
  acceptText: { fontWeight: '700', color: '#2E7D32', fontSize: 15 },
  pickupBtn: { backgroundColor: '#FF9800', padding: 14, alignItems: 'center' },
  pickupText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  deliverBtn: { backgroundColor: '#2E7D32', padding: 14, alignItems: 'center' },
  deliverText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.5 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#757575', textAlign: 'center', paddingHorizontal: 32 },
});

export default HomeScreen;
