import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import useAuthStore from './src/stores/authStore';
import LoginScreen from './src/screens/LoginScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import ListingDetailScreen from './src/screens/ListingDetailScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ icon, label, focused }) => (
  <View style={{ alignItems: 'center', paddingTop: 4 }}>
    <Text style={{ fontSize: 22 }}>{icon}</Text>
    <Text style={{ fontSize: 10, fontWeight: focused ? '700' : '500', color: focused ? '#2E7D32' : '#9E9E9E', marginTop: 2 }}>{label}</Text>
  </View>
);

const BrowseStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#FAFDF7', elevation: 0, shadowOpacity: 0 }, headerTintColor: '#1B5E20', headerTitleStyle: { fontWeight: '700' } }}>
    <Stack.Screen name="BrowseHome" component={BrowseScreen} options={{ headerTitle: '🌿 Farm2Fork', headerTitleStyle: { fontSize: 20, fontWeight: '800', color: '#1B5E20' } }} />
    <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ headerTitle: 'Product Details' }} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#FFF', borderTopColor: '#EEEEEE', borderTopWidth: 1, height: 60, paddingBottom: 6 },
      tabBarShowLabel: false,
      tabBarActiveTintColor: '#2E7D32',
    }}
  >
    <Tab.Screen name="BrowseTab" component={BrowseStack} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Browse" focused={focused} /> }} />
    <Tab.Screen name="OrdersTab" component={OrdersScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📦" label="Orders" focused={focused} />, headerShown: false }} />
    <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} />, headerShown: false }} />
  </Tab.Navigator>
);

const App = () => {
  const { user, isLoading, loadAuth } = useAuthStore();

  useEffect(() => { loadAuth(); }, []);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>🌿</Text>
        <Text style={styles.splashTitle}>Farm2Fork</Text>
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#FAFDF7" barStyle="dark-content" />
      {user ? <MainTabs /> : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFDF7' },
  splashLogo: { fontSize: 72 },
  splashTitle: { fontSize: 32, fontWeight: '900', color: '#1B5E20', marginTop: 12 },
});

export default App;
