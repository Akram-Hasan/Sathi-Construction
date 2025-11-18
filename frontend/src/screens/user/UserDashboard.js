import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../../components/ScreenWrapper';
import EnhancedCard from '../../components/EnhancedCard';
import { authService } from '../../services/authService';
import { projectService } from '../../services/projectService';
import { materialService } from '../../services/materialService';
import { styles as globalStyles } from '../../styles';
import Toast from '../../components/Toast';

export default function UserDashboard({ onLogout, user }) {
  const navigation = useNavigation();
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userInfo, setUserInfo] = useState(user || {});
  const [projects, setProjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    inProgress: 0,
    completed: 0,
    availableMaterials: 0,
    requiredMaterials: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const statusOptions = ['Started', 'Not Started'];

  const fetchData = async () => {
    try {
      const [userResponse, projectsResponse, materialsResponse] = await Promise.all([
        authService.getCurrentUser(),
        projectService.getAll(),
        materialService.getAll()
      ]);

      if (userResponse.success) {
        setUserInfo(userResponse.user);
      }

      if (projectsResponse.success) {
        const projectsData = projectsResponse.data || [];
        setProjects(projectsData);
        
        const inProgress = projectsData.filter(p => p.status === 'In Progress').length;
        const completed = projectsData.filter(p => p.status === 'Completed').length;
        
        setStats(prev => ({
          ...prev,
          totalProjects: projectsData.length,
          inProgress,
          completed,
        }));
      }

      if (materialsResponse.success) {
        const materialsData = materialsResponse.data || [];
        setMaterials(materialsData);
        
        const available = materialsData.filter(m => m.type === 'Available').length;
        const required = materialsData.filter(m => m.type === 'Required').length;
        
        setStats(prev => ({
          ...prev,
          availableMaterials: available,
          requiredMaterials: required,
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setShowDropdown(false);
    if (status === 'Started') {
      navigation.navigate('StartedProjectsList');
    } else {
      navigation.navigate('NotStartedProjectsList');
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={['#2563eb', '#1d4ed8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.welcomeText}>Welcome Back!</Text>
                <Text style={styles.userName}>{userInfo.name || 'Staff Member'}</Text>
                {userInfo.employeeId && (
                  <Text style={styles.employeeId}>ID: {userInfo.employeeId}</Text>
                )}
              </View>
              <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
                <Ionicons name="log-out-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Cards */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : (
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <EnhancedCard variant="elevated" style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Ionicons name="folder" size={24} color="#3b82f6" />
                </View>
                <Text style={styles.statValue}>{stats.totalProjects}</Text>
                <Text style={styles.statLabel}>Total Projects</Text>
              </EnhancedCard>
              <EnhancedCard variant="elevated" style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                  <Ionicons name="construct" size={24} color="#22c55e" />
                </View>
                <Text style={styles.statValue}>{stats.inProgress}</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </EnhancedCard>
            </View>
            <View style={styles.statsRow}>
              <EnhancedCard variant="elevated" style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="cube" size={24} color="#f59e0b" />
                </View>
                <Text style={styles.statValue}>{stats.availableMaterials}</Text>
                <Text style={styles.statLabel}>Available Materials</Text>
              </EnhancedCard>
              <EnhancedCard variant="elevated" style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Ionicons name="alert-circle" size={24} color="#ef4444" />
                </View>
                <Text style={styles.statValue}>{stats.requiredMaterials}</Text>
                <Text style={styles.statLabel}>Required Materials</Text>
              </EnhancedCard>
            </View>
          </View>
        )}

        {/* Project Status */}
        <View style={styles.section}>
          <EnhancedCard variant="elevated">
            <View style={styles.cardHeader}>
              <Ionicons name="document-text" size={22} color="#22c55e" />
              <Text style={styles.cardTitle}>Project Status</Text>
            </View>
            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>Select Status</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowDropdown(!showDropdown)}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>{selectedStatus || 'Select status...'}</Text>
                <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={18} color="#94a3b8" />
              </TouchableOpacity>
              {showDropdown && (
                <View style={styles.dropdownMenu}>
                  {statusOptions.map((status, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.dropdownItem}
                      onPress={() => handleStatusSelect(status)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={status === 'Started' ? 'play-circle' : 'pause-circle'}
                        size={18}
                        color={status === 'Started' ? '#22c55e' : '#f59e0b'}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.dropdownItemText}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </EnhancedCard>
        </View>

        {/* Materials Section */}
        <View style={styles.section}>
          <EnhancedCard variant="elevated">
            <View style={styles.cardHeader}>
              <Ionicons name="cube" size={22} color="#f59e0b" />
              <Text style={styles.cardTitle}>Materials</Text>
            </View>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('MaterialsAvailable')}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionText}>Materials Available on Site</Text>
                  <Text style={styles.actionSubtext}>{stats.availableMaterials} items available</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('MaterialsRequired')}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionText}>Materials Required on Site</Text>
                  <Text style={styles.actionSubtext}>{stats.requiredMaterials} items needed</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('MaterialRequest')}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                  <Ionicons name="add-circle" size={20} color="#22c55e" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionText}>Request New Material</Text>
                  <Text style={styles.actionSubtext}>Submit a material request</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </EnhancedCard>
        </View>

        {/* Manpower Section */}
        <View style={styles.section}>
          <EnhancedCard variant="elevated">
            <View style={styles.cardHeader}>
              <Ionicons name="people" size={22} color="#60a5fa" />
              <Text style={styles.cardTitle}>Manpower</Text>
            </View>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('ManpowerAvailable')}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(96, 165, 250, 0.15)' }]}>
                  <Ionicons name="person" size={20} color="#60a5fa" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionText}>Manpower Available on Site</Text>
                  <Text style={styles.actionSubtext}>View available workers</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </EnhancedCard>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('LocationTracking')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#22c55e', '#16a34a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.quickActionGradient}
              >
                <Ionicons name="location" size={28} color="#fff" />
                <Text style={styles.quickActionText}>Track Location</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('PhotoUpload')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.quickActionGradient}
              >
                <Ionicons name="camera" size={28} color="#fff" />
                <Text style={styles.quickActionText}>Upload Photo</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('IssueReport')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.quickActionGradient}
              >
                <Ionicons name="alert-circle" size={28} color="#fff" />
                <Text style={styles.quickActionText}>Report Issue</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.quickActionGradient}
              >
                <Ionicons name="notifications" size={28} color="#fff" />
                <Text style={styles.quickActionText}>Notifications</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
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
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerGradient: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 4,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  employeeId: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    color: '#e2e8f0',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  cardTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
  },
  dropdownContainer: {
    marginTop: 8,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0a0f1a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#1e293b',
  },
  dropdownText: {
    color: '#e2e8f0',
    fontSize: 15,
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: '#0b1220',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1f2937',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  dropdownItemText: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtext: {
    color: '#94a3b8',
    fontSize: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionBtn: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
});
