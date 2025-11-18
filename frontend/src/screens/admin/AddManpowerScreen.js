import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import EnhancedInput from '../../components/EnhancedInput';
import LoadingButton from '../../components/LoadingButton';
import Toast from '../../components/Toast';
import { validateRequired, validateEmployeeId, validatePhone } from '../../utils/validation';
import { manpowerService } from '../../services/manpowerService';
import { styles } from '../../styles';

export default function AddManpowerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const editManpower = route?.params?.manpower;
  const editManpowerId = route?.params?.manpowerId;
  const isEditMode = !!editManpower || !!editManpowerId;

  const [name, setName] = useState(editManpower?.name || '');
  const [role, setRole] = useState(editManpower?.role || '');
  const [employeeId, setEmployeeId] = useState(editManpower?.employeeId || '');
  const [phone, setPhone] = useState(editManpower?.phone || '');
  const [email, setEmail] = useState(editManpower?.email || '');
  const [experience, setExperience] = useState(editManpower?.experience || '');
  const [skills, setSkills] = useState(editManpower?.skills || '');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    if (editManpowerId && !editManpower) {
      // Fetch manpower if only ID provided
      const fetchManpower = async () => {
        try {
          const response = await manpowerService.getAll();
          if (response.success) {
            const found = response.data.find(m => (m._id || m.id) === editManpowerId);
            if (found) {
              setName(found.name || '');
              setRole(found.role || '');
              setEmployeeId(found.employeeId || '');
              setPhone(found.phone || '');
              setEmail(found.email || '');
              setExperience(found.experience || '');
              setSkills(found.skills || '');
            }
          }
        } catch (error) {
          console.error('Error fetching manpower:', error);
        }
      };
      fetchManpower();
    }
  }, [editManpowerId, editManpower]);

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const validateForm = () => {
    const newErrors = {};
    const nameError = validateRequired(name, 'Name');
    const roleError = validateRequired(role, 'Role');
    const employeeIdError = validateEmployeeId(employeeId);
    
    if (phone && phone.trim()) {
      const phoneError = validatePhone(phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    if (nameError) newErrors.name = nameError;
    if (roleError) newErrors.role = roleError;
    if (employeeIdError) newErrors.employeeId = employeeIdError;

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
      const manpowerData = {
        name: name.trim(),
        role: role.trim(),
        employeeId: employeeId.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        experience: experience.trim() || undefined,
        skills: skills.trim() || undefined,
        // isAvailable will be automatically set based on assignedProject (default: true if no project assigned)
      };

      let response;
      if (isEditMode && editManpowerId) {
        response = await manpowerService.update(editManpowerId, manpowerData);
        if (response.success) {
          showToast(`Manpower "${name}" (${role}) updated successfully!`, 'success');
        }
      } else {
        response = await manpowerService.create(manpowerData);
        if (response.success) {
          showToast(`Manpower "${name}" (${role}) added successfully!`, 'success');
        }
      }
      
      if (response.success) {
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        showToast(response.message || `Failed to ${isEditMode ? 'update' : 'create'} manpower`, 'error');
      }
    } catch (error) {
      console.error('Error creating manpower:', error);
      const errorMessage = error.message || error.errors?.[0]?.msg || 'Failed to create manpower';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BackButton />
        <Text style={styles.sectionTitle}>{isEditMode ? 'Edit Manpower' : 'Add New Manpower'}</Text>

        <EnhancedInput
          label="Full Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          placeholder="Enter full name"
          icon="person-outline"
          error={errors.name}
          autoCapitalize="words"
          required
        />

        <EnhancedInput
          label="Role"
          value={role}
          onChangeText={(text) => {
            setRole(text);
            if (errors.role) setErrors({ ...errors, role: '' });
          }}
          placeholder="e.g., Mason, Carpenter, Electrician"
          icon="briefcase-outline"
          error={errors.role}
          helperText="Enter the job role or designation"
          autoCapitalize="words"
          required
        />

        <EnhancedInput
          label="Employee ID"
          value={employeeId}
          onChangeText={(text) => {
            setEmployeeId(text);
            if (errors.employeeId) setErrors({ ...errors, employeeId: '' });
          }}
          placeholder="Enter employee ID"
          icon="id-card-outline"
          error={errors.employeeId}
          helperText="Minimum 3 characters"
          required
          editable={!isEditMode}
        />

        <EnhancedInput
          label="Phone Number"
          value={phone}
          onChangeText={(text) => {
            const digitsOnly = text.replace(/\D/g, '');
            setPhone(digitsOnly);
            if (errors.phone) setErrors({ ...errors, phone: '' });
          }}
          placeholder="10-digit phone number"
          icon="call-outline"
          keyboardType="phone-pad"
          error={errors.phone}
          helperText="Optional - 10 digits only"
          maxLength={10}
        />

        <EnhancedInput
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text.toLowerCase());
            if (errors.email) setErrors({ ...errors, email: '' });
          }}
          placeholder="Enter email address (optional)"
          icon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          helperText="Optional email address"
        />

        <EnhancedInput
          label="Experience"
          value={experience}
          onChangeText={setExperience}
          placeholder="e.g., 5 years, 3+ years (optional)"
          icon="time-outline"
          helperText="Years of experience or experience level"
        />

        <EnhancedInput
          label="Skills"
          value={skills}
          onChangeText={setSkills}
          placeholder="e.g., Concrete work, Electrical, Plumbing (optional)"
          icon="construct-outline"
          multiline
          numberOfLines={3}
          helperText="List key skills or specializations"
        />

        <LoadingButton
          title={isEditMode ? "Update Manpower" : "Add Manpower"}
          onPress={handleSubmit}
          loading={loading}
          icon={isEditMode ? "checkmark-circle-outline" : "person-add-outline"}
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
