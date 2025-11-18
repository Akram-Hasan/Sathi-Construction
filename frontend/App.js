import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import LoginScreen from './src/screens/auth/LoginScreen';
import AdminNavigator from './src/navigation/AdminNavigator';
import UserNavigator from './src/navigation/UserNavigator';
import { authService } from './src/services/authService';
import { getToken } from './src/services/api';

export default function App() {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getToken();
      if (token) {
        const response = await authService.getCurrentUser();
        if (response.success) {
          setRole(response.user.role);
          setUser(response.user);
        }
      }
    } catch (error) {
      console.log('No valid session');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userRole, userData) => {
    setRole(userRole);
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setRole(null);
    setUser(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return role ? (
    role === 'admin' ? (
      <AdminNavigator onLogout={handleLogout} user={user} />
    ) : (
      <UserNavigator onLogout={handleLogout} user={user} />
    )
  ) : (
    <LoginScreen onSuccess={handleLoginSuccess} />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
});
