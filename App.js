import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/Pages/Login/Login';
import NurseNavigation from './src/Navigation/NurseNavigation';
import PatientNavigation from './src/Navigation/PatientNavigation';
import PasswordRecovery from './src/Pages/Login/PasswordRecovery';
import { PatientProvider } from './src/Components/Services/PatientContext';
import { TokenProvider } from './src/Components/Services/TokenContext';
import { navigationRef } from './src/Navigation/NavRef';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <TokenProvider> 
        <PatientProvider>
          <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="PatientNavigation" component={PatientNavigation} />
            <Stack.Screen name="PasswordRecovery" component={PasswordRecovery} />
            <Stack.Screen name="NurseNavigation" component={NurseNavigation} />
          </Stack.Navigator>
        </PatientProvider>
      </TokenProvider>
    </NavigationContainer>
  );
};

export default App;