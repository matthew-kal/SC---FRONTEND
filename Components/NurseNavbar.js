import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getSecureItem, saveSecureItem, deleteSecureItem} from './Memory';

const NurseNavbar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Main logout function
  const mainLogout = async () => {
    await Logout();
    navigation.replace('Login');
  };

  // Retrieve tokens from AsyncStorage
  const getTokens = async () => {
    try {
      const accessToken = await getSecureItem('accessNurse');
      const refreshToken = await getSecureItem('refreshNurse');
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Failed to retrieve tokens', error);
      return { accessToken: null, refreshToken: null };
    }
  };

  // Clear tokens from AsyncStorage
  const clearTokens = async () => {
    try {
      await deleteSecureItem('accessNurse');
      await deleteSecureItem('refreshNurse');
    } catch (error) {
      console.error('Failed to clear tokens', error);
    }
  };

  // Refresh the access token using refresh token
  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/users/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await saveSecureItem('accessNurse', data.access);
        return data.access;
      } else {
        await clearTokens(); // Clear tokens if refresh fails
        return null;
      }
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      return null;
    }
  };

  // Logout function
  const Logout = async () => {
    try {
      let { accessToken, refreshToken } = await getTokens();

      if (!refreshToken) {
        console.error('No refresh token found');
        return;
      }

      let response = await fetch('http://127.0.0.1:8000/users/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.status === 401) {
        accessToken = await refreshAccessToken(refreshToken);

        if (accessToken) {
          response = await fetch('http://127.0.0.1:8000/users/logout/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });
        }
      }

      if (response.ok) {
        await clearTokens();
      } else {
        console.error('Logout failed:', await response.json());
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigation = (screen) => {
    if (route.name !== screen) {
      navigation.navigate(screen);
    }
  };

  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.button} onPress={() => handleNavigation('AccountCreation')}>
        <Icon name="create" size={25} color="#AA336A" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleNavigation('PatientLookup')}>
        <Icon name="search-outline" size={25} color="#AA336A" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={mainLogout}>
        <Icon name="log-out-outline" size={25} color="#AA336A" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 3,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    height: 80,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NurseNavbar;


