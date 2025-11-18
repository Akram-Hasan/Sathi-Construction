import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import EnhancedInput from '../../components/EnhancedInput';
import LoadingButton from '../../components/LoadingButton';
import Toast from '../../components/Toast';
import { materialService } from '../../services/materialService';
import { projectService } from '../../services/projectService';
import { validateRequired } from '../../utils/validation';
import { styles } from '../../styles';

export default function MaterialRequestScreen() {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [neededBy, setNeededBy] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
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
    const projectError = validateRequired(selectedProject, 'Project');
    const nameError = validateRequired(materialName, 'Material name');
    const quantityError = validateRequired(quantity, 'Quantity');

    if (projectError) newErrors.selectedProject = projectError;
    if (nameError) newErrors.materialName = nameError;
    if (quantityError) newErrors.quantity = quantityError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setLoading(true);
    try {
      const materialData = {
        project: selectedProject,
        name: materialName.trim(),
        quantity: quantity.trim(),
        type: 'Required',
        priority: priority,
        neededBy: neededBy ? new Date(neededBy) : undefined,
        location: location.trim() || undefined,
      };

      const response = await materialService.create(materialData);
      
      if (response.success) {
        showToast('Material request submitted successfully!', 'success');
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        showToast(response.message || 'Failed to submit material request', 'error');
      }
    } catch (error) {
      console.error('Error submitting material request:', error);
      const errorMessage = error.message || error.errors?.[0]?.msg || 'Failed to submit material request';
      showToast(errorMessage, 'error');
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
        <Text style={styles.sectionTitle}>Request Material</Text>

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
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: isSelected ? '#22c55e' : '#0a0f1a',
                      borderWidth: 1.5,
                      borderColor: isSelected ? '#22c55e' : '#1e293b',
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ color: isSelected ? '#fff' : '#94a3b8', fontWeight: '600', fontSize: 13 }}>
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

        <EnhancedInput
          label="Material Name"
          value={materialName}
          onChangeText={(text) => {
            setMaterialName(text);
            if (errors.materialName) setErrors({ ...errors, materialName: '' });
          }}
          placeholder="e.g., Cement, Steel Rods, Sand"
          icon="cube-outline"
          error={errors.materialName}
          required
        />

        <EnhancedInput
          label="Quantity"
          value={quantity}
          onChangeText={(text) => {
            setQuantity(text);
            if (errors.quantity) setErrors({ ...errors, quantity: '' });
          }}
          placeholder="e.g., 50 bags, 2 tons, 100 cubic ft"
          icon="scale-outline"
          error={errors.quantity}
          helperText="Specify quantity with unit"
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
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: priority === p ? priorityColor.bg : '#0a0f1a',
                    borderWidth: 1.5,
                    borderColor: priority === p ? priorityColor.text : '#1e293b',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: priority === p ? priorityColor.text : '#94a3b8', fontWeight: '600', fontSize: 13 }}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <EnhancedInput
          label="Needed By Date"
          value={neededBy}
          onChangeText={setNeededBy}
          placeholder="YYYY-MM-DD (optional)"
          icon="calendar-outline"
          helperText="Format: YYYY-MM-DD"
        />

        <EnhancedInput
          label="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="Where the material is needed (optional)"
          icon="location-outline"
          helperText="Specific location on site"
        />

        <LoadingButton
          title="Submit Request"
          onPress={handleSubmit}
          loading={loading}
          icon="send-outline"
          variant="success"
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

