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
import { validateRequired } from '../../utils/validation';
import { progressService } from '../../services/progressService';
import { projectService } from '../../services/projectService';
import { styles } from '../../styles';

export default function NotStartedReasonScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const projectParam = route?.params?.project || {};
  const [project, setProject] = useState(projectParam);
  const [reason, setReason] = useState('');
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
    const reasonError = validateRequired(reason, 'Reason');
    if (reasonError) newErrors.reason = reasonError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Please provide a reason why work is not started', 'error');
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
        workCompleted: 0,
        status: 'Not Started',
        notStartedReason: reason.trim(),
      };

      const response = await progressService.create(progressData);
      
      if (response.success) {
        showToast(`Reason submitted for ${project.name || 'project'}`, 'success');
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        showToast(response.message || 'Failed to submit reason', 'error');
      }
    } catch (error) {
      console.error('Error submitting reason:', error);
      const errorMessage = error.message || error.errors?.[0]?.msg || 'Failed to submit reason';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BackButton />
        
        <Text style={styles.sectionTitle}>Why work is not started?</Text>
        
        <EnhancedCard variant="elevated" style={{ marginTop: 12, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="folder-outline" size={24} color="#ef4444" />
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
          label="Reason / Region"
          value={reason}
          onChangeText={(text) => {
            setReason(text);
            if (errors.reason) setErrors({ ...errors, reason: '' });
          }}
          placeholder="Enter reason why work is not started..."
          icon="alert-circle-outline"
          multiline
          numberOfLines={6}
          error={errors.reason}
          helperText="Please provide a detailed reason for the delay"
          required
        />
        
        <LoadingButton
          title="Submit Reason"
          onPress={handleSubmit}
          loading={loading}
          icon="checkmark-circle-outline"
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
