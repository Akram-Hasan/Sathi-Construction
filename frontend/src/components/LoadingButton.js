import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LoadingButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'primary', // primary, secondary, danger, success
  fullWidth = false,
  style,
}) {
  const getGradientColors = () => {
    switch (variant) {
      case 'secondary':
        return ['#1e293b', '#334155'];
      case 'danger':
        return ['#ef4444', '#dc2626'];
      case 'success':
        return ['#22c55e', '#16a34a'];
      default:
        return ['#f59e0b', '#d97706'];
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={[styles.gradient, isDisabled && styles.gradientDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <View style={styles.content}>
            {icon && <Ionicons name={icon} size={20} color="#ffffff" style={styles.icon} />}
            <Text style={styles.text}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  fullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  gradientDisabled: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

