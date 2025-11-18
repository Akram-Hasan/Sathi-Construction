import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import EnhancedInput from '../../components/EnhancedInput';
import LoadingButton from '../../components/LoadingButton';
import Toast from '../../components/Toast';
import { projectService } from '../../services/projectService';
import { validateRequired } from '../../utils/validation';
import { styles as globalStyles } from '../../styles';

export default function IssueReportScreen() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [issueType, setIssueType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      if (response.success) {
        setProjects(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedProject) {
      newErrors.selectedProject = 'Please select a project';
    }
    const titleError = validateRequired(title, 'Issue title');
    const descError = validateRequired(description, 'Description');
    if (titleError) newErrors.title = titleError;
    if (descError) newErrors.description = descError;
    if (!issueType) {
      newErrors.issueType = 'Please select issue type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      // In a real app, you would send this to a backend API
      // For now, we'll show a success message
      showToast('Issue reported successfully! Admin will be notified.', 'success');
      setTimeout(() => {
        setSelectedProject('');
        setIssueType('');
        setTitle('');
        setDescription('');
        setPriority('Medium');
      }, 2000);
    } catch (error) {
      console.error('Error reporting issue:', error);
      showToast('Failed to report issue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'High':
        return { bg: '#fee2e2', text: '#ef4444' };
      case 'Medium':
        return { bg: '#fef3c7', text: '#f59e0b' };
      case 'Low':
        return { bg: '#dbeafe', text: '#60a5fa' };
      default:
        return { bg: '#1f2937', text: '#94a3b8' };
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BackButton />
        <Text style={globalStyles.sectionTitle}>Report Issue</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            ⚠️ Report any issues, delays, or problems encountered on site
          </Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <View style={{ marginBottom: 6 }}>
            <Text style={{ color: '#e2e8f0', fontSize: 14, fontWeight: '600' }}>
              Select Project <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
          </View>
          {projectsLoading ? (
            <Text style={{ color: '#94a3b8', padding: 12 }}>Loading projects...</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {projects.map((project) => {
                const isSelected = selectedProject === (project._id || project.id);
                return (
                  <TouchableOpacity
                    key={project._id || project.id}
                    onPress={() => {
                      setSelectedProject(project._id || project.id);
                      if (errors.selectedProject) setErrors({ ...errors, selectedProject: '' });
                    }}
                    style={[
                      styles.projectChip,
                      isSelected && styles.projectChipSelected
                    ]}
                  >
                    <Text style={[
                      styles.projectChipText,
                      isSelected && styles.projectChipTextSelected
                    ]}>
                      {project.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
          {errors.selectedProject && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.selectedProject}</Text>
          )}
        </View>

        <View style={{ marginBottom: 16 }}>
          <View style={{ marginBottom: 6 }}>
            <Text style={{ color: '#e2e8f0', fontSize: 14, fontWeight: '600' }}>
              Issue Type <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['Safety', 'Material', 'Equipment', 'Manpower', 'Other'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  setIssueType(type);
                  if (errors.issueType) setErrors({ ...errors, issueType: '' });
                }}
                style={[
                  styles.typeChip,
                  issueType === type && styles.typeChipSelected
                ]}
              >
                <Text style={[
                  styles.typeChipText,
                  issueType === type && styles.typeChipTextSelected
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.issueType && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.issueType}</Text>
          )}
        </View>

        <EnhancedInput
          label="Issue Title"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (errors.title) setErrors({ ...errors, title: '' });
          }}
          placeholder="Brief title for the issue"
          icon="alert-circle-outline"
          error={errors.title}
          required
        />

        <EnhancedInput
          label="Description"
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            if (errors.description) setErrors({ ...errors, description: '' });
          }}
          placeholder="Describe the issue in detail..."
          icon="document-text-outline"
          multiline
          numberOfLines={6}
          error={errors.description}
          helperText="Provide detailed information about the issue"
          required
        />

        <View style={{ marginBottom: 16 }}>
          <View style={{ marginBottom: 6 }}>
            <Text style={{ color: '#e2e8f0', fontSize: 14, fontWeight: '600' }}>
              Priority
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['Low', 'Medium', 'High'].map((p) => {
              const priorityColor = getPriorityColor(p);
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[
                    styles.priorityChip,
                    priority === p && { backgroundColor: priorityColor.bg, borderColor: priorityColor.text }
                  ]}
                >
                  <Text style={[
                    styles.priorityChipText,
                    priority === p && { color: priorityColor.text }
                  ]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <LoadingButton
          title="Submit Issue Report"
          onPress={handleSubmit}
          loading={loading}
          icon="send-outline"
          variant="error"
          fullWidth
          style={{ marginTop: 8 }}
        />
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
  infoCard: {
    backgroundColor: '#0b1220',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginTop: 12,
    marginBottom: 20,
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
  projectChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#0a0f1a',
    borderWidth: 1.5,
    borderColor: '#1e293b',
    marginRight: 8,
  },
  projectChipSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  projectChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  projectChipTextSelected: {
    color: '#fff',
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#0a0f1a',
    borderWidth: 1.5,
    borderColor: '#1e293b',
  },
  typeChipSelected: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  typeChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  typeChipTextSelected: {
    color: '#fff',
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0a0f1a',
    borderWidth: 1.5,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  priorityChipText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 13,
  },
});

