import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import EnhancedCard from '../../components/EnhancedCard';
import TimelineItem from '../../components/TimelineItem';
import { projectService } from '../../services/projectService';
import { materialService } from '../../services/materialService';
import { styles as globalStyles } from '../../styles';
import Toast from '../../components/Toast';

export default function ProjectDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const projectId = route?.params?.projectId || route?.params?.project?._id || route?.params?.project?.id;
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const fetchData = async () => {
    try {
      if (projectId) {
        const [projectResponse, materialsResponse] = await Promise.all([
          projectService.getById(projectId),
          materialService.getAll()
        ]);

        if (projectResponse.success) {
          setProject(projectResponse.data);
        }

        if (materialsResponse.success) {
          const allMaterials = materialsResponse.data || [];
          // Filter materials for this project
          const projectMaterials = allMaterials.filter(m => {
            const materialProjectId = m.project?._id || m.project?._id || m.project;
            return materialProjectId && materialProjectId.toString() === projectId.toString();
          });
          setMaterials(projectMaterials);
        }
      } else if (route?.params?.project) {
        setProject(route.params.project);
        const projectIdForMaterials = route.params.project._id || route.params.project.id;
        const materialsResponse = await materialService.getAll();
        if (materialsResponse.success) {
          const allMaterials = materialsResponse.data || [];
          const projectMaterials = allMaterials.filter(m => {
            const materialProjectId = m.project?._id || m.project?._id || m.project;
            return materialProjectId && materialProjectId.toString() === projectIdForMaterials.toString();
          });
          setMaterials(projectMaterials);
        }
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      showToast('Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [projectId])
  );

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
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
  const availableMaterials = materials.filter(m => m.type === 'Available');
  const requiredMaterials = materials.filter(m => m.type === 'Required');
  const sortedTimeline = project.timeline ? [...project.timeline].sort((a, b) => new Date(a.date) - new Date(b.date)) : [];

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BackButton />

        <EnhancedCard variant="elevated" style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[globalStyles.listTitle, { fontSize: 22, marginBottom: 4 }]}>{project.name}</Text>
              <Text style={globalStyles.listSub}>#{project.projectId}</Text>
            </View>
            <View style={[globalStyles.badge, { backgroundColor: statusColor.bg }]}>
              <Text style={[globalStyles.badgeText, { color: statusColor.text }]}>
                {project.status || 'N/A'}
              </Text>
            </View>
          </View>

          {project.description && (
            <Text style={[globalStyles.listDesc, { marginTop: 8 }]}>{project.description}</Text>
          )}
        </EnhancedCard>

        <EnhancedCard variant="elevated" style={{ marginBottom: 16 }}>
          <Text style={[globalStyles.listTitle, { marginBottom: 12 }]}>Project Information</Text>

          <View style={{ marginBottom: 12 }}>
            <Text style={[globalStyles.listSub, { marginBottom: 4 }]}>Location</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location" size={16} color="#22c55e" style={{ marginRight: 6 }} />
              <Text style={globalStyles.listDesc}>{project.location || 'Not specified'}</Text>
            </View>
          </View>

          {project.clientName && (
            <View style={{ marginBottom: 12 }}>
              <Text style={[globalStyles.listSub, { marginBottom: 4 }]}>Client</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="person" size={16} color="#60a5fa" style={{ marginRight: 6 }} />
                <Text style={globalStyles.listDesc}>{project.clientName}</Text>
              </View>
            </View>
          )}

          {project.budget && (
            <View style={{ marginBottom: 12 }}>
              <Text style={[globalStyles.listSub, { marginBottom: 4 }]}>Budget</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="wallet" size={16} color="#22c55e" style={{ marginRight: 6 }} />
                <Text style={[globalStyles.listDesc, { color: '#22c55e', fontWeight: '600' }]}>
                  ₹{project.budget.toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          <View style={{ marginBottom: 12 }}>
            <Text style={[globalStyles.listSub, { marginBottom: 8 }]}>Progress</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1, height: 12, backgroundColor: '#0a0f1a', borderRadius: 6, overflow: 'hidden' }}>
                <View
                  style={{
                    height: 12,
                    width: `${project.progress || 0}%`,
                    backgroundColor: project.progress >= 70 ? '#22c55e' : project.progress >= 30 ? '#f59e0b' : '#ef4444',
                    borderRadius: 6,
                  }}
                />
              </View>
              <Text style={[globalStyles.listDesc, { fontWeight: '700', minWidth: 45, fontSize: 14 }]}>
                {project.progress || 0}%
              </Text>
            </View>
          </View>
        </EnhancedCard>

        <EnhancedCard variant="elevated" style={{ marginBottom: 16 }}>
          <Text style={[globalStyles.listTitle, { marginBottom: 12 }]}>Timeline</Text>

          <View style={{ marginBottom: 12 }}>
            <Text style={[globalStyles.listSub, { marginBottom: 4 }]}>Start Date</Text>
            <Text style={globalStyles.listDesc}>{formatDate(project.startDate)}</Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={[globalStyles.listSub, { marginBottom: 4 }]}>Expected Completion</Text>
            <Text style={globalStyles.listDesc}>{formatDate(project.expectedCompletionDate)}</Text>
          </View>

          {project.actualCompletionDate && (
            <View style={{ marginBottom: 12 }}>
              <Text style={[globalStyles.listSub, { marginBottom: 4 }]}>Actual Completion</Text>
              <Text style={globalStyles.listDesc}>{formatDate(project.actualCompletionDate)}</Text>
            </View>
          )}

          {sortedTimeline.length > 0 && (
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1f2937' }}>
              <Text style={[globalStyles.listSub, { marginBottom: 12, fontSize: 14, fontWeight: '600' }]}>Project Milestones</Text>
              {sortedTimeline.map((milestone, index) => (
                <View key={milestone._id || index} style={{ marginBottom: 12 }}>
                  <TimelineItem
                    milestone={milestone}
                    isLast={index === sortedTimeline.length - 1}
                  />
                </View>
              ))}
            </View>
          )}
        </EnhancedCard>

        {materials.length > 0 && (
          <EnhancedCard variant="elevated" style={{ marginBottom: 16 }}>
            <Text style={[globalStyles.listTitle, { marginBottom: 12 }]}>Materials</Text>

            {availableMaterials.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" style={{ marginRight: 6 }} />
                  <Text style={[globalStyles.listSub, { fontSize: 14, fontWeight: '600' }]}>
                    Available ({availableMaterials.length})
                  </Text>
                </View>
                {availableMaterials.slice(0, 3).map((m) => (
                  <View key={m._id || m.id} style={{ marginBottom: 6, paddingLeft: 22 }}>
                    <Text style={[globalStyles.listDesc, { fontSize: 13 }]}>
                      {m.name} - {m.quantity}
                    </Text>
                  </View>
                ))}
                {availableMaterials.length > 3 && (
                  <Text style={[globalStyles.listSub, { fontSize: 11, paddingLeft: 22, marginTop: 4 }]}>
                    +{availableMaterials.length - 3} more
                  </Text>
                )}
              </View>
            )}

            {requiredMaterials.length > 0 && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 6 }} />
                  <Text style={[globalStyles.listSub, { fontSize: 14, fontWeight: '600' }]}>
                    Required ({requiredMaterials.length})
                  </Text>
                </View>
                {requiredMaterials.slice(0, 3).map((m) => (
                  <View key={m._id || m.id} style={{ marginBottom: 6, paddingLeft: 22 }}>
                    <Text style={[globalStyles.listDesc, { fontSize: 13 }]}>
                      {m.name} - {m.quantity}
                    </Text>
                  </View>
                ))}
                {requiredMaterials.length > 3 && (
                  <Text style={[globalStyles.listSub, { fontSize: 11, paddingLeft: 22, marginTop: 4 }]}>
                    +{requiredMaterials.length - 3} more
                  </Text>
                )}
              </View>
            )}
          </EnhancedCard>
        )}

        {project.assignedManpower && project.assignedManpower.length > 0 && (
          <EnhancedCard variant="elevated">
            <Text style={[globalStyles.listTitle, { marginBottom: 12 }]}>Assigned Manpower</Text>
            {project.assignedManpower.map((person, index) => (
              <View key={person._id || index} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="person" size={16} color="#60a5fa" style={{ marginRight: 8 }} />
                <Text style={globalStyles.listDesc}>
                  {person.name} - {person.role} ({person.employeeId})
                </Text>
              </View>
            ))}
          </EnhancedCard>
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

