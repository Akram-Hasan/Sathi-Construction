import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import EnhancedInput from '../../components/EnhancedInput';
import LoadingButton from '../../components/LoadingButton';
import Toast from '../../components/Toast';
import { projectService } from '../../services/projectService';
import { validateRequired } from '../../utils/validation';
import { styles as globalStyles } from '../../styles';

export default function PhotoUploadScreen() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  React.useEffect(() => {
    fetchProjects();
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Camera roll permission is required', 'error');
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

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showToast('Failed to pick image', 'error');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showToast('Camera permission is required', 'error');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showToast('Failed to take photo', 'error');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedProject) {
      newErrors.selectedProject = 'Please select a project';
    }
    if (!image) {
      newErrors.image = 'Please select or take a photo';
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
      // In a real app, you would upload the image to a server
      // For now, we'll just show a success message
      showToast('Photo uploaded successfully! (Note: Image upload requires backend implementation)', 'success');
      setTimeout(() => {
        setImage(null);
        setDescription('');
        setSelectedProject('');
      }, 2000);
    } catch (error) {
      console.error('Error uploading photo:', error);
      showToast('Failed to upload photo', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BackButton />
        <Text style={globalStyles.sectionTitle}>Upload Progress Photo</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            📸 Upload photos to document project progress, issues, or completed work
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
              Photo <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
          </View>
          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity
                onPress={() => setImage(null)}
                style={styles.removeImageBtn}
              >
                <Text style={styles.removeImageText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={showImagePicker}
              style={styles.imagePickerBtn}
            >
              <Text style={styles.imagePickerText}>📷 Tap to select or take photo</Text>
            </TouchableOpacity>
          )}
          {errors.image && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.image}</Text>
          )}
        </View>

        <EnhancedInput
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Add a description for this photo..."
          icon="document-text-outline"
          multiline
          numberOfLines={4}
          helperText="Describe what this photo shows"
        />

        <LoadingButton
          title="Upload Photo"
          onPress={handleSubmit}
          loading={loading}
          icon="cloud-upload-outline"
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
  imageContainer: {
    marginTop: 8,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: '#0a0f1a',
  },
  removeImageBtn: {
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  removeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  imagePickerBtn: {
    height: 200,
    borderRadius: 12,
    backgroundColor: '#0a0f1a',
    borderWidth: 2,
    borderColor: '#1e293b',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  imagePickerText: {
    color: '#94a3b8',
    fontSize: 16,
  },
});

