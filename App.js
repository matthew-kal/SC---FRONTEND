import React, {useEffect} from 'react';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Pages/Login/Login';
import NurseNavigation from './Navigation/NurseNavigation';
import PatientNavigation from './Navigation/PatientNavigation';
import PasswordRecovery from './Pages/Login/PasswordRecovery';
import { PatientProvider } from './Components/PatientContext';

const Stack = createStackNavigator();

const navigationRef = React.createRef();

const App = () => {

  useEffect(() => {
  const foreground = Notifications.addNotificationReceivedListener(n =>
    Alert.alert('🔔 Notification', n.request.content.body ?? 'New message')
  );

  const tapped = Notifications.addNotificationResponseReceivedListener(r => {
    navigationRef.current?.navigate('Login');
  });

  return () => {
    Notifications.removeNotificationSubscription(foreground);
    Notifications.removeNotificationSubscription(tapped);
  };
}, []);


  return (
    <NavigationContainer ref={navigationRef}>
      <PatientProvider>
        <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="PatientNavigation" component={PatientNavigation} />
          <Stack.Screen name="PasswordRecovery" component={PasswordRecovery} />
          <Stack.Screen name="NurseNavigation" component={NurseNavigation} />
        </Stack.Navigator>
      </PatientProvider>
    </NavigationContainer>
  );
};

export default App;