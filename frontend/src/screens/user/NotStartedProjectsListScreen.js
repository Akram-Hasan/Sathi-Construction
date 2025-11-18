import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import SearchBar from '../../components/SearchBar';
import { projectService } from '../../services/projectService';
import EnhancedCard from '../../components/EnhancedCard';
import { styles } from '../../styles';
import Toast from '../../components/Toast';

export default function NotStartedProjectsListScreen() {
  const navigation = useNavigation();
  const [notStartedProjects, setNotStartedProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const fetchNotStartedProjects = async () => {
    try {
      const response = await projectService.getNotStarted();
      if (response.success) {
        const projectsData = response.data || [];
        setNotStartedProjects(projectsData);
        setFilteredProjects(projectsData);
      } else {
        showToast('Failed to load projects', 'error');
      }
    } catch (error) {
      console.error('Error fetching not started projects:', error);
      showToast(error.message || 'Failed to load projects', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchNotStartedProjects();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotStartedProjects();
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProjects(notStartedProjects);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = notStartedProjects.filter(project => 
        project.name?.toLowerCase().includes(query) ||
        project.projectId?.toLowerCase().includes(query) ||
        project.location?.toLowerCase().includes(query)
      );
      setFilteredProjects(filtered);
    }
  }, [searchQuery, notStartedProjects]);

  return (
    <ScreenWrapper>
      <ScrollView 
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        <BackButton />
        <Text style={styles.sectionTitle}>Not Started Projects ({filteredProjects.length})</Text>
        
        <View style={{ marginBottom: 16 }}>
          <SearchBar
            placeholder="Search not started projects..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </View>
        
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <EnhancedCard key={project._id || project.id} variant="elevated" style={{ marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ProjectDetail', { projectId: project._id || project.id, project })}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Ionicons name="folder" size={20} color="#f59e0b" style={{ marginRight: 8 }} />
                      <Text style={[styles.listTitle, { fontSize: 16 }]}>{project.name}</Text>
                    </View>
                    <Text style={[styles.listSub, { marginBottom: 4 }]}>
                      #{project.projectId || project.id}
                    </Text>
                  {project.location && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <Ionicons name="location" size={14} color="#94a3b8" />
                      <Text style={[styles.listSub, { marginLeft: 4 }]}>{project.location}</Text>
                    </View>
                  )}
                  {project.clientName && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <Ionicons name="person" size={14} color="#60a5fa" style={{ marginRight: 4 }} />
                      <Text style={[styles.listSub, { fontSize: 11 }]}>Client: {project.clientName}</Text>
                    </View>
                  )}
                  {project.budget && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <Ionicons name="wallet" size={14} color="#22c55e" style={{ marginRight: 4 }} />
                      <Text style={[styles.listSub, { fontSize: 11, color: '#22c55e' }]}>
                        Budget: ₹{project.budget.toLocaleString()}
                      </Text>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#1f2937' }}>
                    <Ionicons name="information-circle" size={14} color="#60a5fa" />
                    <Text style={[styles.listDesc, { marginLeft: 6, color: '#60a5fa', fontSize: 12 }]}>Tap to view full details</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" style={{ marginLeft: 12 }} />
              </View>
              </TouchableOpacity>
            </EnhancedCard>
          ))
        ) : (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: '#94a3b8', fontSize: 16 }}>No not started projects found</Text>
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

