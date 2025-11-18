import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import FeatureItem from '../../components/FeatureItem';
import QuickCard from '../../components/QuickCard';
import EnhancedCard from '../../components/EnhancedCard';
import SearchBar from '../../components/SearchBar';
import SearchDropdown from '../../components/SearchDropdown';
import { projectService } from '../../services/projectService';
import { manpowerService } from '../../services/manpowerService';
import { authService } from '../../services/authService';
import Toast from '../../components/Toast';

export default function AdminDashboard({ user }) {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [manpower, setManpower] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userInfo, setUserInfo] = useState(user || {});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const fetchData = async () => {
    try {
      const [projectsResponse, manpowerResponse, userResponse] = await Promise.all([
        projectService.getAll(),
        manpowerService.getAll(),
        authService.getCurrentUser()
      ]);

      if (projectsResponse.success) {
        const projectsData = projectsResponse.data || [];
        setProjects(projectsData);
        setFilteredProjects(projectsData);
      }

      if (manpowerResponse.success) {
        setManpower(manpowerResponse.data || []);
      }
      
      if (userResponse.success) {
        setUserInfo(userResponse.user);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return { bg: '#dbeafe', text: '#60a5fa' };
      case 'Planning':
        return { bg: '#fef3c7', text: '#f59e0b' };
      case 'Completed':
        return { bg: '#d1fae5', text: '#10b981' };
      default:
        return { bg: '#1f2937', text: '#94a3b8' };
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProjects(projects);
      setSearchResults([]);
      setShowSearchDropdown(false);
    } else {
      const query = searchQuery.toLowerCase();
      
      // Filter projects
      const filteredProjects = projects.filter(project => 
        project.name?.toLowerCase().includes(query) ||
        project.projectId?.toLowerCase().includes(query) ||
        project.location?.toLowerCase().includes(query) ||
        project.status?.toLowerCase().includes(query) ||
        project.clientName?.toLowerCase().includes(query)
      );
      setFilteredProjects(filteredProjects);

      // Filter manpower
      const filteredManpower = manpower.filter(person =>
        person.name?.toLowerCase().includes(query) ||
        person.employeeId?.toLowerCase().includes(query) ||
        person.role?.toLowerCase().includes(query) ||
        person.phone?.includes(query) ||
        person.email?.toLowerCase().includes(query) ||
        person.skills?.toLowerCase().includes(query)
      );

      // Combine results for dropdown
      const combinedResults = [
        ...filteredProjects.map(p => ({ ...p, type: 'project' })),
        ...filteredManpower.map(m => ({ ...m, type: 'manpower' }))
      ];
      
      setSearchResults(combinedResults);
      setShowSearchDropdown(combinedResults.length > 0);
    }
  }, [searchQuery, projects, manpower]);

  const handleSearchSelect = (item) => {
    if (item.type === 'project') {
      navigation.getParent()?.navigate('ProjectDetail', { projectId: item._id || item.id });
    } else if (item.type === 'manpower') {
      navigation.getParent()?.navigate('ManpowerDetail', { manpowerId: item._id || item.id });
    }
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const recentProjects = filteredProjects.slice(0, 2);
  
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
          <View style={styles.searchRow}>
            <View style={{ flex: 1, position: 'relative', zIndex: 1000 }}>
              <SearchBar
                placeholder="Search projects, manpower..."
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text.trim().length > 0) {
                    setShowSearchDropdown(true);
                  } else {
                    setShowSearchDropdown(false);
                  }
                }}
                onClear={() => {
                  setSearchQuery('');
                  setShowSearchDropdown(false);
                }}
                style={{ flex: 1 }}
              />
              <SearchDropdown
                results={searchResults}
                visible={showSearchDropdown && searchQuery.trim().length > 0}
                onSelect={handleSearchSelect}
                onClose={() => setShowSearchDropdown(false)}
                type="mixed"
              />
            </View>
            <TouchableOpacity 
              style={styles.avatar}
              onPress={() => navigation.getParent()?.navigate('Profile')}
              activeOpacity={0.7}
            >
              <Text style={styles.avatarText}>
                {userInfo.name ? userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.curvedPanel}>
            <View style={styles.gridRow}>
              <FeatureItem
                label="Projects"
                icon="folder"
                iconColor="#3b82f6"
                bgColor="rgba(59, 130, 246, 0.15)"
                borderColor="rgba(59, 130, 246, 0.3)"
                onPress={() => navigation.getParent()?.navigate('ProjectsList')}
              />
              <FeatureItem
                label="Manpower"
                icon="people"
                iconColor="#22c55e"
                bgColor="rgba(34, 197, 94, 0.15)"
                borderColor="rgba(34, 197, 94, 0.3)"
                onPress={() => navigation.getParent()?.navigate('Manpower')}
              />
              <FeatureItem
                label="Status"
                icon="checkmark-circle"
                iconColor="#f59e0b"
                bgColor="rgba(245, 158, 11, 0.15)"
                borderColor="rgba(245, 158, 11, 0.3)"
                onPress={() => navigation.getParent()?.navigate('StatusScreen')}
              />
            </View>
            <View style={styles.gridRow}>
              <FeatureItem
                label="Materials"
                icon="cube"
                iconColor="#f59e0b"
                bgColor="rgba(245, 158, 11, 0.15)"
                borderColor="rgba(245, 158, 11, 0.3)"
                onPress={() => navigation.getParent()?.navigate('Materials')}
              />
              <FeatureItem
                label="Progress"
                icon="trending-up"
                iconColor="#8b5cf6"
                bgColor="rgba(139, 92, 246, 0.15)"
                borderColor="rgba(139, 92, 246, 0.3)"
                onPress={() => navigation.getParent()?.navigate('WorkProgress')}
              />
              <FeatureItem
                label="Location"
                icon="location"
                iconColor="#ef4444"
                bgColor="rgba(239, 68, 68, 0.15)"
                borderColor="rgba(239, 68, 68, 0.3)"
                onPress={() => navigation.getParent()?.navigate('LocationScreen')}
              />
            </View>
            <View style={styles.gridRow}>
              <FeatureItem
                label="Finance"
                icon="wallet"
                iconColor="#06b6d4"
                bgColor="rgba(6, 182, 212, 0.15)"
                borderColor="rgba(6, 182, 212, 0.3)"
                onPress={() => navigation.getParent()?.navigate('FinanceSummary')}
              />
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Project Activity</Text>
              <TouchableOpacity onPress={() => navigation.getParent()?.navigate('ProjectsList')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <EnhancedCard variant="elevated" style={styles.activityCard}>
              {recentProjects.length > 0 ? (
                recentProjects.map((project, index) => {
                  const statusColor = getStatusColor(project.status);
                  return (
                    <View key={project._id || project.id}>
                      {index > 0 && <View style={styles.divider} />}
                      <View style={styles.activityItem}>
                        <View style={[styles.activityIcon, { backgroundColor: statusColor.bg }]}>
                          <Ionicons name="construct" size={20} color={statusColor.text} />
                        </View>
                        <View style={styles.activityContent}>
                          <Text style={styles.activityName}>{project.name}</Text>
                          <Text style={styles.activitySub}>
                            {project.projectId || project.id} • {project.location || 'No location'}
                          </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
                          <Text style={[styles.badgeText, { color: statusColor.text }]}>
                            {project.status || 'N/A'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="folder-open-outline" size={48} color="#64748b" />
                  <Text style={styles.emptyText}>No projects yet</Text>
                  <Text style={styles.emptySubText}>Create your first project to get started</Text>
                </View>
              )}
            </EnhancedCard>
          </View>
        )}

        {/* Quick Access Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.cardsWrap}>
            <QuickCard
              title="Add New Project"
              icon="add-circle"
              iconColor="#fff"
              gradientColors={['#22c55e', '#16a34a']}
              onPress={() => navigation.getParent()?.navigate('AddProject')}
            />
            <QuickCard
              title="Add Manpower"
              icon="people"
              iconColor="#fff"
              gradientColors={['#3b82f6', '#2563eb']}
              onPress={() => navigation.getParent()?.navigate('AddManpower')}
            />
            <QuickCard
              title="Project Status"
              icon="stats-chart"
              iconColor="#fff"
              gradientColors={['#f59e0b', '#d97706']}
              onPress={() => navigation.getParent()?.navigate('ProjectStatusView')}
            />
            <QuickCard
              title="Materials"
              icon="cube"
              iconColor="#fff"
              gradientColors={['#f59e0b', '#d97706']}
              onPress={() => navigation.getParent()?.navigate('Materials')}
            />
            <QuickCard
              title="Finance Summary"
              icon="wallet"
              iconColor="#fff"
              gradientColors={['#8b5cf6', '#7c3aed']}
              onPress={() => navigation.getParent()?.navigate('FinanceSummary')}
            />
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
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1e40af',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 12,
  },
  seeAllText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
  },
  curvedPanel: {
    backgroundColor: '#0b1220',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  activityCard: {
    marginTop: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  activitySub: {
    color: '#94a3b8',
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#1f2937',
    marginVertical: 4,
  },
  cardsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
