import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import SearchBar from '../../components/SearchBar';
import EnhancedCard from '../../components/EnhancedCard';
import { materialService } from '../../services/materialService';
import { styles as globalStyles } from '../../styles';
import Toast from '../../components/Toast';

export default function MaterialsRequiredScreen() {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
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

  const fetchMaterials = async () => {
    try {
      const response = await materialService.getRequired();
      if (response.success) {
        const materialsData = response.data || [];
        setMaterials(materialsData);
        setFilteredMaterials(materialsData);
      } else {
        showToast('Failed to load materials', 'error');
      }
    } catch (error) {
      console.error('Error fetching required materials:', error);
      showToast(error.message || 'Failed to load materials', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchMaterials();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMaterials();
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMaterials(materials);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = materials.filter(material => 
        material.name?.toLowerCase().includes(query) ||
        material.quantity?.toLowerCase().includes(query) ||
        material.project?.name?.toLowerCase().includes(query) ||
        material.priority?.toLowerCase().includes(query) ||
        material.location?.toLowerCase().includes(query)
      );
      setFilteredMaterials(filtered);
    }
  }, [searchQuery, materials]);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return { bg: '#fee2e2', text: '#ef4444' };
      case 'medium':
        return { bg: '#fef3c7', text: '#f59e0b' };
      case 'low':
        return { bg: '#dbeafe', text: '#60a5fa' };
      default:
        return { bg: '#1f2937', text: '#94a3b8' };
    }
  };
  
  return (
    <ScreenWrapper>
      <ScrollView 
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        <BackButton />
        
        <Text style={globalStyles.sectionTitle}>Materials Required on Site ({filteredMaterials.length})</Text>
        
        <View style={{ marginBottom: 16 }}>
          <SearchBar
            placeholder="Search required materials..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </View>
        
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : filteredMaterials.length > 0 ? (
          filteredMaterials.map((m) => {
            const priorityColor = getPriorityColor(m.priority);
            return (
              <EnhancedCard key={m._id || m.id} variant="elevated" style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Ionicons name="alert-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
                      <Text style={[globalStyles.listTitle, { fontSize: 16 }]}>{m.name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons name="scale-outline" size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                      <Text style={[globalStyles.listSub, { fontSize: 13 }]}>Quantity: {m.quantity}</Text>
                    </View>
                    {m.project && (
                      <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="folder" size={14} color="#60a5fa" style={{ marginRight: 6 }} />
                        <Text style={[globalStyles.listSub, { fontSize: 13, color: '#60a5fa' }]}>
                          {m.project.name} ({m.project.projectId})
                        </Text>
                      </TouchableOpacity>
                    )}
                    {m.location && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Ionicons name="location" size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                        <Text style={[globalStyles.listSub, { fontSize: 12 }]}>{m.location}</Text>
                      </View>
                    )}
                    {m.neededBy && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="calendar" size={14} color="#f59e0b" style={{ marginRight: 6 }} />
                        <Text style={[globalStyles.listSub, { fontSize: 12 }]}>
                          Needed by: {new Date(m.neededBy).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                  {m.priority && (
                    <View style={[globalStyles.badge, { backgroundColor: priorityColor.bg }]}>
                      <Text style={[globalStyles.badgeText, { color: priorityColor.text }]}>
                        {m.priority}
                      </Text>
                    </View>
                  )}
                </View>
                {m.status && (
                  <View style={{ 
                    marginTop: 8, 
                    paddingTop: 8, 
                    borderTopWidth: 1, 
                    borderTopColor: '#1f2937',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <Text style={[globalStyles.listSub, { fontSize: 11 }]}>Status:</Text>
                    <View style={{ 
                      paddingHorizontal: 8, 
                      paddingVertical: 4, 
                      borderRadius: 8, 
                      backgroundColor: m.status === 'Delivered' ? '#d1fae5' : m.status === 'Ordered' ? '#dbeafe' : '#fee2e2' 
                    }}>
                      <Text style={{ 
                        fontSize: 11, 
                        fontWeight: '600', 
                        color: m.status === 'Delivered' ? '#10b981' : m.status === 'Ordered' ? '#60a5fa' : '#ef4444' 
                      }}>
                        {m.status}
                      </Text>
                    </View>
                  </View>
                )}
              </EnhancedCard>
            );
          })
        ) : (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="cube-outline" size={48} color="#64748b" />
            <Text style={[globalStyles.emptyText, { marginTop: 16 }]}>No materials required</Text>
            <Text style={[globalStyles.emptySubText, { marginTop: 8 }]}>
              Request materials to get started
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

