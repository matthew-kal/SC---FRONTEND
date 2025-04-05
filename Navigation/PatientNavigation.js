import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from '../Pages/Patient/Dashboard';
import AssortedCategories from '../Pages/Patient/AssortedCategories.js';
import PatientSettings from '../Pages/Patient/PatientSettings.js';
import PatientNavbar from '../Components/PatientNavbar';
import AssortedSubcategories from '../Pages/Patient/AssortedSubcategories.js'
import AssortedPlayer from '../Pages/Patient/AssortedPlayer';
import AssortedModules from '../Pages/Patient/AssortedModules';
import Login from '../Pages/Login/Login.js'
import DashPlayer from '../Pages/Patient/DashPlayer.js';

const Tab = createBottomTabNavigator();

const PatientNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName="PatientSettings" 
      screenOptions={{ headerShown: false }}
      tabBar={() => <PatientNavbar />}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="AssortedCategories" component={AssortedCategories} />
      <Tab.Screen name="PatientSettings" component={PatientSettings} />
      <Tab.Screen name="AssortedSubcategories" component={AssortedSubcategories} />
      <Tab.Screen name="DashPlayer" component={DashPlayer} />
      <Tab.Screen name="Login" component={Login} />
      <Tab.Screen name="AssortedModules" component={AssortedModules} />
      <Tab.Screen name="AssortedPlayer" component={AssortedPlayer} />
    </Tab.Navigator>
  );
};

export default PatientNavigation;
