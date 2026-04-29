import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { getListing, createOrder, confirmPayment } from '../api';

const ListingDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getListing(id);
        setListing(res.data?.listing);
        setReviews(res.data?.reviews || []);
      } catch (err) {
        Alert.alert('Error', 'Failed to load listing');
        navigation.goBack();
      }
      setLoading(false);
    })();
  }, [id]);

  const handleOrder = async () => {
    const qty = parseFloat(quantity);
    if (!qty || qty < 0.5) return Alert.alert('Error', 'Minimum order is 0.5 kg');
    if (qty > parseFloat(listing.available_qty)) return Alert.alert('Error', 'Not enough stock');

    setOrdering(true);
    try {
      const orderRes = await createOrder({
        listing_id: listing.id,
        quantity: qty,
        delivery_address: 'Default address',
        delivery_lat: 28.6139,
        delivery_lng: 77.2090,
      });

      const orderId = orderRes.data?.order?.id;
      if (orderRes.data?.payment_intent_id) {
        await confirmPayment({
          order_id: orderId,
          payment_intent_id: orderRes.data.payment_intent_id,
        });
      } else {
        await confirmPayment({ order_id: orderId, payment_intent_id: null });
      }

      Alert.alert('Order Placed! 🎉', 'Your order has been placed successfully.', [
        { text: 'View Orders', onPress: () => navigation.navigate('OrdersTab') },
        { text: 'Continue Shopping' },
      ]);
    } catch (err) {
      Alert.alert('Error', err?.error?.message || 'Failed to place order');
    }
    setOrdering(false);
  };

  if (loading || !listing) {
    return <View style={styles.loading}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  const total = (parseFloat(quantity || 0) * parseFloat(listing.price_per_kg)).toFixed(2);
  const platformFee = (total * 0.05).toFixed(2);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroImage}>
          <Text style={styles.heroEmoji}>{listing.category?.icon_url || '🥬'}</Text>
          {listing.is_organic && (
            <View style={styles.organicBadge}>
              <Text style={styles.organicText}>🌿 100% Organic</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Title & Price */}
          <Text style={styles.title}>{listing.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{listing.price_per_kg}</Text>
            <Text style={styles.unit}>per {listing.unit}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{listing.available_qty} {listing.unit} available</Text>
            </View>
          </View>

          {/* Farmer Info */}
          <TouchableOpacity style={styles.farmerCard}>
            <View style={styles.farmerAvatar}>
              <Text style={styles.farmerAvatarText}>👨‍🌾</Text>
            </View>
            <View style={styles.farmerInfo}>
              <Text style={styles.farmerName}>{listing.farmer?.name || 'Unknown Farmer'}</Text>
              <Text style={styles.farmName}>
                {listing.farmer?.farmerProfile?.farm_name || 'Local Farm'}
                {listing.farmer?.farmerProfile?.is_verified && ' ✓'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Description */}
          {listing.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this produce</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>
          )}

          {/* Harvest Info */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoLabel}>Harvested</Text>
              <Text style={styles.infoValue}>{listing.harvest_date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>⏰</Text>
              <Text style={styles.infoLabel}>Expires</Text>
              <Text style={styles.infoValue}>{listing.expiry_date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoLabel}>Pincode</Text>
              <Text style={styles.infoValue}>{listing.pincode}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>👁️</Text>
              <Text style={styles.infoLabel}>Views</Text>
              <Text style={styles.infoValue}>{listing.view_count}</Text>
            </View>
          </View>

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
              {reviews.slice(0, 3).map((r) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{r.reviewer?.name}</Text>
                    <Text style={styles.reviewRating}>{'⭐'.repeat(r.rating)}</Text>
                  </View>
                  {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Order Bar */}
      <View style={styles.orderBar}>
        <View style={styles.qtySection}>
          <Text style={styles.qtyLabel}>Qty ({listing.unit})</Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => {
              const q = Math.max(0.5, parseFloat(quantity || 0) - 0.5);
              setQuantity(q.toString());
            }}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.qtyInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
            />
            <TouchableOpacity style={styles.qtyBtn} onPress={() => {
              const q = Math.min(parseFloat(listing.available_qty), parseFloat(quantity || 0) + 0.5);
              setQuantity(q.toString());
            }}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={[styles.orderBtn, ordering && { opacity: 0.6 }]} onPress={ordering ? null : handleOrder}>
          <Text style={styles.orderBtnPrice}>₹{total}</Text>
          <Text style={styles.orderBtnText}>{ordering ? 'Placing...' : 'Order Now'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFDF7' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9E9E9E', fontSize: 16 },
  heroImage: { height: 220, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  heroEmoji: { fontSize: 80 },
  organicBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: '#C8E6C9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  organicText: { fontSize: 12, fontWeight: '700', color: '#1B5E20' },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.5 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 8 },
  price: { fontSize: 28, fontWeight: '900', color: '#1B5E20' },
  unit: { fontSize: 16, color: '#757575' },
  statusBadge: { marginLeft: 'auto', backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  farmerCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14,
    padding: 14, marginTop: 16, borderWidth: 1, borderColor: '#EEEEEE', elevation: 1,
  },
  farmerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  farmerAvatarText: { fontSize: 24 },
  farmerInfo: { marginLeft: 12, flex: 1 },
  farmerName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  farmName: { fontSize: 13, color: '#757575', marginTop: 2 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  description: { fontSize: 15, color: '#616161', lineHeight: 22 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  infoItem: { flex: 1, minWidth: '45%', backgroundColor: '#FFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#EEEEEE', alignItems: 'center' },
  infoIcon: { fontSize: 20 },
  infoLabel: { fontSize: 11, color: '#9E9E9E', marginTop: 4 },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#424242', marginTop: 2 },
  reviewCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#EEEEEE' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewerName: { fontWeight: '600', fontSize: 14 },
  reviewRating: { fontSize: 12 },
  reviewComment: { fontSize: 14, color: '#616161', marginTop: 6 },
  orderBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: '#E0E0E0', padding: 16, paddingBottom: 24, gap: 12,
  },
  qtySection: { flex: 1 },
  qtyLabel: { fontSize: 11, color: '#9E9E9E', fontWeight: '600', marginBottom: 4 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 18, fontWeight: '700', color: '#2E7D32' },
  qtyInput: { width: 50, textAlign: 'center', fontSize: 18, fontWeight: '700', borderBottomWidth: 2, borderBottomColor: '#2E7D32', color: '#1A1A1A' },
  orderBtn: { backgroundColor: '#2E7D32', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center' },
  orderBtnPrice: { color: '#C8E6C9', fontSize: 13, fontWeight: '600' },
  orderBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});

export default ListingDetailScreen;
