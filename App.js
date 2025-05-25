import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Pages/Login/Login';
import NurseNavigation from './Navigation/NurseNavigation';
import PatientNavigation from './Navigation/PatientNavigation';
import PasswordRecovery from './Pages/Login/PasswordRecovery';
import { PatientProvider } from './Components/PatientContext';
import { TokenProvider } from './Components/TokenContext';

const Stack = createStackNavigator();

export const navigationRef = React.createRef();

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