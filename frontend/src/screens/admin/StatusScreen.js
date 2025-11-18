import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import SearchBar from '../../components/SearchBar';
import { progressService } from '../../services/progressService';
import Toast from '../../components/Toast';

export default function StatusScreen({ navigation }) {
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

  const fetchStatuses = async () => {
    try {
      const response = await progressService.getAll();
      if (response.success) {
        const reports = response.data || [];
        setProgressReports(reports);
        setFilteredReports(reports);
      } else {
        showToast('Failed to load statuses', 'error');
      }
    } catch (error) {
      console.error('Error fetching statuses:', error);
      showToast(error.message || 'Failed to load statuses', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStatuses();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatuses();
  };

  React.useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReports(progressReports);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = progressReports.filter(report => 
        report.project?.name?.toLowerCase().includes(query) ||
        report.project?.projectId?.toLowerCase().includes(query) ||
        report.status?.toLowerCase().includes(query) ||
        report.notes?.toLowerCase().includes(query) ||
        report.materialStatus?.toLowerCase().includes(query) ||
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
        <Text style={styles.sectionTitle}>Project Status ({filteredReports.length})</Text>
        
        <View style={{ marginBottom: 16 }}>
          <SearchBar
            placeholder="Search by project, status, notes..."
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
          filteredReports.map(report => {
            const statusColor = report.status === 'Started' ? { bg: '#d1fae5', text: '#10b981' } : { bg: '#fee2e2', text: '#ef4444' };
            const note = report.notes || report.materialStatus || report.notStartedReason || 'No notes';
            return (
              <TouchableOpacity
                key={report._id || report.id}
                style={styles.listRow}
                onPress={() => navigation?.navigate('ProjectDetail', { projectId: report.project?._id || report.project?.id })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.listTitle}>{report.project?.name || 'Unknown Project'}</Text>
                  <Text style={styles.listSub}>
                    #{report.project?.projectId || report.project?.id || 'N/A'}
                    {report.reportedBy?.name && ` • By: ${report.reportedBy.name}`}
                  </Text>
                  <Text style={styles.listDesc}>{note}</Text>
                  {report.createdAt && (
                    <Text style={[styles.listSub, { marginTop: 4, fontSize: 11 }]}>
                      {new Date(report.createdAt).toLocaleString()}
                    </Text>
                  )}
                </View>
                <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
                  <Text style={[styles.badgeText, { color: statusColor.text }]}>
                    {report.status}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: '#94a3b8', fontSize: 16 }}>No status reports found</Text>
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
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

