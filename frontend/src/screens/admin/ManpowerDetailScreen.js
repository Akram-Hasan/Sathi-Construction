import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import EnhancedCard from '../../components/EnhancedCard';
import { manpowerService } from '../../services/manpowerService';
import { projectService } from '../../services/projectService';
import { styles } from '../../styles';
import Toast from '../../components/Toast';
import LoadingButton from '../../components/LoadingButton';

export default function ManpowerDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const manpowerId = route?.params?.manpowerId;
  const [manpower, setManpower] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    fetchManpower();
    fetchProjects();
  }, [manpowerId]);

  const fetchManpower = async () => {
    try {
      // Since there's no getById, we'll fetch all and filter
      const response = await manpowerService.getAll();
      if (response.success) {
        const found = response.data.find(m => (m._id || m.id) === manpowerId);
        if (found) {
          setManpower(found);
        } else {
          showToast('Manpower not found', 'error');
        }
      } else {
        showToast('Failed to load manpower', 'error');
      }
    } catch (error) {
      console.error('Error fetching manpower:', error);
      showToast(error.message || 'Failed to load manpower', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      if (response.success) {
        setProjects(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleAssignProject = async (projectId) => {
    if (!projectId) {
      showToast('Please select a project', 'error');
      return;
    }

    setAssigning(true);
    try {
      const response = await manpowerService.update(manpowerId, {
        assignedProject: projectId
      });
      
      if (response.success) {
        showToast('Manpower assigned to project successfully', 'success');
        setShowProjectPicker(false);
        fetchManpower(); // Refresh data
      } else {
        showToast(response.message || 'Failed to assign project', 'error');
      }
    } catch (error) {
      console.error('Error assigning project:', error);
      showToast(error.message || 'Failed to assign project', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignProject = async () => {
    setAssigning(true);
    try {
      const response = await manpowerService.update(manpowerId, {
        assignedProject: null
      });
      
      if (response.success) {
        showToast('Manpower unassigned from project successfully', 'success');
        fetchManpower(); // Refresh data
      } else {
        showToast(response.message || 'Failed to unassign project', 'error');
      }
    } catch (error) {
      console.error('Error unassigning project:', error);
      showToast(error.message || 'Failed to unassign project', 'error');
    } finally {
      setAssigning(false);
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
      'Delete Manpower',
      `Are you sure you want to delete "${manpower?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const response = await manpowerService.delete(manpowerId);
              if (response.success) {
                showToast('Manpower deleted successfully', 'success');
                setTimeout(() => navigation.goBack(), 1500);
              } else {
                showToast(response.message || 'Failed to delete manpower', 'error');
              }
            } catch (error) {
              console.error('Error deleting manpower:', error);
              showToast(error.message || 'Failed to delete manpower', 'error');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
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

  if (!manpower) {
    return (
      <ScreenWrapper>
        <BackButton />
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={{ color: '#94a3b8', fontSize: 16 }}>Manpower not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BackButton />
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>Manpower Details</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddManpower', { manpowerId: manpowerId, manpower: manpower })}
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
              <Text style={[styles.listTitle, { fontSize: 20, marginBottom: 4 }]}>{manpower.name}</Text>
              <Text style={styles.listSub}>ID: {manpower.employeeId}</Text>
            </View>
            <View style={[
              styles.badge, 
              { 
                backgroundColor: manpower.assignedProject ? '#fee2e2' : '#d1fae5',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }
            ]}>
              <Ionicons 
                name={manpower.assignedProject ? 'close-circle' : 'checkmark-circle'} 
                size={16} 
                color={manpower.assignedProject ? '#ef4444' : '#10b981'} 
              />
              <Text style={[
                styles.badgeText, 
                { color: manpower.assignedProject ? '#ef4444' : '#10b981' }
              ]}>
                {manpower.assignedProject ? 'Unavailable' : 'Available'}
              </Text>
            </View>
          </View>
          {manpower.assignedProject && (
            <View style={{ 
              marginTop: 8, 
              padding: 10, 
              backgroundColor: '#fee2e2', 
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}>
              <Ionicons name="information-circle" size={16} color="#ef4444" />
              <Text style={{ color: '#ef4444', fontSize: 12, flex: 1 }}>
                Currently assigned to project: <Text style={{ fontWeight: '600' }}>{manpower.assignedProject.name}</Text>
              </Text>
            </View>
          )}
        </EnhancedCard>

        <EnhancedCard variant="elevated" style={{ marginBottom: 16 }}>
          <Text style={[styles.listTitle, { marginBottom: 12 }]}>Personal Information</Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={[styles.listSub, { marginBottom: 4 }]}>Role</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="briefcase" size={16} color="#22c55e" style={{ marginRight: 6 }} />
              <Text style={styles.listDesc}>{manpower.role || 'Not specified'}</Text>
            </View>
          </View>

          {manpower.phone && (
            <View style={{ marginBottom: 12 }}>
              <Text style={[styles.listSub, { marginBottom: 4 }]}>Phone</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="call" size={16} color="#22c55e" style={{ marginRight: 6 }} />
                <Text style={styles.listDesc}>{manpower.phone}</Text>
              </View>
            </View>
          )}

          {manpower.email && (
            <View style={{ marginBottom: 12 }}>
              <Text style={[styles.listSub, { marginBottom: 4 }]}>Email</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail" size={16} color="#22c55e" style={{ marginRight: 6 }} />
                <Text style={styles.listDesc}>{manpower.email}</Text>
              </View>
            </View>
          )}
        </EnhancedCard>

        <EnhancedCard variant="elevated" style={{ marginBottom: 16 }}>
          <Text style={[styles.listTitle, { marginBottom: 12 }]}>Professional Details</Text>
          
          {manpower.experience && (
            <View style={{ marginBottom: 12 }}>
              <Text style={[styles.listSub, { marginBottom: 4 }]}>Experience</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="time" size={16} color="#f59e0b" style={{ marginRight: 6 }} />
                <Text style={styles.listDesc}>{manpower.experience}</Text>
              </View>
            </View>
          )}

          {manpower.skills && (
            <View>
              <Text style={[styles.listSub, { marginBottom: 4 }]}>Skills</Text>
              <Text style={styles.listDesc}>{manpower.skills}</Text>
            </View>
          )}
        </EnhancedCard>

        <EnhancedCard variant="elevated" style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.listTitle]}>Project Assignment</Text>
            {!manpower.assignedProject && (
              <TouchableOpacity
                onPress={() => setShowProjectPicker(!showProjectPicker)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: '#2563eb',
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                  {showProjectPicker ? 'Cancel' : 'Assign Project'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {manpower.assignedProject ? (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="folder" size={16} color="#60a5fa" style={{ marginRight: 6 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.listDesc}>
                    {manpower.assignedProject.name} ({manpower.assignedProject.projectId})
                  </Text>
                  <Text style={[styles.listSub, { marginTop: 4, fontSize: 11 }]}>
                    This person is not available for other projects
                  </Text>
                </View>
              </View>
              <LoadingButton
                title="Unassign from Project"
                onPress={handleUnassignProject}
                loading={assigning}
                icon="close-circle"
                variant="danger"
                fullWidth
              />
            </View>
          ) : showProjectPicker ? (
            <View>
              <Text style={[styles.listSub, { marginBottom: 8 }]}>Select a project to assign:</Text>
              <ScrollView style={{ maxHeight: 200 }}>
                {projects.map((project) => (
                  <TouchableOpacity
                    key={project._id || project.id}
                    onPress={() => handleAssignProject(project._id || project.id)}
                    style={{
                      padding: 12,
                      backgroundColor: '#0a0f1a',
                      borderRadius: 8,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: '#1e293b',
                    }}
                    disabled={assigning}
                  >
                    <Text style={[styles.listTitle, { fontSize: 14 }]}>{project.name}</Text>
                    <Text style={[styles.listSub, { fontSize: 12 }]}>
                      {project.projectId} • {project.location || 'No location'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={{ 
              padding: 16, 
              alignItems: 'center', 
              backgroundColor: '#d1fae5', 
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#10b981',
            }}>
              <Ionicons name="checkmark-circle" size={32} color="#10b981" />
              <Text style={[styles.listSub, { marginTop: 8, textAlign: 'center', color: '#10b981', fontWeight: '600' }]}>
                Status: Available
              </Text>
              <Text style={[styles.listSub, { marginTop: 4, textAlign: 'center', fontSize: 11, color: '#059669' }]}>
                No project assigned. This person can be assigned to a project.
              </Text>
            </View>
          )}
        </EnhancedCard>
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

