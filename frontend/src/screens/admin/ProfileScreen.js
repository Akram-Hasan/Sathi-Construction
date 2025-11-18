import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import EnhancedCard from '../../components/EnhancedCard';
import { authService } from '../../services/authService';
import Toast from '../../components/Toast';

export default function ProfileScreen({ onLogout }) {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const fetchUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        setUserInfo(response.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUser();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            onLogout();
          }
        }
      ]
    );
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BackButton />
        
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>
              {userInfo.name ? userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD'}
            </Text>
          </View>
          <Text style={styles.name}>{userInfo.name || 'Admin User'}</Text>
          <Text style={styles.email}>{userInfo.email || 'admin@sathi.com'}</Text>
          {userInfo.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userInfo.role.toUpperCase()}</Text>
            </View>
          )}
        </View>

        <EnhancedCard variant="elevated" style={styles.infoCard}>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#60a5fa" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Employee ID</Text>
                <Text style={styles.infoValue}>{userInfo.employeeId || 'ADM-001'}</Text>
              </View>
            </View>
          </View>

          {userInfo.phone && (
            <View style={[styles.infoSection, styles.infoSectionBorder]}>
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color="#22c55e" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{userInfo.phone}</Text>
                </View>
              </View>
            </View>
          )}

          {userInfo.location && (
            <View style={[styles.infoSection, styles.infoSectionBorder]}>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color="#f59e0b" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{userInfo.location.address || 'Not set'}</Text>
                </View>
              </View>
            </View>
          )}
        </EnhancedCard>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#ffffff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#1e40af',
    marginBottom: 16,
  },
  avatarTextLarge: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 36,
  },
  name: {
    color: '#e2e8f0',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    marginBottom: 24,
  },
  infoSection: {
    paddingVertical: 16,
  },
  infoSectionBorder: {
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

