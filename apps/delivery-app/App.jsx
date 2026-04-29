import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Text, View, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import useAuthStore from './src/stores/authStore';
import HomeScreen from './src/screens/HomeScreen';
import { sendOtp, verifyOtp, register } from './src/api';

const Stack = createStackNavigator();

const DeliveryLoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [name, setName] = useState('');
  const [vehicleType, setVehicleType] = useState('bike');
  const [vehicleNum, setVehicleNum] = useState('');
  const [licenseNum, setLicenseNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSendOtp = async () => {
    if (phone.length !== 10) return Alert.alert('Error', 'Enter valid phone');
    setLoading(true);
    try { await sendOtp(`+91${phone}`); setVerifiedPhone(`+91${phone}`); setStep('otp'); }
    catch (e) { Alert.alert('Error', 'Failed'); }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await verifyOtp(verifiedPhone, otp);
      if (res.data?.needsRegistration) setStep('register');
      else if (res.data?.token) setAuth(res.data.user, res.data.token);
    } catch (e) { Alert.alert('Error', 'Invalid OTP'); }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !vehicleNum || !licenseNum) return Alert.alert('Error', 'Fill all fields');
    setLoading(true);
    try {
      const res = await register({ phone: verifiedPhone, name, role: 'delivery', vehicle_type: vehicleType, vehicle_number: vehicleNum, license_number: licenseNum });
      if (res.data?.token) setAuth(res.data.user, res.data.token);
    } catch (e) { Alert.alert('Error', 'Registration failed'); }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={ls.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={ls.header}>
        <Text style={ls.logo}>🛵</Text>
        <Text style={ls.title}>Farm2Fork</Text>
        <Text style={ls.subtitle}>Delivery Partner</Text>
      </View>
      {step === 'phone' && (
        <View style={ls.form}>
          <View style={ls.row}><View style={ls.prefix}><Text style={ls.prefixText}>+91</Text></View>
          <TextInput style={ls.phoneInput} placeholder="9876543210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} placeholderTextColor="#9E9E9E" /></View>
          <TouchableOpacity style={[ls.btn, loading && {opacity:0.6}]} onPress={loading ? null : handleSendOtp}><Text style={ls.btnText}>{loading ? 'Sending...' : 'Get OTP'}</Text></TouchableOpacity>
        </View>
      )}
      {step === 'otp' && (
        <View style={ls.form}>
          <TextInput style={ls.otpInput} placeholder="000000" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} placeholderTextColor="#9E9E9E" />
          <TouchableOpacity style={[ls.btn, loading && {opacity:0.6}]} onPress={loading ? null : handleVerify}><Text style={ls.btnText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text></TouchableOpacity>
        </View>
      )}
      {step === 'register' && (
        <View style={ls.form}>
          <TextInput style={ls.input} placeholder="Your name" value={name} onChangeText={setName} placeholderTextColor="#9E9E9E" />
          <View style={ls.vehicleRow}>
            {['bike', 'auto', 'van'].map(v => (
              <TouchableOpacity key={v} style={[ls.vChip, vehicleType === v && ls.vChipActive]} onPress={() => setVehicleType(v)}>
                <Text style={[ls.vText, vehicleType === v && {color: '#2E7D32'}]}>{v === 'bike' ? '🏍️' : v === 'auto' ? '🛺' : '🚐'} {v}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={ls.input} placeholder="Vehicle number (e.g. DL01AB1234)" value={vehicleNum} onChangeText={setVehicleNum} placeholderTextColor="#9E9E9E" />
          <TextInput style={ls.input} placeholder="License number" value={licenseNum} onChangeText={setLicenseNum} placeholderTextColor="#9E9E9E" />
          <TouchableOpacity style={[ls.btn, loading && {opacity:0.6}]} onPress={loading ? null : handleRegister}><Text style={ls.btnText}>{loading ? 'Creating...' : 'Start Delivering 🛵'}</Text></TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const ls = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFDF7', justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 64 }, title: { fontSize: 32, fontWeight: '900', color: '#1B5E20' },
  subtitle: { fontSize: 16, color: '#757575', marginTop: 4 },
  form: { gap: 14 },
  row: { flexDirection: 'row', gap: 8 },
  prefix: { backgroundColor: '#E8F5E9', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', borderWidth: 2, borderColor: '#C8E6C9' },
  prefixText: { fontSize: 16, fontWeight: '700', color: '#2E7D32' },
  phoneInput: { flex: 1, borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 18, backgroundColor: '#FFF', color: '#1A1A1A' },
  otpInput: { borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 24, letterSpacing: 8, textAlign: 'center', backgroundColor: '#FFF', color: '#1A1A1A' },
  input: { borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#FFF', color: '#1A1A1A' },
  vehicleRow: { flexDirection: 'row', gap: 8 },
  vChip: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#E0E0E0', alignItems: 'center', backgroundColor: '#FFF' },
  vChipActive: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  vText: { fontSize: 13, fontWeight: '600', color: '#757575' },
  btn: { backgroundColor: '#2E7D32', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

const App = () => {
  const { user, isLoading, loadAuth } = useAuthStore();
  useEffect(() => { loadAuth(); }, []);

  if (isLoading) {
    return <View style={ss.splash}><Text style={ss.logo}>🛵</Text><Text style={ss.title}>Farm2Fork</Text><ActivityIndicator size="large" color="#2E7D32" style={{marginTop: 20}} /></View>;
  }

  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#FAFDF7" barStyle="dark-content" />
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#FAFDF7', elevation: 0 }, headerTintColor: '#1B5E20', headerTitleStyle: { fontWeight: '700' } }}>
        {user ? (
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerTitle: '🛵 Deliveries', headerTitleStyle: { fontSize: 20, fontWeight: '800', color: '#1B5E20' } }} />
        ) : (
          <Stack.Screen name="Login" component={DeliveryLoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const ss = StyleSheet.create({
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFDF7' },
  logo: { fontSize: 72 }, title: { fontSize: 32, fontWeight: '900', color: '#1B5E20', marginTop: 12 },
});

export default App;
