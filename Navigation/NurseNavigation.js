// Navigation/NurseNavigation.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AccountCreation from '../Pages/Nurse/AccountCreation';
import PatientLookup from '../Pages/Nurse/PatientLookup';
import NurseNavbar from '../Components/NavBars/NurseNavbar';
import PatientDetails from '../Pages/Nurse/PatientDetails';
import NurseSettings from '../Pages/Nurse/NurseSettings.js'

const Tab = createBottomTabNavigator();

const NurseNavigation = () => {
  return (
    <View style={styles.container}>
        <View style={styles.innerContainer}>
          <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={() => <NurseNavbar />}>
            <Tab.Screen name="AccountCreation" component={AccountCreation} />
            <Tab.Screen name="PatientLookup" component={PatientLookup} />
            <Tab.Screen name="PatientDetails" component={PatientDetails} />
            <Tab.Screen name="NurseSettings" component={NurseSettings}/>
          </Tab.Navigator>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  gradient: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
});

export default NurseNavigation;

