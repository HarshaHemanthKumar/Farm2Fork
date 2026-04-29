import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Text, View, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import useAuthStore from './src/stores/authStore';
import DashboardScreen from './src/screens/DashboardScreen';
import CreateListingScreen from './src/screens/CreateListingScreen';
import FarmerOrdersScreen from './src/screens/FarmerOrdersScreen';
import { sendOtp, verifyOtp, register } from './src/api';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const FarmerLoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSendOtp = async () => {
    if (phone.length !== 10) return Alert.alert('Error', 'Enter valid 10-digit phone');
    setLoading(true);
    try { await sendOtp(`+91${phone}`); setVerifiedPhone(`+91${phone}`); setStep('otp'); }
    catch (e) { Alert.alert('Error', 'Failed to send OTP'); }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return Alert.alert('Error', 'Enter 6-digit OTP');
    setLoading(true);
    try {
      const res = await verifyOtp(verifiedPhone, otp);
      if (res.data?.needsRegistration) setStep('register');
      else if (res.data?.token) setAuth(res.data.user, res.data.token);
    } catch (e) { Alert.alert('Error', 'Invalid OTP'); }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !farmName || !farmAddress) return Alert.alert('Error', 'Fill all fields');
    setLoading(true);
    try {
      const res = await register({
        phone: verifiedPhone, name, role: 'farmer',
        farm_name: farmName, farm_address: farmAddress,
        farm_lat: 28.6139, farm_lng: 77.2090,
      });
      if (res.data?.token) setAuth(res.data.user, res.data.token);
    } catch (e) { Alert.alert('Error', 'Registration failed'); }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={ls.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={ls.header}>
        <Text style={ls.logo}>👨‍🌾</Text>
        <Text style={ls.title}>Farm2Fork</Text>
        <Text style={ls.subtitle}>Farmer Dashboard</Text>
      </View>
      {step === 'phone' && (
        <View style={ls.form}>
          <View style={ls.phoneRow}>
            <View style={ls.prefix}><Text style={ls.prefixText}>+91</Text></View>
            <TextInput style={ls.phoneInput} placeholder="9876543210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} placeholderTextColor="#9E9E9E" />
          </View>
          <TouchableOpacity style={[ls.btn, loading && { opacity: 0.6 }]} onPress={loading ? null : handleSendOtp}>
            <Text style={ls.btnText}>{loading ? 'Sending...' : 'Get OTP'}</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 'otp' && (
        <View style={ls.form}>
          <TextInput style={ls.otpInput} placeholder="000000" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} placeholderTextColor="#9E9E9E" />
          <TouchableOpacity style={[ls.btn, loading && { opacity: 0.6 }]} onPress={loading ? null : handleVerify}>
            <Text style={ls.btnText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 'register' && (
        <View style={ls.form}>
          <TextInput style={ls.input} placeholder="Your name" value={name} onChangeText={setName} placeholderTextColor="#9E9E9E" />
          <TextInput style={ls.input} placeholder="Farm name" value={farmName} onChangeText={setFarmName} placeholderTextColor="#9E9E9E" />
          <TextInput style={ls.input} placeholder="Farm address" value={farmAddress} onChangeText={setFarmAddress} placeholderTextColor="#9E9E9E" />
          <TouchableOpacity style={[ls.btn, loading && { opacity: 0.6 }]} onPress={loading ? null : handleRegister}>
            <Text style={ls.btnText}>{loading ? 'Creating...' : 'Start Selling 🌾'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const ls = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFDF7', justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 64 },
  title: { fontSize: 32, fontWeight: '900', color: '#1B5E20' },
  subtitle: { fontSize: 16, color: '#757575', marginTop: 4 },
  form: { gap: 14 },
  phoneRow: { flexDirection: 'row', gap: 8 },
  prefix: { backgroundColor: '#E8F5E9', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', borderWidth: 2, borderColor: '#C8E6C9' },
  prefixText: { fontSize: 16, fontWeight: '700', color: '#2E7D32' },
  phoneInput: { flex: 1, borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 18, backgroundColor: '#FFF', color: '#1A1A1A' },
  otpInput: { borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 24, letterSpacing: 8, textAlign: 'center', backgroundColor: '#FFF', color: '#1A1A1A' },
  input: { borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#FFF', color: '#1A1A1A' },
  btn: { backgroundColor: '#2E7D32', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

const TabIcon = ({ icon, label, focused }) => (
  <View style={{ alignItems: 'center', paddingTop: 4 }}>
    <Text style={{ fontSize: 22 }}>{icon}</Text>
    <Text style={{ fontSize: 10, fontWeight: focused ? '700' : '500', color: focused ? '#2E7D32' : '#9E9E9E', marginTop: 2 }}>{label}</Text>
  </View>
);

const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#FAFDF7', elevation: 0 }, headerTintColor: '#1B5E20', headerTitleStyle: { fontWeight: '700' } }}>
    <Stack.Screen name="DashHome" component={DashboardScreen} options={{ headerTitle: '👨‍🌾 My Farm', headerTitleStyle: { fontSize: 20, fontWeight: '800', color: '#1B5E20' } }} />
    <Stack.Screen name="CreateListing" component={CreateListingScreen} options={{ headerTitle: 'New Listing' }} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#FFF', borderTopColor: '#EEE', height: 60, paddingBottom: 6 }, tabBarShowLabel: false }}>
    <Tab.Screen name="DashTab" component={DashboardStack} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Dashboard" focused={focused} /> }} />
    <Tab.Screen name="OrdersTab" component={FarmerOrdersScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📦" label="Orders" focused={focused} /> }} />
  </Tab.Navigator>
);

const App = () => {
  const { user, isLoading, loadAuth } = useAuthStore();
  useEffect(() => { loadAuth(); }, []);

  if (isLoading) {
    return <View style={ss.splash}><Text style={ss.splashLogo}>👨‍🌾</Text><Text style={ss.splashTitle}>Farm2Fork</Text><ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} /></View>;
  }

  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#FAFDF7" barStyle="dark-content" />
      {user ? <MainTabs /> : <Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="Login" component={FarmerLoginScreen} /></Stack.Navigator>}
    </NavigationContainer>
  );
};

const ss = StyleSheet.create({
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFDF7' },
  splashLogo: { fontSize: 72 },
  splashTitle: { fontSize: 32, fontWeight: '900', color: '#1B5E20', marginTop: 12 },
});

export default App;
