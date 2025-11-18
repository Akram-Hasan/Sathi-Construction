import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar({ 
  placeholder = "Search...", 
  value, 
  onChangeText, 
  onClear,
  style 
}) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value && value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#94a3b8" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0f1a',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 15,
    paddingVertical: 10,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});

