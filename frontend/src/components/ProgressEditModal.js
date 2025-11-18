import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LoadingButton from './LoadingButton';

export default function ProgressEditModal({ visible, currentProgress, onClose, onSave, loading }) {
  const [progress, setProgress] = useState(currentProgress?.toString() || '0');

  React.useEffect(() => {
    if (visible) {
      setProgress(currentProgress?.toString() || '0');
    }
  }, [visible, currentProgress]);

  const handleSave = () => {
    const progressNum = parseInt(progress);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      return;
    }
    onSave(progressNum);
  };

  const isValid = () => {
    const progressNum = parseInt(progress);
    return !isNaN(progressNum) && progressNum >= 0 && progressNum <= 100;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Update Progress</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Progress Percentage (0-100)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, !isValid() && progress !== '' && styles.inputError]}
                value={progress}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  setProgress(numericText);
                }}
                keyboardType="numeric"
                maxLength={3}
                placeholder="0"
                placeholderTextColor="#64748b"
              />
              <Text style={styles.percent}>%</Text>
            </View>
            {!isValid() && progress !== '' && (
              <Text style={styles.errorText}>Please enter a value between 0 and 100</Text>
            )}

            <View style={styles.progressPreview}>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(100, Math.max(0, parseInt(progress) || 0))}%`,
                      backgroundColor: (parseInt(progress) || 0) >= 70 ? '#22c55e' : (parseInt(progress) || 0) >= 30 ? '#f59e0b' : '#ef4444',
                    }
                  ]}
                />
              </View>
              <Text style={styles.previewText}>{Math.min(100, Math.max(0, parseInt(progress) || 0))}%</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, styles.cancelButton]}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <LoadingButton
              title="Update"
              onPress={handleSave}
              loading={loading}
              icon="checkmark-circle"
              variant="success"
              disabled={!isValid()}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#0b1220',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1.5,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  title: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0f1a',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1e293b',
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  percent: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  progressPreview: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#0a0f1a',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
  },
  previewText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 45,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#1f2937',
  },
  cancelButtonText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
});

