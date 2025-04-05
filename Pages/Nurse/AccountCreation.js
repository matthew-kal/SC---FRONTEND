import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import CustomInput from '../../Components/CustomInput';
import Icon from 'react-native-vector-icons/Ionicons';
import {getSecureItem, saveSecureItem} from "../../Components/Memory"
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
// import Orientation from 'react-native-orientation-locker';  // Developer Mode


const AccountCreation = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async () => {

    try {
      // Step 1: Retrieve access token from AsyncStorage
      let token = await getSecureItem('accessNurse');
      
      // Step 2: Define function for making registration request
      const makeRequest = async (token) => {
        return await fetch('http://127.0.0.1:8000/users/patient/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify({
            email,
            username,
            password,
            password2: confirmPassword,
          }),
        });
      };

      // Step 3: Make the registration request
      let response = await makeRequest(token);

      // Step 4: Check if response status is 401 and refresh the token if necessary
      if (response.status === 401) {
        const refreshToken = await getSecureItem('refreshNurse');
        if (!refreshToken) throw new Error('No refresh token found');

        const refreshResponse = await fetch('http://127.0.0.1:8000/users/token/refresh/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!refreshResponse.ok) throw new Error('Failed to refresh token');

        const refreshData = await refreshResponse.json();
        await saveSecureItem('accessNurse', refreshData.access);
        token = refreshData.access;

        // Retry the registration request with the new token
        response = await makeRequest(token);
      }

      // Step 5: Handle the response
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Account created successfully!');
      } else {
        Alert.alert('Error', data.message || 'Something went wrong!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again later.');
    }
  };

    /* Developer Mode
  useEffect(() => {
    Orientation.lockToPortrait(); // Locks the orientation to portrait

    return () => {
      Orientation.unlockAllOrientations(); // Unlocks orientation when component unmounts
    };
  }, []);
  */  

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#AA336A', '#FFFFFF']}
        style={styles.gradient}
        start={[0, 0]}
        end={[1, 1]}
      >
        <Text style={styles.title}>Account Creation</Text>
        <View style={styles.formContainer}>
          <CustomInput
            containerStyle={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <CustomInput
            containerStyle={styles.input}
            placeholder="Username"
            onChangeText={setUsername}
            value={username}
            autoCapitalize="none"
          />
          <CustomInput
            containerStyle={styles.input}
            placeholder="Password"
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />
          <CustomInput
            containerStyle={styles.input}
            placeholder="Confirm Password"
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            secureTextEntry
          />
          <TouchableOpacity onPress={handleSubmit}>
            <Icon name="person-add-outline" style={{ marginTop: 10 }} size={25} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  formContainer: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Cairo',
  },
  input: {
    marginBottom: 12,
    width: '100%',
  },
});

export default AccountCreation;