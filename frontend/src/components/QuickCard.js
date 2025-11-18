import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function QuickCard({ title, icon, iconColor, gradientColors, onPress }) {
  const defaultGradient = gradientColors || ['#2563eb', '#1d4ed8'];
  const defaultIcon = icon || 'add-circle-outline';
  const defaultIconColor = iconColor || '#fff';

  return (
    <TouchableOpacity 
      style={styles.quickCard} 
      onPress={onPress} 
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={defaultGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={defaultIcon} size={22} color={defaultIconColor} />
          </View>
          <Text style={styles.quickTitle} numberOfLines={2}>{title}</Text>
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-forward" size={16} color={defaultIconColor} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  quickCard: {
    width: '48%',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  gradient: {
    padding: 14,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  quickTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  arrowContainer: {
    alignSelf: 'flex-end',
    marginTop: 'auto',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});

