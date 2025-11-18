import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchDropdown({ 
  results, 
  visible, 
  onSelect, 
  onClose,
  type = 'mixed' // 'projects', 'manpower', 'mixed'
}) {
  if (!visible || !results || results.length === 0) {
    return null;
  }

  const renderItem = ({ item }) => {
    const isProject = item.type === 'project' || item.projectId || (item._id && item._id.toString().length === 24);
    const icon = isProject ? 'folder' : 'person';
    const iconColor = isProject ? '#3b82f6' : '#22c55e';
    
    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => {
          onSelect(item);
          onClose();
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {item.name || item.projectId || item.employeeId}
          </Text>
          <Text style={styles.resultSubtitle} numberOfLines={1}>
            {isProject 
              ? `${item.projectId || item.id} • ${item.location || 'No location'}`
              : `${item.employeeId || item.id} • ${item.role || 'No role'}`
            }
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.dropdown}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {results.length} {results.length === 1 ? 'result' : 'results'} found
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={results.slice(0, 5)}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item._id || item.id || index}`}
          style={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    zIndex: 1000,
    marginTop: 0,
  },
  dropdown: {
    backgroundColor: '#0b1220',
    borderRadius: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1.5,
    borderColor: '#1f2937',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 300,
    marginTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  headerText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  list: {
    maxHeight: 250,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
  },
});

