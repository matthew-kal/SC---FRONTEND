// Components/LogoutSection.js

import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFetchWithAuth } from './FetchWithAuth';
import { getSecureItem, deleteSecureItem } from './Memory';
import { useNavigation } from '@react-navigation/native';
import { TokenContext } from './TokenContext';

const Logout = () => {
  const navigation = useNavigation();
  const { userType, setUserType } = useContext(TokenContext);
  const { fetchWithAuth } = useFetchWithAuth();

  const handleLogout = async () => {
    const refreshKey = userType === 'nurse' ? 'refreshNurse' : 'refreshPatient';
    const accessKey  = userType === 'nurse' ? 'accessNurse'  : 'accessPatient';
    try {
      const refreshToken = await getSecureItem(refreshKey);
      if (refreshToken) {
        await fetchWithAuth('/users/logout/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      await deleteSecureItem(accessKey);
      await deleteSecureItem(refreshKey);
      setUserType('');
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logout</Text>
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Icon name="log-out-outline" size={25} color="#AA336A" style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Cairo',
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 50,
    marginBottom: 20,
    alignSelf: 'center',
  },
  logout: {
    width: 70,
    height: 60,
    borderWidth: 1,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 8,
  },
  icon: {
    alignSelf: 'center',
  },
});

export default Logout;