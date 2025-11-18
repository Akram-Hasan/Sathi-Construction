import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import EnhancedCard from '../../components/EnhancedCard';
import Toast from '../../components/Toast';
import { styles as globalStyles } from '../../styles';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const fetchNotifications = async () => {
    try {
      // In a real app, you would fetch from backend
      // For now, we'll show sample notifications
      const sampleNotifications = [
        {
          id: '1',
          type: 'info',
          title: 'New Material Request',
          message: 'Material request for Project ABC-001 has been submitted',
          time: new Date(Date.now() - 3600000).toISOString(),
          read: false,
        },
        {
          id: '2',
          type: 'success',
          title: 'Progress Updated',
          message: 'Your progress report for Project XYZ-002 has been received',
          time: new Date(Date.now() - 7200000).toISOString(),
          read: false,
        },
        {
          id: '3',
          type: 'warning',
          title: 'Material Required',
          message: 'Material shortage reported for Project DEF-003',
          time: new Date(Date.now() - 86400000).toISOString(),
          read: true,
        },
      ];
      setNotifications(sampleNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: '#22c55e' };
      case 'warning':
        return { name: 'warning', color: '#f59e0b' };
      case 'error':
        return { name: 'alert-circle', color: '#ef4444' };
      default:
        return { name: 'information-circle', color: '#60a5fa' };
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        <BackButton />
        <Text style={globalStyles.sectionTitle}>Notifications ({notifications.length})</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => {
            const icon = getNotificationIcon(notification.type);
            return (
              <EnhancedCard
                key={notification.id}
                variant="elevated"
                style={[
                  styles.notificationCard,
                  !notification.read && styles.unreadCard
                ]}
              >
                <View style={styles.notificationContent}>
                  <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
                    <Ionicons name={icon.name} size={24} color={icon.color} />
                  </View>
                  <View style={styles.notificationText}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      {!notification.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{formatTime(notification.time)}</Text>
                  </View>
                </View>
              </EnhancedCard>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#64748b" />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubText}>You're all caught up!</Text>
          </View>
        )}
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  notificationCard: {
    marginTop: 12,
    padding: 16,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginLeft: 8,
  },
  notificationMessage: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    color: '#64748b',
    fontSize: 12,
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
  },
});

