import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import EnhancedInput from '../../components/EnhancedInput';
import LoadingButton from '../../components/LoadingButton';
import Toast from '../../components/Toast';
import { materialService } from '../../services/materialService';
import { projectService } from '../../services/projectService';
import { styles as globalStyles } from '../../styles';

export default function AddMaterialScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const editMaterial = route?.params?.material;
  const editMaterialId = route?.params?.materialId;
  const isEditMode = !!editMaterial || !!editMaterialId;

  const [name, setName] = useState(editMaterial?.name || '');
  const [quantity, setQuantity] = useState(editMaterial?.quantity || '');
  const [type, setType] = useState(editMaterial?.type || 'Available');
  const [project, setProject] = useState(editMaterial?.project?._id || editMaterial?.project || '');
  const [location, setLocation] = useState(editMaterial?.location || '');
  const [priority, setPriority] = useState(editMaterial?.priority || 'Medium');
  const [status, setStatus] = useState(editMaterial?.status || 'Pending');
  const [neededBy, setNeededBy] = useState(
    editMaterial?.neededBy ? new Date(editMaterial.neededBy).toISOString().split('T')[0] : ''
  );
  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    fetchProjects();
    if (editMaterialId && !editMaterial) {
      fetchMaterial();
    }
  }, []);

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

  const fetchMaterial = async () => {
    try {
      const response = await materialService.getAll();
      if (response.success) {
        const found = response.data.find(m => (m._id || m.id) === editMaterialId);
        if (found) {
          setName(found.name || '');
          setQuantity(found.quantity || '');
          setType(found.type || 'Available');
          setProject(found.project?._id || found.project || '');
          setLocation(found.location || '');
          setPriority(found.priority || 'Medium');
          setStatus(found.status || 'Pending');
          setNeededBy(found.neededBy ? new Date(found.neededBy).toISOString().split('T')[0] : '');
        }
      }
    } catch (error) {
      console.error('Error fetching material:', error);
      showToast('Failed to load material', 'error');
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
    if (!name.trim()) newErrors.name = 'Material name is required';
    if (!quantity.trim()) newErrors.quantity = 'Quantity is required';
    if (!project) newErrors.project = 'Project is required';

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
        name: name.trim(),
        quantity: quantity.trim(),
        type,
        project,
        location: location.trim() || undefined,
        priority: type === 'Required' ? priority : undefined,
        status: type === 'Available' ? 'In Stock' : status,
        neededBy: type === 'Required' && neededBy ? neededBy : undefined,
      };

      let response;
      if (isEditMode && editMaterialId) {
        response = await materialService.update(editMaterialId, materialData);
        if (response.success) {
          showToast(`Material "${name}" updated successfully!`, 'success');
        }
      } else {
        response = await materialService.create(materialData);
        if (response.success) {
          showToast(`Material "${name}" added successfully!`, 'success');
        }
      }

      if (response.success) {
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        showToast(response.message || `Failed to ${isEditMode ? 'update' : 'create'} material`, 'error');
      }
    } catch (error) {
      console.error('Error saving material:', error);
      const errorMessage = error.message || error.errors?.[0]?.msg || 'Failed to save material';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BackButton />
        <Text style={globalStyles.sectionTitle}>
          {isEditMode ? 'Edit Material' : 'Add New Material'}
        </Text>

        <EnhancedInput
          label="Material Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          placeholder="e.g., Cement, Steel, Bricks"
          icon="cube-outline"
          error={errors.name}
          required
        />

        <EnhancedInput
          label="Quantity"
          value={quantity}
          onChangeText={(text) => {
            setQuantity(text);
            if (errors.quantity) setErrors({ ...errors, quantity: '' });
          }}
          placeholder="e.g., 100 bags, 50 tons"
          icon="calculator-outline"
          error={errors.quantity}
          required
        />

        <View style={{ marginBottom: 16 }}>
          <Text style={[globalStyles.inputLabel, { marginBottom: 8 }]}>Type *</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'Available' && styles.typeButtonSelected]}
              onPress={() => setType('Available')}
            >
              <Ionicons
                name={type === 'Available' ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={20}
                color={type === 'Available' ? '#10b981' : '#94a3b8'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'Available' && styles.typeButtonTextSelected,
                ]}
              >
                Available
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'Required' && styles.typeButtonSelected]}
              onPress={() => setType('Required')}
            >
              <Ionicons
                name={type === 'Required' ? 'alert-circle' : 'alert-circle-outline'}
                size={20}
                color={type === 'Required' ? '#ef4444' : '#94a3b8'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'Required' && styles.typeButtonTextSelected,
                ]}
              >
                Required
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={[globalStyles.inputLabel, { marginBottom: 8 }]}>Project *</Text>
          <View style={styles.projectContainer}>
            {projects.map((proj) => (
              <TouchableOpacity
                key={proj._id || proj.id}
                style={[
                  styles.projectButton,
                  (project === proj._id || project === proj.id) && styles.projectButtonSelected,
                ]}
                onPress={() => {
                  setProject(proj._id || proj.id);
                  if (errors.project) setErrors({ ...errors, project: '' });
                }}
              >
                <Text
                  style={[
                    styles.projectButtonText,
                    (project === proj._id || project === proj.id) && styles.projectButtonTextSelected,
                  ]}
                >
                  {proj.name} ({proj.projectId})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.project && (
            <Text style={globalStyles.errorText}>{errors.project}</Text>
          )}
        </View>

        <EnhancedInput
          label="Location (Optional)"
          value={location}
          onChangeText={setLocation}
          placeholder="e.g., Warehouse A, Site 1"
          icon="location-outline"
        />

        {type === 'Required' && (
          <>
            <View style={{ marginBottom: 16 }}>
              <Text style={[globalStyles.inputLabel, { marginBottom: 8 }]}>Priority</Text>
              <View style={styles.priorityContainer}>
                {['Low', 'Medium', 'High'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.priorityButton, priority === p && styles.priorityButtonSelected]}
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        priority === p && styles.priorityButtonTextSelected,
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <EnhancedInput
              label="Needed By (Optional)"
              value={neededBy}
              onChangeText={setNeededBy}
              placeholder="YYYY-MM-DD"
              icon="calendar-outline"
            />
          </>
        )}

        {type === 'Available' ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={[globalStyles.inputLabel, { marginBottom: 8 }]}>Status</Text>
            <View style={styles.statusContainer}>
              {['Pending', 'In Stock'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusButton, status === s && styles.statusButtonSelected]}
                  onPress={() => setStatus(s)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === s && styles.statusButtonTextSelected,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={{ marginBottom: 16 }}>
            <Text style={[globalStyles.inputLabel, { marginBottom: 8 }]}>Status</Text>
            <View style={styles.statusContainer}>
              {['Pending', 'Ordered', 'Delivered'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusButton, status === s && styles.statusButtonSelected]}
                  onPress={() => setStatus(s)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === s && styles.statusButtonTextSelected,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <LoadingButton
          title={isEditMode ? 'Update Material' : 'Add Material'}
          onPress={handleSubmit}
          loading={loading}
          icon={isEditMode ? 'checkmark-circle-outline' : 'add-circle-outline'}
          variant="success"
          fullWidth
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
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#0a0f1a',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1e293b',
    gap: 8,
  },
  typeButtonSelected: {
    backgroundColor: '#0b1220',
    borderColor: '#22c55e',
  },
  typeButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  typeButtonTextSelected: {
    color: '#22c55e',
  },
  projectContainer: {
    gap: 8,
    maxHeight: 200,
  },
  projectButton: {
    padding: 12,
    backgroundColor: '#0a0f1a',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1e293b',
  },
  projectButtonSelected: {
    backgroundColor: '#0b1220',
    borderColor: '#2563eb',
  },
  projectButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  projectButtonTextSelected: {
    color: '#2563eb',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#0a0f1a',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  priorityButtonSelected: {
    backgroundColor: '#0b1220',
    borderColor: '#f59e0b',
  },
  priorityButtonText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  priorityButtonTextSelected: {
    color: '#f59e0b',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#0a0f1a',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  statusButtonSelected: {
    backgroundColor: '#0b1220',
    borderColor: '#22c55e',
  },
  statusButtonText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  statusButtonTextSelected: {
    color: '#22c55e',
  },
});

