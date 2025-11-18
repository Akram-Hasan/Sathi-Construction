import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import SearchBar from '../../components/SearchBar';
import { locationService } from '../../services/locationService';
import Toast from '../../components/Toast';

export default function LocationScreen() {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
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

  const fetchLocations = async () => {
    try {
      const response = await locationService.getAll();
      if (response.success) {
        const locationsData = response.data || [];
        setLocations(locationsData);
        setFilteredLocations(locationsData);
      } else {
        showToast('Failed to load locations', 'error');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      showToast(error.message || 'Failed to load locations', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchLocations();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLocations();
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLocations(locations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = locations.filter(location => 
        location.name?.toLowerCase().includes(query) ||
        location.employeeId?.toLowerCase().includes(query) ||
        location.location?.address?.toLowerCase().includes(query)
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery, locations]);

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScreenWrapper>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        <BackButton />
        <Text style={styles.sectionTitle}>Staff Live Location ({filteredLocations.length})</Text>
        
        <View style={{ marginBottom: 16 }}>
          <SearchBar
            placeholder="Search staff by name or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </View>
        
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : filteredLocations.length > 0 ? (
          filteredLocations.map(l => (
            <View key={l._id || l.id} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{l.name || 'Unknown'}</Text>
                <Text style={styles.listSub}>
                  {l.employeeId && `ID: ${l.employeeId} • `}
                  Last update: {l.location?.lastUpdated ? formatTime(l.location.lastUpdated) : 'N/A'}
                </Text>
                <Text style={styles.listDesc}>
                  {l.location?.address || 
                   (l.location?.latitude && l.location?.longitude 
                     ? `📍 ${l.location.latitude.toFixed(4)}, ${l.location.longitude.toFixed(4)}`
                     : 'No location data')}
                </Text>
              </View>
              <Ionicons name="location-outline" size={20} color="#60a5fa" />
            </View>
          ))
        ) : (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: '#94a3b8', fontSize: 16 }}>No location data available</Text>
            <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
              Staff members need to update their location
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
  listDesc: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 6,
  },
});

