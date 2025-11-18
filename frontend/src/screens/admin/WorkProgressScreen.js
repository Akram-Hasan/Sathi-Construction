import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import SearchBar from '../../components/SearchBar';
import { progressService } from '../../services/progressService';
import Toast from '../../components/Toast';

export default function WorkProgressScreen() {
  const [progressReports, setProgressReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
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

  const fetchProgress = async () => {
    try {
      const response = await progressService.getAll();
      if (response.success) {
        const reportsData = response.data || [];
        setProgressReports(reportsData);
        setFilteredReports(reportsData);
      } else {
        showToast('Failed to load progress reports', 'error');
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      showToast(error.message || 'Failed to load progress reports', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProgress();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProgress();
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReports(progressReports);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = progressReports.filter(report => 
        report.project?.name?.toLowerCase().includes(query) ||
        report.project?.projectId?.toLowerCase().includes(query) ||
        report.reportedBy?.name?.toLowerCase().includes(query) ||
        report.materialStatus?.toLowerCase().includes(query) ||
        report.notes?.toLowerCase().includes(query) ||
        report.notStartedReason?.toLowerCase().includes(query)
      );
      setFilteredReports(filtered);
    }
  }, [searchQuery, progressReports]);

  return (
    <ScreenWrapper>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        <BackButton />
        <Text style={styles.sectionTitle}>Work Progress ({filteredReports.length})</Text>
        
        <View style={{ marginBottom: 16 }}>
          <SearchBar
            placeholder="Search progress reports..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </View>
        
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : filteredReports.length > 0 ? (
          filteredReports.map(item => (
            <View key={item._id || item.id} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{item.project?.name || 'Unknown Project'}</Text>
                <Text style={styles.listSub}>
                  #{item.project?.projectId || item.project?.id || 'N/A'}
                  {item.reportedBy?.name && ` • Reported by: ${item.reportedBy.name}`}
                </Text>
                {item.materialStatus && (
                  <Text style={styles.listDesc}>{item.materialStatus}</Text>
                )}
                {item.notStartedReason && (
                  <Text style={[styles.listDesc, { color: '#f59e0b' }]}>Reason: {item.notStartedReason}</Text>
                )}
                {item.notes && (
                  <Text style={styles.listDesc}>Notes: {item.notes}</Text>
                )}
                {item.createdAt && (
                  <Text style={[styles.listSub, { marginTop: 4, fontSize: 11 }]}>
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                )}
              </View>
              <View style={styles.progressPill}>
                <Text style={styles.progressText}>{item.workCompleted || 0}%</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: '#94a3b8', fontSize: 16 }}>No progress reports found</Text>
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
  progressPill: {
    backgroundColor: '#065f46',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    color: '#34d399',
    fontWeight: '700',
  },
});

