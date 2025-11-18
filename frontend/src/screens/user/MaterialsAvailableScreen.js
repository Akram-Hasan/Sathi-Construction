import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import SearchBar from '../../components/SearchBar';
import EnhancedCard from '../../components/EnhancedCard';
import { materialService } from '../../services/materialService';
import { projectService } from '../../services/projectService';
import { styles as globalStyles } from '../../styles';
import Toast from '../../components/Toast';

export default function MaterialsAvailableScreen() {
  const navigation = useNavigation();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [showProjectFilter, setShowProjectFilter] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const fetchData = async () => {
    try {
      const [materialsResponse, projectsResponse] = await Promise.all([
        materialService.getAvailable(),
        projectService.getAll()
      ]);

      if (materialsResponse.success) {
        const materialsData = materialsResponse.data || [];
        setMaterials(materialsData);
      }

      if (projectsResponse.success) {
        setProjects(projectsResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast(error.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => {
    let filtered = [...materials];

    // Filter by project
    if (selectedProject !== 'all') {
      filtered = filtered.filter(m => (m.project?._id || m.project) === selectedProject);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(material =>
        material.name?.toLowerCase().includes(query) ||
        material.quantity?.toLowerCase().includes(query) ||
        material.project?.name?.toLowerCase().includes(query) ||
        material.location?.toLowerCase().includes(query)
      );
    }

    setFilteredMaterials(filtered);
  }, [searchQuery, selectedProject, materials]);
  
  return (
    <ScreenWrapper>
      <ScrollView 
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        <BackButton />
        
        <Text style={globalStyles.sectionTitle}>Materials Available on Site ({filteredMaterials.length})</Text>
        
        <View style={{ marginBottom: 16 }}>
          <SearchBar
            placeholder="Search available materials..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </View>

        <View style={{ marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => setShowProjectFilter(!showProjectFilter)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12,
              backgroundColor: '#0a0f1a',
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: '#1e293b',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="folder" size={18} color="#60a5fa" />
              <Text style={{ color: '#e2e8f0', fontSize: 14, fontWeight: '600' }}>
                {selectedProject === 'all' ? 'All Projects' : projects.find(p => (p._id || p.id) === selectedProject)?.name || 'Select Project'}
              </Text>
            </View>
            <Ionicons name={showProjectFilter ? "chevron-up" : "chevron-down"} size={18} color="#94a3b8" />
          </TouchableOpacity>
          {showProjectFilter && (
            <View style={{
              marginTop: 8,
              backgroundColor: '#0b1220',
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: '#1f2937',
              maxHeight: 200,
            }}>
              <ScrollView>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedProject('all');
                    setShowProjectFilter(false);
                  }}
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#1f2937',
                    backgroundColor: selectedProject === 'all' ? '#0a0f1a' : 'transparent',
                  }}
                >
                  <Text style={{ color: selectedProject === 'all' ? '#60a5fa' : '#94a3b8', fontWeight: selectedProject === 'all' ? '600' : '400' }}>
                    All Projects
                  </Text>
                </TouchableOpacity>
                {projects.map((project) => (
                  <TouchableOpacity
                    key={project._id || project.id}
                    onPress={() => {
                      setSelectedProject(project._id || project.id);
                      setShowProjectFilter(false);
                    }}
                    style={{
                      padding: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#1f2937',
                      backgroundColor: (selectedProject === project._id || selectedProject === project.id) ? '#0a0f1a' : 'transparent',
                    }}
                  >
                    <Text style={{ color: (selectedProject === project._id || selectedProject === project.id) ? '#60a5fa' : '#94a3b8', fontWeight: (selectedProject === project._id || selectedProject === project.id) ? '600' : '400' }}>
                      {project.name} ({project.projectId})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : filteredMaterials.length > 0 ? (
          filteredMaterials.map((m) => (
            <EnhancedCard key={m._id || m.id} variant="elevated" style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Ionicons name="cube" size={18} color="#22c55e" style={{ marginRight: 8 }} />
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
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="location" size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                      <Text style={[globalStyles.listSub, { fontSize: 12 }]}>{m.location}</Text>
                    </View>
                  )}
                </View>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  backgroundColor: 'rgba(34, 197, 94, 0.15)', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                </View>
              </View>
              {m.status && (
                <View style={{ 
                  marginTop: 8, 
                  paddingTop: 8, 
                  borderTopWidth: 1, 
                  borderTopColor: '#1f2937',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Text style={[globalStyles.listSub, { fontSize: 11, marginRight: 8 }]}>Status:</Text>
                  <View style={{ 
                    paddingHorizontal: 8, 
                    paddingVertical: 4, 
                    borderRadius: 8, 
                    backgroundColor: m.status === 'In Stock' ? '#d1fae5' : '#fef3c7' 
                  }}>
                    <Text style={{ 
                      fontSize: 11, 
                      fontWeight: '600', 
                      color: m.status === 'In Stock' ? '#10b981' : '#f59e0b' 
                    }}>
                      {m.status}
                    </Text>
                  </View>
                </View>
              )}
            </EnhancedCard>
          ))
        ) : (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="cube-outline" size={48} color="#64748b" />
            <Text style={[globalStyles.emptyText, { marginTop: 16 }]}>No materials available</Text>
            <Text style={[globalStyles.emptySubText, { marginTop: 8 }]}>
              Materials added by admin will appear here
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

