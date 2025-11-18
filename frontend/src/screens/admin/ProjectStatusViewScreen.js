import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import { projectService } from '../../services/projectService';
import Toast from '../../components/Toast';

export default function ProjectStatusViewScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      if (response.success) {
        setProjects(response.data || []);
      } else {
        showToast('Failed to load projects', 'error');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      showToast(error.message || 'Failed to load projects', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProjects();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return { bg: '#d1fae5', text: '#10b981' };
      case 'Planning':
        return { bg: '#fef3c7', text: '#f59e0b' };
      case 'Completed':
        return { bg: '#dbeafe', text: '#60a5fa' };
      case 'On Hold':
        return { bg: '#fee2e2', text: '#ef4444' };
      default:
        return { bg: '#1f2937', text: '#94a3b8' };
    }
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
        <Text style={styles.sectionTitle}>Status of Added Projects ({projects.length})</Text>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : projects.length > 0 ? (
          projects.map(project => {
            const statusColor = getStatusColor(project.status);
            const progressColor = (project.progress || 0) >= 70 ? '#22c55e' : (project.progress || 0) >= 30 ? '#f59e0b' : '#ef4444';
            return (
              <TouchableOpacity
                key={project._id || project.id}
                style={[styles.userCard, { marginTop: 12 }]}
                onPress={() => navigation?.navigate('ProjectDetail', { projectId: project._id || project.id })}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listTitle}>{project.name}</Text>
                    <Text style={styles.listSub}>
                      #{project.projectId || project.id} • Started: {formatDate(project.startDate)}
                    </Text>
                    {project.location && (
                      <Text style={[styles.listSub, { marginTop: 4 }]}>📍 {project.location}</Text>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <Text style={styles.listDesc}>Progress: </Text>
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${project.progress || 0}%`, backgroundColor: progressColor }]} />
                      </View>
                      <Text style={[styles.listDesc, { marginLeft: 8, fontWeight: '600', color: progressColor }]}>
                        {project.progress || 0}%
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.badgeText, { color: statusColor.text }]}>
                      {project.status || 'N/A'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: '#94a3b8', fontSize: 16 }}>No projects found</Text>
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
  sectionTitle: {
    color: '#e2e8f0',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  listTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  listSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  listDesc: {
    color: '#94a3b8',
    fontSize: 12,
  },
  progressBarContainer: {
    height: 6,
    flex: 1,
    backgroundColor: '#0a0f1a',
    borderRadius: 3,
    marginLeft: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

