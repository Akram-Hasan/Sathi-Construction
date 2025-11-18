import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TimelineItem({ milestone, isLast }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.timelineContent}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <Ionicons name={milestone.icon || 'checkmark-circle'} size={18} color="#22c55e" />
          </View>
          {!isLast && <View style={styles.line} />}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{milestone.title}</Text>
          {milestone.description && (
            <Text style={styles.description}>{milestone.description}</Text>
          )}
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
            <Text style={styles.date}>{formatDate(milestone.date)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  timelineContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 2,
    borderColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  line: {
    position: 'absolute',
    top: 36,
    left: 17,
    width: 2,
    height: '100%',
    backgroundColor: '#1f2937',
    zIndex: 0,
  },
  content: {
    flex: 1,
    paddingTop: 4,
  },
  title: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
    lineHeight: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    color: '#64748b',
    fontSize: 11,
  },
});

