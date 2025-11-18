import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function ScreenWrapper({ children, statusBarStyle = 'light' }) {
  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style={statusBarStyle} />
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

