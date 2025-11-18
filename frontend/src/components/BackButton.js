import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function BackButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity 
      onPress={() => navigation.goBack()} 
      style={styles.backButton}
    >
      <Ionicons name="chevron-back" size={22} color="#e2e8f0" />
      <Text style={styles.backText}>Back</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    color: '#e2e8f0',
    fontSize: 14,
  },
});

