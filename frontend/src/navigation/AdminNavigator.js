import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabsNavigator from './TabsNavigator';
import ProjectsListScreen from '../screens/admin/ProjectsListScreen';
import WorkProgressScreen from '../screens/admin/WorkProgressScreen';
import ManpowerScreen from '../screens/admin/ManpowerScreen';
import StatusScreen from '../screens/admin/StatusScreen';
import LocationScreen from '../screens/admin/LocationScreen';
import AddProjectScreen from '../screens/admin/AddProjectScreen';
import AddManpowerScreen from '../screens/admin/AddManpowerScreen';
import ProjectStatusViewScreen from '../screens/admin/ProjectStatusViewScreen';
import ProjectDetailScreen from '../screens/admin/ProjectDetailScreen';
import ManpowerDetailScreen from '../screens/admin/ManpowerDetailScreen';
import FinanceSummaryScreen from '../screens/admin/FinanceSummaryScreen';
import ProfileScreen from '../screens/admin/ProfileScreen';
import ProjectTimelineScreen from '../screens/admin/ProjectTimelineScreen';
import MaterialsScreen from '../screens/admin/MaterialsScreen';
import AddMaterialScreen from '../screens/admin/AddMaterialScreen';

const Stack = createNativeStackNavigator();

export default function AdminNavigator({ onLogout, user }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminTabs">
          {() => <TabsNavigator user={user} />}
        </Stack.Screen>
        <Stack.Screen name="ProjectsList" component={ProjectsListScreen} />
        <Stack.Screen name="WorkProgress" component={WorkProgressScreen} />
        <Stack.Screen name="Manpower" component={ManpowerScreen} />
        <Stack.Screen name="StatusScreen" component={StatusScreen} />
        <Stack.Screen name="LocationScreen" component={LocationScreen} />
        <Stack.Screen name="AddProject" component={AddProjectScreen} />
        <Stack.Screen name="AddManpower" component={AddManpowerScreen} />
        <Stack.Screen name="ProjectStatusView" component={ProjectStatusViewScreen} />
        <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
        <Stack.Screen name="ManpowerDetail" component={ManpowerDetailScreen} />
        <Stack.Screen name="FinanceSummary" component={FinanceSummaryScreen} />
        <Stack.Screen name="Profile">
          {() => <ProfileScreen onLogout={onLogout} />}
        </Stack.Screen>
        <Stack.Screen name="ProjectTimeline" component={ProjectTimelineScreen} />
        <Stack.Screen name="Materials" component={MaterialsScreen} />
        <Stack.Screen name="AddMaterial" component={AddMaterialScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

