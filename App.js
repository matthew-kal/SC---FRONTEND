import React, { useRef, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Pages/Login/Login';
import NurseNavigation from './Navigation/NurseNavigation';
import PatientNavigation from './Navigation/PatientNavigation';
import PasswordRecovery from './Pages/Login/PasswordRecovery';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './Services/notifications';
import { PatientProvider } from './Components/PatientContext';  

const Stack = createStackNavigator();

const App = () => {
  const notificationListener = useRef();
  const responseListener = useRef();
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    async function setupNotifications() {
      const token = await registerForPushNotificationsAsync();
      setExpoPushToken(token);
    }

    setupNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      Alert.alert('Notification Received!', notification.request.content.body);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('User tapped on notification:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <NavigationContainer>
      {/* ✅ Wrap the whole stack in RefreshProvider so Login & PatientNavigation share it */}
      <PatientProvider>
        <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
  
          {/* ✅ Login now has access to RefreshProvider */}
          <Stack.Screen name="Login" component={Login} />
  
          {/* ✅ PatientNavigation (Tab Navigator) also has access */}
          <Stack.Screen name="PatientNavigation" component={PatientNavigation} options={{ headerShown: false }} />
  
          {/* ❌ No RefreshProvider for NurseNavigation & PasswordRecovery */}
          <Stack.Screen name="PasswordRecovery" component={PasswordRecovery} />
          <Stack.Screen name="NurseNavigation" component={NurseNavigation} />
  
        </Stack.Navigator>
      </PatientProvider>
    </NavigationContainer>
  );
};

export default App;