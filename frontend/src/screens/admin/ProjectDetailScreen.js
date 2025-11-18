import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import EnhancedCard from '../../components/EnhancedCard';
import ProgressEditModal from '../../components/ProgressEditModal';
import TimelineItem from '../../components/TimelineItem';
import { projectService } from '../../services/projectService';
import { styles } from '../../styles';
import Toast from '../../components/Toast';

export default function ProjectDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const projectId = route?.params?.projectId;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useFocusEffect(
    React.useCallback(() => {
      fetchProject();
    }, [projectId])
  );

  const fetchProject = async () => {
    try {
      const response = await projectService.getById(projectId);
      if (response.success) {
        setProject(response.data);
      } else {
        showToast('Failed to load project', 'error');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      showToast(error.message || 'Failed to load project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const response = await projectService.delete(projectId);
              if (response.success) {
                showToast('Project deleted successfully', 'success');
                setTimeout(() => navigation.goBack(), 1500);
              } else {
                showToast(response.message || 'Failed to delete project', 'error');
              }
            } catch (error) {
              console.error('Error deleting project:', error);
              showToast(error.message || 'Failed to delete project', 'error');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return { bg: '#dbeafe', text: '#60a5fa' };
      case 'Planning':
        return { bg: '#fef3c7', text: '#f59e0b' };
      case 'Completed':
        return { bg: '#d1fae5', text: '#10b981' };
      case 'On Hold':
        return { bg: '#fee2e2', text: '#ef4444' };
      default:
        return { bg: '#1f2937', text: '#94a3b8' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      </ScreenWrapper>
    );
  }

  if (!project) {
    return (
      <ScreenWrapper>
        <BackButton />
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={{ color: '#94a3b8', fontSize: 16 }}>Project not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const statusColor = getStatusColor(project.status);

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BackButton />
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddProject', { projectId: projectId, project: project })}
              style={{
                padding: 8,
                backgroundColor: '#2563eb',
                borderRadius: 8,
              }}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleting}
              style={{
                padding: 8,
                backgroundColor: '#ef4444',
                borderRadius: 8,
                opacity: deleting ? 0.5 : 1,
              }}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="trash-outline" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <EnhancedCard variant="elevated" style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.listTitle, { fontSize: 20, marginBottom: 4 }]}>{project.name}</Text>
              <Text style={styles.listSub}>#{project.projectId}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.badgeText, { color: statusColor.text }]}>
                {project.status || 'N/A'}
              </Text>
            </View>
          </View>

          {project.description && (
            <Text style={[styles.listDesc, { marginTop: 8 }]}>{project.description}</Text>
          )}
        </EnhancedCard>

        <EnhancedCard variant="elevated" style={{ marginBottom: 16 }}>
          <Text style={[styles.listTitle, { marginBottom: 12 }]}>Project Information</Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={[styles.listSub, { marginBottom: 4 }]}>Location</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location" size={16} color="#22c55e" style={{ marginRight: 6 }} />
              <Text style={styles.listDesc}>{project.location || 'Not specified'}</Text>
            </View>
          </View>

          {project.clientName && (
            <View style={{ marginBottom: 12 }}>
              <Text style={[styles.listSub, { marginBottom: 4 }]}>Client</Text>
              <Text style={styles.listDesc}>{project.clientName}</Text>
            </View>
          )}

          {project.budget && (
            <View style={{ marginBottom: 12 }}>
              <Text style={[styles.listSub, { marginBottom: 4 }]}>Budget</Text>
              <Text style={[styles.listDesc, { color: '#22c55e', fontWeight: '600' }]}>
                ₹{project.budget.toLocaleString()}
              </Text>
            </View>
          )}

          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[styles.listSub, { marginBottom: 0 }]}>Progress</Text>
              <TouchableOpacity
                onPress={() => setShowProgressModal(true)}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: '#2563eb',
                  borderRadius: 6,
                }}
              >
                <Ionicons name="create-outline" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1, height: 10, backgroundColor: '#0a0f1a', borderRadius: 5, overflow: 'hidden' }}>
                <View
                  style={{
                    height: 10,
                    width: `${project.progress || 0}%`,
                    backgroundColor: project.progress >= 70 ? '#22c55e' : project.progress >= 30 ? '#f59e0b' : '#ef4444',
                    borderRadius: 5,
                  }}
                />
              </View>
              <Text style={[styles.listDesc, { fontWeight: '600', minWidth: 40 }]}>{project.progress || 0}%</Text>
            </View>
          </View>
        </EnhancedCard>

        <EnhancedCard variant="elevated" style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.listTitle]}>Timeline</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProjectTimeline', { projectId: projectId })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: '#2563eb',
                borderRadius: 8,
                gap: 4,
              }}
            >
              <Ionicons name="add-circle-outline" size={14} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Manage</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={[styles.listSub, { marginBottom: 4 }]}>Start Date</Text>
            <Text style={styles.listDesc}>{formatDate(project.startDate)}</Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={[styles.listSub, { marginBottom: 4 }]}>Expected Completion</Text>
            <Text style={styles.listDesc}>{formatDate(project.expectedCompletionDate)}</Text>
          </View>

          {project.actualCompletionDate && (
            <View style={{ marginBottom: 12 }}>
              <Text style={[styles.listSub, { marginBottom: 4 }]}>Actual Completion</Text>
              <Text style={styles.listDesc}>{formatDate(project.actualCompletionDate)}</Text>
            </View>
          )}

          {project.timeline && project.timeline.length > 0 ? (
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1f2937' }}>
              <Text style={[styles.listSub, { marginBottom: 12, fontSize: 14, fontWeight: '600' }]}>Project Milestones</Text>
              {project.timeline
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((milestone, index) => (
                  <View key={milestone._id || index} style={{ marginBottom: 12 }}>
                    <TimelineItem 
                      milestone={milestone} 
                      isLast={index === project.timeline.length - 1}
                    />
                  </View>
                ))}
              <TouchableOpacity
                onPress={() => navigation.navigate('ProjectTimeline', { projectId: projectId })}
                style={{ 
                  marginTop: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: '#2563eb',
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
                  Manage Timeline
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1f2937' }}>
              <Text style={[styles.listSub, { marginBottom: 8, fontSize: 14, fontWeight: '600' }]}>Project Milestones</Text>
              <View style={{ 
                padding: 16, 
                backgroundColor: '#0a0f1a', 
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#1e293b',
              }}>
                <Ionicons name="time-outline" size={32} color="#64748b" />
                <Text style={[styles.listSub, { marginTop: 8, textAlign: 'center' }]}>
                  No milestones added yet
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ProjectTimeline', { projectId: projectId })}
                  style={{ 
                    marginTop: 8,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    backgroundColor: '#2563eb',
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                    Add Milestones
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </EnhancedCard>

        {project.assignedManpower && project.assignedManpower.length > 0 && (
          <EnhancedCard variant="elevated">
            <Text style={[styles.listTitle, { marginBottom: 12 }]}>Assigned Manpower</Text>
            {project.assignedManpower.map((person, index) => (
              <View key={person._id || index} style={{ marginBottom: 8 }}>
                <Text style={styles.listDesc}>
                  {person.name} - {person.role} ({person.employeeId})
                </Text>
              </View>
            ))}
          </EnhancedCard>
        )}
      </ScrollView>
      <ProgressEditModal
        visible={showProgressModal}
        currentProgress={project?.progress}
        onClose={() => setShowProgressModal(false)}
        onSave={async (progress) => {
          setUpdatingProgress(true);
          try {
            const response = await projectService.update(projectId, { progress });
            if (response.success) {
              showToast('Progress updated successfully', 'success');
              setShowProgressModal(false);
              fetchProject();
            } else {
              showToast(response.message || 'Failed to update progress', 'error');
            }
          } catch (error) {
            console.error('Error updating progress:', error);
            showToast(error.message || 'Failed to update progress', 'error');
          } finally {
            setUpdatingProgress(false);
          }
        }}
        loading={updatingProgress}
      />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </ScreenWrapper>
  );
}

