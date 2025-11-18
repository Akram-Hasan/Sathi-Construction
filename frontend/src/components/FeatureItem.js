import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FeatureItem({ label, icon, iconColor, bgColor, borderColor, onPress }) {
  const defaultIconColor = iconColor || '#22c55e';
  const defaultBgColor = bgColor || 'rgba(34, 197, 94, 0.1)';
  const defaultBorderColor = borderColor || 'rgba(34, 197, 94, 0.2)';

  return (
    <TouchableOpacity 
      style={styles.featureItem} 
      activeOpacity={0.7} 
      onPress={onPress}
    >
      <View style={[
        styles.featureIconWrap, 
        { 
          backgroundColor: defaultBgColor,
          borderColor: defaultBorderColor,
        }
      ]}>
        <Ionicons name={icon} size={24} color={defaultIconColor} />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  featureItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  featureIconWrap: {
    borderRadius: 16,
    padding: 14,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureLabel: {
    color: '#e2e8f0',
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

