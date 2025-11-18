import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import { financeService } from '../../services/financeService';
import Toast from '../../components/Toast';

export default function FinanceSummaryScreen() {
  const [financeData, setFinanceData] = useState({
    totalInvested: 0,
    ableToBill: 0,
    pending: 0,
    efficiency: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const fetchFinanceSummary = async () => {
    try {
      const response = await financeService.getSummary();
      if (response.success && response.summary) {
        setFinanceData({
          totalInvested: response.summary.totalInvested || 0,
          ableToBill: response.summary.ableToBill || 0,
          pending: response.summary.pending || 0,
          efficiency: parseFloat(response.summary.efficiency) || 0,
        });
      } else {
        showToast('Failed to load finance summary', 'error');
      }
    } catch (error) {
      console.error('Error fetching finance summary:', error);
      showToast(error.message || 'Failed to load finance summary', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFinanceSummary();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFinanceSummary();
  };

  const billingEfficiency = financeData.efficiency.toFixed(1);

  return (
    <ScreenWrapper>
      <ScrollView 
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        <BackButton />
        <Text style={styles.sectionTitle}>Finance Summary</Text>
        
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : (
          <>

        <View style={[styles.userCard, { marginTop: 12 }]}>
          <View style={styles.financeRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="wallet-outline" size={24} color="#60a5fa" />
              <Text style={[styles.listTitle, { marginLeft: 12 }]}>Total Invested Cost</Text>
            </View>
            <Text style={[styles.listTitle, { color: '#ef4444' }]}>₹{financeData.totalInvested.toLocaleString()}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.financeRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="receipt-outline" size={24} color="#22c55e" />
              <Text style={[styles.listTitle, { marginLeft: 12 }]}>Able to Bill</Text>
            </View>
            <Text style={[styles.listTitle, { color: '#22c55e' }]}>₹{financeData.ableToBill.toLocaleString()}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.financeRow}>
            <Text style={[styles.listTitle, { fontSize: 18 }]}>Pending Amount</Text>
            <Text style={[styles.listTitle, { color: '#f59e0b', fontSize: 18 }]}>₹{financeData.pending.toLocaleString()}</Text>
          </View>
        </View>

        <View style={[styles.userCard, { marginTop: 16 }]}>
          <View style={styles.financeRow}>
            <Text style={styles.listSub}>Billing Efficiency</Text>
            <Text style={[styles.listSub, { color: '#22c55e', fontWeight: '600' }]}>
              {billingEfficiency}%
            </Text>
          </View>
          <View style={styles.efficiencyBarContainer}>
            <View style={[styles.efficiencyBar, { width: `${billingEfficiency}%` }]} />
          </View>
        </View>
          </>
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
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  listSub: {
    color: '#94a3b8',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#1f2937',
    marginVertical: 16,
  },
  efficiencyBarContainer: {
    height: 8,
    backgroundColor: '#0a0f1a',
    borderRadius: 4,
    marginTop: 12,
  },
  efficiencyBar: {
    height: 8,
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
});

