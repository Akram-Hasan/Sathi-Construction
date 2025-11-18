import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import SearchBar from '../../components/SearchBar';
import FilterBar from '../../components/FilterBar';
import EnhancedCard from '../../components/EnhancedCard';
import { materialService } from '../../services/materialService';
import { projectService } from '../../services/projectService';
import { styles as globalStyles } from '../../styles';
import Toast from '../../components/Toast';

export default function MaterialsScreen() {
  const navigation = useNavigation();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
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
        materialService.getAll(),
        projectService.getAll()
      ]);

      if (materialsResponse.success) {
        setMaterials(materialsResponse.data || []);
      }

      if (projectsResponse.success) {
        setProjects(projectsResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load data', 'error');
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

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(m => m.type === selectedType);
    }

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
        material.location?.toLowerCase().includes(query) ||
        material.status?.toLowerCase().includes(query)
      );
    }

    setFilteredMaterials(filtered);
  }, [searchQuery, selectedType, selectedProject, materials]);

  const typeFilters = [
    { value: 'all', label: 'All', count: materials.length },
    { value: 'Available', label: 'Available', count: materials.filter(m => m.type === 'Available').length },
    { value: 'Required', label: 'Required', count: materials.filter(m => m.type === 'Required').length },
  ];

  const getTypeColor = (type) => {
    return type === 'Available' ? { bg: '#d1fae5', text: '#10b981' } : { bg: '#fee2e2', text: '#ef4444' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock':
        return { bg: '#d1fae5', text: '#10b981' };
      case 'Delivered':
        return { bg: '#dbeafe', text: '#60a5fa' };
      case 'Ordered':
        return { bg: '#fef3c7', text: '#f59e0b' };
      case 'Pending':
        return { bg: '#fee2e2', text: '#ef4444' };
      default:
        return { bg: '#1f2937', text: '#94a3b8' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return { bg: '#fee2e2', text: '#ef4444' };
      case 'Medium':
        return { bg: '#fef3c7', text: '#f59e0b' };
      case 'Low':
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

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={globalStyles.sectionTitle}>Materials Management</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddMaterial')}
            style={styles.addButton}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 16 }}>
          <SearchBar
            placeholder="Search materials..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </View>

        <View style={{ marginBottom: 12 }}>
          <FilterBar
            filters={typeFilters}
            selectedFilter={selectedType}
            onFilterSelect={setSelectedType}
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
          filteredMaterials.map((material) => {
            const typeColor = getTypeColor(material.type);
            const statusColor = getStatusColor(material.status);
            const priorityColor = getPriorityColor(material.priority);

            return (
              <EnhancedCard key={material._id || material.id} variant="elevated" style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddMaterial', { materialId: material._id || material.id, material })}
                  onLongPress={() => {
                    Alert.alert(
                      'Delete Material',
                      `Are you sure you want to delete "${material.name}"?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              const response = await materialService.delete(material._id || material.id);
                              if (response.success) {
                                showToast('Material deleted successfully', 'success');
                                fetchData();
                              } else {
                                showToast('Failed to delete material', 'error');
                              }
                            } catch (error) {
                              console.error('Error deleting material:', error);
                              showToast('Failed to delete material', 'error');
                            }
                          },
                        },
                      ]
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[globalStyles.listTitle, { fontSize: 16, marginBottom: 4 }]}>{material.name}</Text>
                      <Text style={globalStyles.listSub}>Quantity: {material.quantity}</Text>
                    </View>
                    <View style={[globalStyles.badge, { backgroundColor: typeColor.bg }]}>
                      <Text style={[globalStyles.badgeText, { color: typeColor.text }]}>
                        {material.type}
                      </Text>
                    </View>
                  </View>

                  {material.project && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Ionicons name="folder" size={14} color="#60a5fa" style={{ marginRight: 6 }} />
                      <Text style={[globalStyles.listSub, { fontSize: 12 }]}>
                        {material.project.name} ({material.project.projectId})
                      </Text>
                    </View>
                  )}

                  {material.location && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Ionicons name="location" size={14} color="#22c55e" style={{ marginRight: 6 }} />
                      <Text style={[globalStyles.listSub, { fontSize: 12 }]}>{material.location}</Text>
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    {material.status && (
                      <View style={[globalStyles.badge, { backgroundColor: statusColor.bg, paddingHorizontal: 8, paddingVertical: 4 }]}>
                        <Text style={[globalStyles.badgeText, { color: statusColor.text, fontSize: 11 }]}>
                          {material.status}
                        </Text>
                      </View>
                    )}
                    {material.priority && material.type === 'Required' && (
                      <View style={[globalStyles.badge, { backgroundColor: priorityColor.bg, paddingHorizontal: 8, paddingVertical: 4 }]}>
                        <Text style={[globalStyles.badgeText, { color: priorityColor.text, fontSize: 11 }]}>
                          {material.priority} Priority
                        </Text>
                      </View>
                    )}
                  </View>

                  {material.neededBy && (
                    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#1f2937' }}>
                      <Text style={[globalStyles.listSub, { fontSize: 11 }]}>
                        Needed by: {new Date(material.neededBy).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </EnhancedCard>
            );
          })
        ) : (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="cube-outline" size={48} color="#64748b" />
            <Text style={[globalStyles.emptyText, { marginTop: 16 }]}>No materials found</Text>
            <Text style={[globalStyles.emptySubText, { marginTop: 8 }]}>
              Add materials to get started
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

