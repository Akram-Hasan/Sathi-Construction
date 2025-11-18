import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FilterBar({ 
  filters = [], 
  selectedFilter, 
  onFilterSelect,
  style 
}) {
  if (!filters || filters.length === 0) return null;

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {filters.map((filter, index) => {
        const isSelected = selectedFilter === filter.value;
        return (
          <TouchableOpacity
            key={filter.value || index}
            onPress={() => onFilterSelect(filter.value)}
            style={[
              styles.filterChip,
              isSelected && styles.filterChipSelected
            ]}
          >
            {filter.icon && (
              <Ionicons 
                name={filter.icon} 
                size={16} 
                color={isSelected ? '#fff' : '#94a3b8'} 
                style={{ marginRight: 6 }}
              />
            )}
            <Text style={[
              styles.filterText,
              isSelected && styles.filterTextSelected
            ]}>
              {filter.label}
            </Text>
            {filter.count !== undefined && (
              <Text style={[
                styles.filterCount,
                isSelected && styles.filterCountSelected
              ]}>
                ({filter.count})
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0a0f1a',
    borderWidth: 1.5,
    borderColor: '#1e293b',
  },
  filterChipSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  filterText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextSelected: {
    color: '#fff',
  },
  filterCount: {
    color: '#64748b',
    fontSize: 12,
    marginLeft: 4,
  },
  filterCountSelected: {
    color: '#d1fae5',
  },
});

