import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboard from '../screens/admin/AdminDashboard';
import Placeholder from '../components/Placeholder';

const Tabs = createBottomTabNavigator();

export default function TabsNavigator({ user }) {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0b1220', borderTopColor: '#1f2937' },
        tabBarActiveTintColor: '#22c55e',
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      >
        {() => <AdminDashboard user={user} />}
      </Tabs.Screen>
      <Tabs.Screen
        name="Fav"
        component={Placeholder}
        options={{
          title: 'Fav',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="Center"
        component={Placeholder}
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" color={color} size={size + 8} />,
        }}
      />
      <Tabs.Screen
        name="Alerts"
        component={Placeholder}
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="More"
        component={Placeholder}
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" color={color} size={size} />,
        }}
      />
    </Tabs.Navigator>
  );
}

