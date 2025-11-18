import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserDashboard from '../screens/user/UserDashboard';
import StartedProjectsListScreen from '../screens/user/StartedProjectsListScreen';
import NotStartedProjectsListScreen from '../screens/user/NotStartedProjectsListScreen';
import ProgressStatusScreen from '../screens/user/ProgressStatusScreen';
import NotStartedReasonScreen from '../screens/user/NotStartedReasonScreen';
import MaterialsAvailableScreen from '../screens/user/MaterialsAvailableScreen';
import MaterialsRequiredScreen from '../screens/user/MaterialsRequiredScreen';
import MaterialRequestScreen from '../screens/user/MaterialRequestScreen';
import ManpowerAvailableScreen from '../screens/user/ManpowerAvailableScreen';
import LocationTrackingScreen from '../screens/user/LocationTrackingScreen';
import PhotoUploadScreen from '../screens/user/PhotoUploadScreen';
import IssueReportScreen from '../screens/user/IssueReportScreen';
import NotificationsScreen from '../screens/user/NotificationsScreen';
import ProjectDetailScreen from '../screens/user/ProjectDetailScreen';

const Stack = createNativeStackNavigator();

export default function UserNavigator({ onLogout, user }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="UserHome">
          {() => <UserDashboard onLogout={onLogout} user={user} />}
        </Stack.Screen>
        <Stack.Screen name="StartedProjectsList" component={StartedProjectsListScreen} />
        <Stack.Screen name="NotStartedProjectsList" component={NotStartedProjectsListScreen} />
        <Stack.Screen name="ProgressStatus" component={ProgressStatusScreen} />
        <Stack.Screen name="NotStartedReason" component={NotStartedReasonScreen} />
        <Stack.Screen name="MaterialsAvailable" component={MaterialsAvailableScreen} />
        <Stack.Screen name="MaterialsRequired" component={MaterialsRequiredScreen} />
        <Stack.Screen name="MaterialRequest" component={MaterialRequestScreen} />
        <Stack.Screen name="ManpowerAvailable" component={ManpowerAvailableScreen} />
        <Stack.Screen name="LocationTracking" component={LocationTrackingScreen} />
        <Stack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
        <Stack.Screen name="IssueReport" component={IssueReportScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

