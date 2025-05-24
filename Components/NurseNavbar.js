import React, { useState, useEffect, useContext } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getSecureItem, deleteSecureItem } from './Memory';
import { TokenContext } from './TokenContext'
import { useFetchWithAuth } from './FetchWithAuth';

const NurseNavbar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { setUserType } = useContext(TokenContext);

  const { fetchWithAuth } = useFetchWithAuth();
  const mainLogout = async () => {
    try {
      const refreshToken = await getSecureItem('refreshNurse');
      await fetchWithAuth('/users/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      await deleteSecureItem('accessNurse');
      await deleteSecureItem('refreshNurse');
      setUserType('');
      navigation.replace('Login');
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


