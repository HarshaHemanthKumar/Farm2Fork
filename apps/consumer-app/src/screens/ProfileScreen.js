import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import useAuthStore from '../stores/authStore';

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.phone}>{user?.phone || ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>🛒 Consumer</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {[
          { icon: '📍', label: 'Saved Addresses', desc: 'Manage delivery addresses' },
          { icon: '💳', label: 'Payment Methods', desc: 'Cards & UPI' },
          { icon: '🔔', label: 'Notifications', desc: 'Alert preferences' },
          { icon: '🌐', label: 'Language', desc: user?.language === 'hi' ? 'हिन्दी' : 'English' },
          { icon: '📋', label: 'Order History', desc: 'View all past orders' },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        {[
          { icon: '❓', label: 'Help & FAQ' },
          { icon: '📞', label: 'Contact Support' },
          { icon: '📜', label: 'Terms & Conditions' },
          { icon: '🔒', label: 'Privacy Policy' },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Farm2Fork v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFDF7' },
  header: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#2E7D32' },
  name: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  phone: { fontSize: 14, color: '#757575', marginTop: 4 },
  roleBadge: { marginTop: 8, backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
  roleText: { fontSize: 13, fontWeight: '600', color: '#2E7D32' },
  menuSection: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#EEEEEE',
  },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  menuDesc: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  menuArrow: { fontSize: 24, color: '#BDBDBD' },
  logoutBtn: { margin: 16, padding: 16, backgroundColor: '#FFEBEE', borderRadius: 14, alignItems: 'center' },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#C62828' },
  version: { textAlign: 'center', color: '#BDBDBD', fontSize: 12, paddingVertical: 16 },
});

export default ProfileScreen;
