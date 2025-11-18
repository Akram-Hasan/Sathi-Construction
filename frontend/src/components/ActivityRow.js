import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ActivityRow({ name, status, badgeBg, badgeText }) {
  return (
    <View style={styles.activityRow}>
      <Text style={styles.activityName}>{name}</Text>
      <View style={[styles.badge, { backgroundColor: badgeBg }]}>
        <Text style={[styles.badgeText, { color: badgeText }]}>{status}</Text>
      </View>
      <TouchableOpacity>
        <Text style={styles.viewText}>View</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  activityName: {
    color: '#e2e8f0',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewText: {
    color: '#60a5fa',
    fontSize: 12,
  },
});

