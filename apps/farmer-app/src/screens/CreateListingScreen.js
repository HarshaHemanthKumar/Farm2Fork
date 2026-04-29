import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { createListing, getCategories } from '../api';

const CreateListingScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', price_per_kg: '', unit: 'kg', available_qty: '',
    min_order_qty: '0.5', category_id: '', pincode: '', is_organic: false,
    harvest_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCategories();
        setCategories(res.data?.categories || []);
      } catch (e) { console.warn(e); }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.price_per_kg || !form.available_qty || !form.category_id || !form.pincode) {
      return Alert.alert('Error', 'Please fill all required fields');
    }
    setLoading(true);
    try {
      await createListing({
        ...form,
        price_per_kg: parseFloat(form.price_per_kg),
        available_qty: parseFloat(form.available_qty),
        min_order_qty: parseFloat(form.min_order_qty),
      });
      Alert.alert('Success! 🌿', 'Your listing is now live.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err?.error?.message || 'Failed to create listing');
    }
    setLoading(false);
  };

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <Text style={styles.heading}>New Listing</Text>
        <Text style={styles.subheading}>List your fresh produce for consumers</Text>

        {/* Category Selector */}
        <Text style={styles.label}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catChip, form.category_id === c.id && styles.catChipActive]}
              onPress={() => update('category_id', c.id)}
            >
              <Text style={styles.catIcon}>{c.icon_url}</Text>
              <Text style={[styles.catName, form.category_id === c.id && { color: '#2E7D32' }]}>{c.name_en}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Title */}
        <Text style={styles.label}>Title *</Text>
        <TextInput style={styles.input} placeholder="e.g. Fresh Organic Tomatoes" value={form.title} onChangeText={(v) => update('title', v)} placeholderTextColor="#9E9E9E" />

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textarea]} placeholder="Describe your produce..." value={form.description} onChangeText={(v) => update('description', v)} multiline placeholderTextColor="#9E9E9E" />

        {/* Price & Qty Row */}
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Price (₹/kg) *</Text>
            <TextInput style={styles.input} placeholder="40" value={form.price_per_kg} onChangeText={(v) => update('price_per_kg', v)} keyboardType="decimal-pad" placeholderTextColor="#9E9E9E" />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Available Qty (kg) *</Text>
            <TextInput style={styles.input} placeholder="100" value={form.available_qty} onChangeText={(v) => update('available_qty', v)} keyboardType="decimal-pad" placeholderTextColor="#9E9E9E" />
          </View>
        </View>

        {/* Pincode */}
        <Text style={styles.label}>Pincode *</Text>
        <TextInput style={styles.input} placeholder="110001" value={form.pincode} onChangeText={(v) => update('pincode', v)} keyboardType="number-pad" maxLength={6} placeholderTextColor="#9E9E9E" />

        {/* Organic Toggle */}
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>🌿 Organic Produce</Text>
            <Text style={styles.toggleDesc}>Certified organic farming methods</Text>
          </View>
          <Switch value={form.is_organic} onValueChange={(v) => update('is_organic', v)} trackColor={{ true: '#C8E6C9' }} thumbColor={form.is_organic ? '#2E7D32' : '#E0E0E0'} />
        </View>

        {/* Submit */}
        <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={loading ? null : handleSubmit}>
          <Text style={styles.submitText}>{loading ? 'Publishing...' : '🚀 Publish Listing'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFDF7' },
  form: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 28, fontWeight: '800', color: '#1B5E20', letterSpacing: -0.5 },
  subheading: { fontSize: 14, color: '#757575', marginTop: 4, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#424242', marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#FFF', color: '#1A1A1A' },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  catScroll: { maxHeight: 70, marginTop: 8 },
  catChip: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E0E0E0', marginRight: 8, minWidth: 70 },
  catChipActive: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  catIcon: { fontSize: 22 },
  catName: { fontSize: 10, fontWeight: '600', color: '#757575', marginTop: 2 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginTop: 20, borderWidth: 1, borderColor: '#EEEEEE' },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  toggleDesc: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  submitBtn: { backgroundColor: '#2E7D32', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 28 },
  submitText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
});

export default CreateListingScreen;
