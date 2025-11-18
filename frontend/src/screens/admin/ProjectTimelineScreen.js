import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import EnhancedCard from '../../components/EnhancedCard';
import EnhancedInput from '../../components/EnhancedInput';
import LoadingButton from '../../components/LoadingButton';
import TimelineItem from '../../components/TimelineItem';
import { projectService } from '../../services/projectService';
import Toast from '../../components/Toast';

export default function ProjectTimelineScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const projectId = route?.params?.projectId;
  const [project, setProject] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    icon: 'checkmark-circle',
  });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await projectService.getById(projectId);
      if (response.success) {
        setProject(response.data);
        setTimeline(response.data.timeline || []);
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

  const handleAddMilestone = async () => {
    if (!newMilestone.title.trim()) {
      showToast('Please enter a milestone title', 'error');
      return;
    }

    if (!newMilestone.date) {
      showToast('Please enter a date', 'error');
      return;
    }

    setSaving(true);
    try {
      // Create new milestone without _id - backend will generate it
      const newMilestoneData = {
        title: newMilestone.title.trim(),
        description: newMilestone.description.trim() || '',
        date: newMilestone.date,
        icon: newMilestone.icon || 'checkmark-circle'
      };
      
      // Add to timeline array (without _id for new items)
      const updatedTimeline = [...timeline, newMilestoneData];
      const response = await projectService.update(projectId, { timeline: updatedTimeline });
      
      if (response.success) {
        // Refresh from server to get the actual _id values
        await fetchProject();
        setNewMilestone({ title: '', description: '', date: new Date().toISOString().split('T')[0], icon: 'checkmark-circle' });
        setShowAddForm(false);
        showToast('Milestone added successfully', 'success');
      } else {
        showToast(response.message || 'Failed to add milestone', 'error');
      }
    } catch (error) {
      console.error('Error adding milestone:', error);
      showToast(error.message || 'Failed to add milestone', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMilestone = (milestoneId) => {
    Alert.alert(
      'Delete Milestone',
      'Are you sure you want to delete this milestone?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              // Filter out the milestone to delete
              const updatedTimeline = timeline.filter(m => {
                const id = m._id || m.id;
                return id && id.toString() !== milestoneId.toString();
              });
              
              const response = await projectService.update(projectId, { timeline: updatedTimeline });
              
              if (response.success) {
                // Refresh from server to get updated data
                await fetchProject();
                showToast('Milestone deleted successfully', 'success');
              } else {
                showToast(response.message || 'Failed to delete milestone', 'error');
              }
            } catch (error) {
              console.error('Error deleting milestone:', error);
              showToast(error.message || 'Failed to delete milestone', 'error');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const iconOptions = [
    { name: 'checkmark-circle', label: 'Complete' },
    { name: 'flag', label: 'Milestone' },
    { name: 'calendar', label: 'Event' },
    { name: 'construct', label: 'Construction' },
    { name: 'build', label: 'Work' },
    { name: 'document', label: 'Document' },
  ];

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#94a3b8' }}>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BackButton />
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Project Timeline</Text>
            <Text style={styles.subtitle}>{project?.name}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddForm(!showAddForm)}
            style={styles.addButton}
          >
            <Ionicons name={showAddForm ? 'close' : 'add'} size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <EnhancedCard variant="elevated" style={{ marginBottom: 16 }}>
            <Text style={[styles.listTitle, { marginBottom: 12 }]}>Add Milestone</Text>
            
            <EnhancedInput
              label="Title"
              value={newMilestone.title}
              onChangeText={(text) => setNewMilestone({ ...newMilestone, title: text })}
              placeholder="Enter milestone title"
              icon="flag-outline"
            />

            <EnhancedInput
              label="Description"
              value={newMilestone.description}
              onChangeText={(text) => setNewMilestone({ ...newMilestone, description: text })}
              placeholder="Enter description (optional)"
              icon="document-text-outline"
              multiline
              numberOfLines={3}
            />

            <EnhancedInput
              label="Date"
              value={newMilestone.date}
              onChangeText={(text) => setNewMilestone({ ...newMilestone, date: text })}
              placeholder="YYYY-MM-DD"
              icon="calendar-outline"
            />

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#e2e8f0', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Icon</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {iconOptions.map((icon) => (
                  <TouchableOpacity
                    key={icon.name}
                    onPress={() => setNewMilestone({ ...newMilestone, icon: icon.name })}
                    style={[
                      styles.iconOption,
                      newMilestone.icon === icon.name && styles.iconOptionSelected,
                    ]}
                  >
                    <Ionicons 
                      name={icon.name} 
                      size={20} 
                      color={newMilestone.icon === icon.name ? '#fff' : '#94a3b8'} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <LoadingButton
              title="Add Milestone"
              onPress={handleAddMilestone}
              loading={saving}
              icon="add-circle"
              variant="success"
              fullWidth
            />
          </EnhancedCard>
        )}

        <EnhancedCard variant="elevated">
          {timeline.length > 0 ? (
            timeline
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((milestone, index) => (
                <View key={milestone._id || milestone.id || index}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <TimelineItem 
                        milestone={milestone} 
                        isLast={index === timeline.length - 1}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteMilestone(milestone._id || milestone.id)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#64748b" />
              <Text style={styles.emptyText}>No timeline milestones yet</Text>
              <Text style={styles.emptySubText}>Add milestones to track project progress</Text>
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

const styles = StyleSheet.create({
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0a0f1a',
    borderWidth: 1.5,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOptionSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
    marginTop: 4,
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
  listTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
});

