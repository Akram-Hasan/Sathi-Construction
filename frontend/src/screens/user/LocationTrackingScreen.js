import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import LoadingButton from '../../components/LoadingButton';
import Toast from '../../components/Toast';
import { authService } from '../../services/authService';
import { styles as globalStyles } from '../../styles';

export default function LocationTrackingScreen() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Location permission is required to track your location', 'error');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Location permission denied', 'error');
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = locationData.coords;
      setLocation({ latitude, longitude });

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses.length > 0) {
        const addr = addresses[0];
        const fullAddress = `${addr.street || ''} ${addr.city || ''} ${addr.region || ''} ${addr.postalCode || ''} ${addr.country || ''}`.trim();
        setAddress(fullAddress || 'Address not available');
      } else {
        setAddress('Address not available');
      }

      showToast('Location retrieved successfully', 'success');
    } catch (error) {
      console.error('Error getting location:', error);
      showToast('Failed to get location. Please try again.', 'error');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!location) {
      showToast('Please get your location first', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.updateLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        address: address || undefined,
      });

      if (response.success) {
        showToast('Location updated successfully!', 'success');
        setTimeout(() => {
          // Optionally navigate back
        }, 1500);
      } else {
        showToast(response.message || 'Failed to update location', 'error');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      showToast(error.message || 'Failed to update location', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <BackButton />
        <Text style={globalStyles.sectionTitle}>Track & Update Location</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>📍</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Location Tracking</Text>
              <Text style={styles.infoDesc}>
                Update your current location so admin can track your position on site
              </Text>
            </View>
          </View>
        </View>

        <LoadingButton
          title={location ? "Refresh Location" : "Get Current Location"}
          onPress={getCurrentLocation}
          loading={gettingLocation}
          icon="location"
          variant="primary"
          fullWidth
          style={{ marginTop: 20, marginBottom: 16 }}
        />

        {location && (
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationTitle}>📍 Current Location</Text>
            </View>
            <View style={styles.locationDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Latitude:</Text>
                <Text style={styles.detailValue}>{location.latitude.toFixed(6)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Longitude:</Text>
                <Text style={styles.detailValue}>{location.longitude.toFixed(6)}</Text>
              </View>
              {address && (
                <View style={styles.addressContainer}>
                  <Text style={styles.detailLabel}>Address:</Text>
                  <Text style={styles.addressText}>{address}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {location && (
          <LoadingButton
            title="Update Location"
            onPress={handleUpdateLocation}
            loading={loading}
            icon="checkmark-circle"
            variant="success"
            fullWidth
            style={{ marginTop: 16 }}
          />
        )}

        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            💡 <Text style={styles.noteBold}>Note:</Text> Your location will be shared with administrators for tracking purposes.
          </Text>
        </View>
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
  infoCard: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginTop: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoDesc: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 20,
  },
  locationCard: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginTop: 16,
  },
  locationHeader: {
    marginBottom: 16,
  },
  locationTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
  },
  locationDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  addressContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  addressText: {
    color: '#e2e8f0',
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  noteText: {
    color: '#fbbf24',
    fontSize: 13,
    lineHeight: 20,
  },
  noteBold: {
    fontWeight: '700',
  },
});

