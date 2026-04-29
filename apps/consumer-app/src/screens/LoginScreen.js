import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { sendOtp, verifyOtp, register } from '../api';
import useAuthStore from '../stores/authStore';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // phone | otp | register
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSendOtp = async () => {
    if (phone.length !== 10) return Alert.alert('Error', 'Enter valid 10-digit phone number');
    setLoading(true);
    try {
      const fullPhone = `+91${phone}`;
      await sendOtp(fullPhone);
      setVerifiedPhone(fullPhone);
      setStep('otp');
      Alert.alert('OTP Sent', 'Use code 123456 in dev mode');
    } catch (err) {
      console.error('Send OTP error:', JSON.stringify(err));
      const msg = err?.error?.message || err?.message || JSON.stringify(err);
      Alert.alert('OTP Failed', msg);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return Alert.alert('Error', 'Enter 6-digit OTP');
    setLoading(true);
    try {
      const res = await verifyOtp(verifiedPhone, otp);
      if (res.data?.needsRegistration) {
        setStep('register');
      } else if (res.data?.token) {
        setAuth(res.data.user, res.data.token);
      }
    } catch (err) {
      Alert.alert('Error', err?.error?.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Enter your name');
    setLoading(true);
    try {
      const res = await register({ phone: verifiedPhone, name: name.trim(), role: 'consumer' });
      if (res.data?.token) {
        setAuth(res.data.user, res.data.token);
      }
    } catch (err) {
      Alert.alert('Error', err?.error?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.logo}>🌿</Text>
        <Text style={styles.title}>Farm2Fork</Text>
        <Text style={styles.subtitle}>Fresh produce, direct from farmers</Text>
      </View>

      {step === 'phone' && (
        <View style={styles.form}>
          <Text style={styles.label}>Enter your phone number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.prefix}><Text style={styles.prefixText}>+91</Text></View>
            <TextInput
              style={styles.phoneInput}
              placeholder="9876543210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              placeholderTextColor="#9E9E9E"
            />
          </View>
          <Text
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={loading ? null : handleSendOtp}
          >
            {loading ? 'Sending...' : 'Get OTP'}
          </Text>
        </View>
      )}

      {step === 'otp' && (
        <View style={styles.form}>
          <Text style={styles.label}>Enter the 6-digit OTP sent to +91{phone}</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="000000"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            placeholderTextColor="#9E9E9E"
          />
          <Text
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={loading ? null : handleVerifyOtp}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Text>
          <Text style={styles.link} onPress={() => setStep('phone')}>← Change Number</Text>
        </View>
      )}

      {step === 'register' && (
        <View style={styles.form}>
          <Text style={styles.label}>Welcome! What's your name?</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9E9E9E"
          />
          <Text
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={loading ? null : handleRegister}
          >
            {loading ? 'Creating account...' : 'Start Shopping 🛒'}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFDF7', justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 36, fontWeight: '900', color: '#1B5E20', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#616161', marginTop: 4 },
  form: { gap: 16 },
  label: { fontSize: 16, fontWeight: '600', color: '#424242', marginBottom: 4 },
  phoneRow: { flexDirection: 'row', gap: 8 },
  prefix: {
    backgroundColor: '#E8F5E9', borderRadius: 12, paddingHorizontal: 16,
    justifyContent: 'center', borderWidth: 2, borderColor: '#C8E6C9',
  },
  prefixText: { fontSize: 16, fontWeight: '700', color: '#2E7D32' },
  phoneInput: {
    flex: 1, borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12,
    padding: 14, fontSize: 18, letterSpacing: 2, backgroundColor: '#FFF', color: '#1A1A1A',
  },
  otpInput: {
    borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12, padding: 14,
    fontSize: 24, letterSpacing: 8, textAlign: 'center', backgroundColor: '#FFF', color: '#1A1A1A',
  },
  input: {
    borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 12,
    padding: 14, fontSize: 16, backgroundColor: '#FFF', color: '#1A1A1A',
  },
  btn: {
    backgroundColor: '#2E7D32', borderRadius: 12, padding: 16, textAlign: 'center',
    color: '#FFF', fontSize: 16, fontWeight: '700', overflow: 'hidden',
  },
  btnDisabled: { opacity: 0.6 },
  link: { color: '#2E7D32', fontWeight: '600', textAlign: 'center', marginTop: 8 },
});

export default LoginScreen;
