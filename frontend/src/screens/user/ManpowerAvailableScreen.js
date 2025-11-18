import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import SearchBar from '../../components/SearchBar';
import EnhancedCard from '../../components/EnhancedCard';
import { manpowerService } from '../../services/manpowerService';
import { styles } from '../../styles';
import Toast from '../../components/Toast';

export default function ManpowerAvailableScreen() {
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
      const response = await manpowerService.getAvailable();
      if (response.success) {
        const manpowerData = response.data || [];
        setManpower(manpowerData);
        setFilteredManpower(manpowerData);
      } else {
        showToast('Failed to load manpower', 'error');
      }
    } catch (error) {
      console.error('Error fetching available manpower:', error);
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
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        <BackButton />
        
        <Text style={styles.sectionTitle}>Manpower Available on Site ({filteredManpower.length})</Text>
        
        <View style={{ marginBottom: 16 }}>
          <SearchBar
            placeholder="Search available manpower..."
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
            <View key={role} style={{ marginBottom: 16 }}>
              <Text style={[styles.sectionTitle, { fontSize: 16, marginBottom: 8 }]}>{role} ({people.length})</Text>
              {people.map((person) => (
                <View key={person._id || person.id} style={[styles.userCard, { marginBottom: 8 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listTitle}>{person.name || 'Unnamed'}</Text>
                      <Text style={styles.listSub}>ID: {person.employeeId || person.id}</Text>
                      {person.phone && (
                        <Text style={styles.listDesc}>Phone: {person.phone}</Text>
                      )}
                      {person.experience && (
                        <Text style={styles.listDesc}>Experience: {person.experience}</Text>
                      )}
                      {person.skills && (
                        <Text style={[styles.listDesc, { fontSize: 11 }]}>Skills: {person.skills}</Text>
                      )}
                    </View>
                    <View style={[
                      styles.badge,
                      {
                        backgroundColor: person.assignedProject ? '#fee2e2' : '#d1fae5',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                      }
                    ]}>
                      <Ionicons
                        name={person.assignedProject ? 'close-circle' : 'checkmark-circle'}
                        size={14}
                        color={person.assignedProject ? '#ef4444' : '#10b981'}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[
                        styles.badgeText,
                        { color: person.assignedProject ? '#ef4444' : '#10b981', fontSize: 11 }
                      ]}>
                        {person.assignedProject ? 'Unavailable' : 'Available'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="people-outline" size={48} color="#64748b" />
            <Text style={{ color: '#94a3b8', fontSize: 16, marginTop: 16 }}>No available manpower found</Text>
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

