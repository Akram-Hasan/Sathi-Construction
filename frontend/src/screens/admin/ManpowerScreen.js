import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import SearchBar from '../../components/SearchBar';
import { manpowerService } from '../../services/manpowerService';
import Toast from '../../components/Toast';

export default function ManpowerScreen() {
  const navigation = useNavigation();
  const [manpower, setManpower] = useState([]);
  const [filteredManpower, setFilteredManpower] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const fetchManpower = async () => {
    try {
      const response = await manpowerService.getAll();
      if (response.success) {
        const manpowerData = response.data || [];
        setManpower(manpowerData);
        setFilteredManpower(manpowerData);
      } else {
        showToast('Failed to load manpower', 'error');
      }
    } catch (error) {
      console.error('Error fetching manpower:', error);
      showToast(error.message || 'Failed to load manpower', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchManpower();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchManpower();
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredManpower(manpower);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = manpower.filter(person => 
        person.name?.toLowerCase().includes(query) ||
        person.employeeId?.toLowerCase().includes(query) ||
        person.role?.toLowerCase().includes(query) ||
        person.phone?.includes(query) ||
        person.email?.toLowerCase().includes(query) ||
        person.skills?.toLowerCase().includes(query)
      );
      setFilteredManpower(filtered);
    }
  }, [searchQuery, manpower]);

  // Group by role
  const groupedByRole = filteredManpower.reduce((acc, person) => {
    const role = person.role || 'Unassigned';
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(person);
    return acc;
  }, {});

  return (
    <ScreenWrapper>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        <BackButton />
        <Text style={styles.sectionTitle}>Manpower ({filteredManpower.length})</Text>
        
        <View style={{ marginBottom: 16 }}>
          <SearchBar
            placeholder="Search by name, ID, role, skills..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </View>
        
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : filteredManpower.length > 0 ? (
          Object.entries(groupedByRole).map(([role, people]) => (
            <View key={role} style={{ marginBottom: 20 }}>
              <Text style={styles.roleHeader}>{role} ({people.length})</Text>
              {people.map(person => (
                <TouchableOpacity
                  key={person._id || person.id}
                  style={styles.listRow}
                  onPress={() => navigation?.navigate('ManpowerDetail', { manpowerId: person._id || person.id })}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listTitle}>{person.name || 'Unnamed'}</Text>
                    <Text style={styles.listSub}>
                      ID: {person.employeeId || person.id} 
                      {person.assignedProject?.name && ` • Assigned: ${person.assignedProject.name}`}
                      {person.phone && ` • ${person.phone}`}
                    </Text>
                    {person.experience && (
                      <Text style={[styles.listSub, { marginTop: 4 }]}>
                        Experience: {person.experience}
                      </Text>
                    )}
                    {person.skills && (
                      <Text style={[styles.listSub, { marginTop: 4, fontSize: 11 }]}>
                        Skills: {person.skills}
                      </Text>
                    )}
                  </View>
                  <View style={[
                    styles.progressPill, 
                    { 
                      backgroundColor: person.assignedProject ? '#ef4444' : '#10b981',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }
                  ]}>
                    <Ionicons 
                      name={person.assignedProject ? 'close-circle' : 'checkmark-circle'} 
                      size={14} 
                      color="#fff" 
                    />
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                      {person.assignedProject ? 'Unavailable' : 'Available'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: '#94a3b8', fontSize: 16 }}>No manpower found</Text>
            <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
              Add manpower to get started
            </Text>
          </View>
        )}
      </ScrollView>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: '#e2e8f0',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 12,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  listTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  listSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  progressPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleHeader: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
});

