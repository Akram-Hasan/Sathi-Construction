import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import EnhancedInput from '../../components/EnhancedInput';
import LoadingButton from '../../components/LoadingButton';
import Toast from '../../components/Toast';
import EnhancedCard from '../../components/EnhancedCard';
import { validateProgress, validateRequired } from '../../utils/validation';
import { progressService } from '../../services/progressService';
import { projectService } from '../../services/projectService';
import { styles } from '../../styles';

export default function ProgressStatusScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const projectParam = route?.params?.project || {};
  const [project, setProject] = useState(projectParam);
  const [progress, setProgress] = useState(projectParam.progress?.toString() || '0');
  const [materialStatus, setMaterialStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    // Fetch full project details if only ID is provided
    if (projectParam._id && !projectParam.name) {
      const fetchProject = async () => {
        try {
          const response = await projectService.getById(projectParam._id);
          if (response.success) {
            setProject(response.data);
            setProgress(response.data.progress?.toString() || '0');
          }
        } catch (error) {
          console.error('Error fetching project:', error);
        }
      };
      fetchProject();
    }
  }, [projectParam]);

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const validateForm = () => {
    const newErrors = {};
    const progressError = validateProgress(progress);
    if (progressError) newErrors.progress = progressError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    if (!project._id && !project.id) {
      showToast('Project information is missing', 'error');
      return;
    }

    setLoading(true);
    try {
      const progressData = {
        project: project._id || project.id,
        workCompleted: parseInt(progress),
        status: parseInt(progress) > 0 ? 'Started' : 'Not Started',
        materialStatus: materialStatus.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const response = await progressService.create(progressData);
      
      if (response.success) {
        showToast('Progress report submitted successfully!', 'success');
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        showToast(response.message || 'Failed to submit progress', 'error');
      }
    } catch (error) {
      console.error('Error submitting progress:', error);
      const errorMessage = error.message || error.errors?.[0]?.msg || 'Failed to submit progress';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const progressValue = parseInt(progress) || 0;
  const getProgressColor = () => {
    if (progressValue < 30) return '#ef4444';
    if (progressValue < 70) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BackButton />
        
        <Text style={styles.sectionTitle}>Progress Status</Text>
        
        <EnhancedCard variant="elevated" style={{ marginTop: 12, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="folder-outline" size={24} color="#22c55e" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.listTitle}>{project.name || 'Unknown Project'}</Text>
              <Text style={styles.listSub}>#{project.projectId || project.id || 'N/A'}</Text>
              {project.location && (
                <Text style={[styles.listSub, { marginTop: 4 }]}>📍 {project.location}</Text>
              )}
            </View>
          </View>
        </EnhancedCard>
        
        <EnhancedInput
          label="Work Completed (%)"
          value={progress}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            if (numericText === '' || (parseInt(numericText) >= 0 && parseInt(numericText) <= 100)) {
              setProgress(numericText);
              if (errors.progress) setErrors({ ...errors, progress: '' });
            }
          }}
          placeholder="0"
          icon="stats-chart-outline"
          keyboardType="numeric"
          error={errors.progress}
          helperText="Enter a value between 0 and 100"
          maxLength={3}
        />

        {progressValue > 0 && (
          <View style={styles.userCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={[styles.label, { color: '#e2e8f0' }]}>Progress</Text>
              <Text style={[styles.label, { color: getProgressColor(), fontWeight: '700' }]}>
                {progressValue}%
              </Text>
            </View>
            <View style={{ height: 10, backgroundColor: '#0a0f1a', borderRadius: 5, overflow: 'hidden' }}>
              <View
                style={{
                  height: 10,
                  width: `${progressValue}%`,
                  backgroundColor: getProgressColor(),
                  borderRadius: 5,
                }}
              />
            </View>
          </View>
        )}
        
        <EnhancedInput
          label="Material Required Status"
          value={materialStatus}
          onChangeText={setMaterialStatus}
          placeholder="Enter material status and requirements..."
          icon="cube-outline"
          multiline
          numberOfLines={4}
          helperText="Describe the current material status and any requirements"
        />

        <EnhancedInput
          label="Additional Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Enter any additional notes or observations..."
          icon="document-text-outline"
          multiline
          numberOfLines={4}
          helperText="Any additional information about the progress"
        />
        
        <LoadingButton
          title="Share Report with Admin"
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
