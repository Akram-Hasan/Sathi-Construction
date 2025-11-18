import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import EnhancedInput from '../../components/EnhancedInput';
import LoadingButton from '../../components/LoadingButton';
import Toast from '../../components/Toast';
import { validateRequired, validateProjectId } from '../../utils/validation';
import { projectService } from '../../services/projectService';
import { styles } from '../../styles';

export default function AddProjectScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const editProject = route?.params?.project;
  const editProjectId = route?.params?.projectId;
  const isEditMode = !!editProject || !!editProjectId;

  const [projectName, setProjectName] = useState(editProject?.name || '');
  const [projectId, setProjectId] = useState(editProject?.projectId || '');
  const [location, setLocation] = useState(editProject?.location || '');
  const [description, setDescription] = useState(editProject?.description || '');
  const [clientName, setClientName] = useState(editProject?.clientName || '');
  const [budget, setBudget] = useState(editProject?.budget?.toString() || '');
  const [startDate, setStartDate] = useState(editProject?.startDate ? new Date(editProject.startDate).toISOString().split('T')[0] : '');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(editProject?.expectedCompletionDate ? new Date(editProject.expectedCompletionDate).toISOString().split('T')[0] : '');
  const [status, setStatus] = useState(editProject?.status || 'Planning');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    if (editProjectId && !editProject) {
      // Fetch project if only ID provided
      const fetchProject = async () => {
        try {
          const response = await projectService.getById(editProjectId);
          if (response.success) {
            const proj = response.data;
            setProjectName(proj.name || '');
            setProjectId(proj.projectId || '');
            setLocation(proj.location || '');
            setDescription(proj.description || '');
            setClientName(proj.clientName || '');
            setBudget(proj.budget?.toString() || '');
            setStartDate(proj.startDate ? new Date(proj.startDate).toISOString().split('T')[0] : '');
            setExpectedCompletionDate(proj.expectedCompletionDate ? new Date(proj.expectedCompletionDate).toISOString().split('T')[0] : '');
            setStatus(proj.status || 'Planning');
          }
        } catch (error) {
          console.error('Error fetching project:', error);
        }
      };
      fetchProject();
    }
  }, [editProjectId, editProject]);

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const validateForm = () => {
    const newErrors = {};
    const nameError = validateRequired(projectName, 'Project name');
    const idError = validateProjectId(projectId);
    const locationError = validateRequired(location, 'Location');

    if (nameError) newErrors.projectName = nameError;
    if (idError) newErrors.projectId = idError;
    if (locationError) newErrors.location = locationError;

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
      const projectData = {
        projectId: projectId.toUpperCase(),
        name: projectName,
        location: location,
        description: description || undefined,
        clientName: clientName.trim() || undefined,
        budget: budget ? parseFloat(budget.replace(/[^0-9.]/g, '')) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : undefined,
        status: status,
      };

      let response;
      if (isEditMode && editProjectId) {
        response = await projectService.update(editProjectId, projectData);
        if (response.success) {
          showToast(`Project "${projectName}" updated successfully!`, 'success');
        }
      } else {
        response = await projectService.create(projectData);
        if (response.success) {
          showToast(`Project "${projectName}" added successfully!`, 'success');
        }
      }
      
      if (response.success) {
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        showToast(response.message || `Failed to ${isEditMode ? 'update' : 'create'} project`, 'error');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = error.message || error.errors?.[0]?.msg || 'Failed to create project';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BackButton />
        <Text style={styles.sectionTitle}>{isEditMode ? 'Edit Project' : 'Add New Project'}</Text>

        <EnhancedInput
          label="Project Name"
          value={projectName}
          onChangeText={(text) => {
            setProjectName(text);
            if (errors.projectName) setErrors({ ...errors, projectName: '' });
          }}
          placeholder="Enter project name"
          icon="business-outline"
          error={errors.projectName}
          helperText="Enter a descriptive name for the project"
          required
        />

        <EnhancedInput
          label="Project ID"
          value={projectId}
          onChangeText={(text) => {
            const upperText = text.toUpperCase();
            setProjectId(upperText);
            if (errors.projectId) setErrors({ ...errors, projectId: '' });
          }}
          placeholder="PJT-001"
          icon="barcode-outline"
          error={errors.projectId}
          helperText="Format: XXX-000 (e.g., PJT-001)"
          maxLength={7}
          required
          editable={!isEditMode}
        />

        <EnhancedInput
          label="Location"
          value={location}
          onChangeText={(text) => {
            setLocation(text);
            if (errors.location) setErrors({ ...errors, location: '' });
          }}
          placeholder="Enter project location"
          icon="location-outline"
          error={errors.location}
          required
        />

        <EnhancedInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter project description (optional)"
          icon="document-text-outline"
          multiline
          numberOfLines={4}
          helperText="Provide additional details about the project"
        />

        <EnhancedInput
          label="Client Name"
          value={clientName}
          onChangeText={setClientName}
          placeholder="Enter client name (optional)"
          icon="person-outline"
          autoCapitalize="words"
          helperText="Name of the client or company"
        />

        <EnhancedInput
          label="Budget (₹)"
          value={budget}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9.]/g, '');
            setBudget(numericText);
          }}
          placeholder="Enter project budget"
          icon="cash-outline"
          keyboardType="numeric"
          helperText="Total estimated budget for the project"
        />

        <View style={{ marginBottom: 16 }}>
          <View style={{ marginBottom: 6 }}>
            <Text style={{ color: '#e2e8f0', fontSize: 14, fontWeight: '600' }}>
              Status <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['Planning', 'In Progress', 'On Hold', 'Completed'].map((stat) => (
              <TouchableOpacity
                key={stat}
                onPress={() => setStatus(stat)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: status === stat ? '#22c55e' : '#0a0f1a',
                  borderWidth: 1.5,
                  borderColor: status === stat ? '#22c55e' : '#1e293b',
                }}
              >
                <Text style={{ color: status === stat ? '#fff' : '#94a3b8', fontWeight: '600', fontSize: 13 }}>
                  {stat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <EnhancedInput
          label="Start Date"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD (optional)"
          icon="calendar-outline"
          helperText="Format: YYYY-MM-DD"
        />

        <EnhancedInput
          label="Expected Completion Date"
          value={expectedCompletionDate}
          onChangeText={setExpectedCompletionDate}
          placeholder="YYYY-MM-DD (optional)"
          icon="calendar-outline"
          helperText="Format: YYYY-MM-DD"
        />

        <LoadingButton
          title={isEditMode ? "Update Project" : "Add Project"}
          onPress={handleSubmit}
          loading={loading}
          icon={isEditMode ? "checkmark-circle-outline" : "add-circle-outline"}
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
