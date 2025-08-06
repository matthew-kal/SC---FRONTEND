import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Pages/Login/Login';
import NurseNavigation from './Navigation/NurseNavigation';
import PatientNavigation from './Navigation/PatientNavigation';
import PasswordRecovery from './Pages/Login/PasswordRecovery';
import { PatientProvider } from './Components/Services/PatientContext';
import { TokenProvider } from './Components/Services/TokenContext';
import { navigationRef } from './Navigation/NavRef';

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