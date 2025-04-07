import React, { useState, useEffect, useCallback } from 'react';
import { getSecureItem, saveSecureItem, deleteSecureItem } from '../../Components/Memory';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomInput from '../../Components/CustomInput';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '@env';


const PatientSettings = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState(''); 

  const {width, height} = Dimensions.get('window');

  const mainLogout = async () => {
    
    await Logout();
    navigation.replace('Login');

  };
  
  const Logout = async () => {
    try {
      let { accessToken, refreshToken } = await getTokens();

      if (!refreshToken) {
        console.error('No refresh token found');
        return;
      }

      // Attempt to logout using the current access token
      let response = await fetch(`${BASE_URL}/users/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      // If the token is invalid (likely expired), try refreshing the access token
      if (response.status === 401) {
        console.log('Token expired, attempting to refresh...');
        accessToken = await refreshAccessToken(refreshToken);

        if (accessToken) {
          // Retry logging out with the refreshed access token
          response = await fetch(`${BASE_URL}/users/logout/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });
        }
      }

      // Handle a blacklisted token error specifically
      if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.error === "Token is blacklisted") {
          console.error('Token is blacklisted. Clearing tokens.');
          await clearTokens();
          return;
        }
      }

     
      if (response.ok) {
        await clearTokens();
      } else {
        const errorData = await response.json();
        console.error('Logout failed:', errorData);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
// Function to refresh access token using the refresh token
const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await fetch(`${BASE_URL}/users/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      await saveSecureItem('accessPatient', data.access);
      return data.access;
    } else {
      const errorData = await response.json();
      if (errorData.detail === "Token is blacklisted") {
        console.error('Refresh token is blacklisted. Clearing tokens.');
        await clearTokens();
      }
      return null; // If refreshing fails, return null
    }
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return null;
  }
};

  // Function to retrieve tokens
  const getTokens = async () => {
    try {
      const accessToken = await getSecureItem('accessPatient');
      const refreshToken = await getSecureItem('refreshPatient');
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Failed to retrieve tokens', error);
      return { accessToken: null, refreshToken: null };
    }
  };

  // Function to clear tokens (useful for logout)
  const clearTokens = async () => {
    try {
      await deleteSecureItem('accessPatient');
      await deleteSecureItem('refreshPatient');
    } catch (error) {
      console.error('Failed to clear tokens', error);
    }
  };


  const fetchSettingsData = async () => {
    try {
      let token = await getSecureItem('accessPatient');
      if (!token) throw new Error('No access token found');
  
      let response = await fetch(`${BASE_URL}/users/user-settings/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.status === 401) {
        const refreshToken = await getSecureItem('refreshPatient');
        if (!refreshToken) throw new Error('No refresh token found');
  
        const refreshResponse = await fetch(`${BASE_URL}/users/token/refresh/`, {
          method: 'POST',  
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
  
        if (!refreshResponse.ok) throw new Error('Failed to refresh token');
  
        const refreshData = await refreshResponse.json();
        await saveSecureItem('accessPatient', refreshData.access);
        token = refreshData.access;
      }
  
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      const data = await response.json();
      setUsername(data.username);  
      setId(data.id);
      setEmail(data.email);
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    setLoading(true); 
    fetchSettingsData();
  }, []); 

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {  // Check if passwords match
      alert('New password and confirm password do not match');
      return;
    }
    try {
      let token = await getSecureItem('accessPatient');
      if (!token) throw new Error('No access token found');

      let response = await fetch(`${BASE_URL}/users/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      alert(data.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword(''); // Reset the confirm password field
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    }
  };


  return (
    <View style={styles.container}>
    <LinearGradient
        colors={['#AA336A', '#FFFFFF']}
        style={styles.gradient}
        start={[0, 0]}
        end={[1, 1]}
      >

      <Text style={[styles.title, { marginBottom: 0, fontSize: 40 }]}>Settings</Text>
        <ScrollView style={{marginBottom: 40}}  showsVerticalScrollIndicator={false}> 
      <Text style={[styles.title, {marginTop: 30}]}>Your Information</Text>
      
      
      <View style={styles.info}>

      {loading ? (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#AA336A" />
      </View>
    ) : (
      <View> 
        <Text style={styles.innerText}>
          Username: <Text style={{ fontWeight: 'bold' }}>{username}</Text>
        </Text>
        <Text style={styles.innerText}>
          Email: <Text style={{ fontWeight: 'bold' }}>{email}</Text>
        </Text>
        <Text style={styles.innerText}>
          ID: <Text style={{ fontWeight: 'bold' }}>{id}</Text>
        </Text>
      </View>
        )}

      </View>


      <Text style={styles.title}>Change Password</Text>
      <View>
        <CustomInput
          containerStyle={styles.input}
          placeholder="Old Password"
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <CustomInput
          containerStyle={styles.input}
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <CustomInput
            containerStyle={styles.input}
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword} 
          />
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Logout</Text>
        <TouchableOpacity style={[styles.logout, width >= 450 ? { marginBottom: 200 } : { marginBottom: 0 } ]} onPress={() => mainLogout()}>
        <Icon
                          name={'log-out-outline'}
                          style={styles.icon}
                          size={25}
                          color={"#AA336A"}
                        />
      </TouchableOpacity>
      </View>
      </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  title: {
    fontFamily: 'Cairo',
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    marginTop: 80,
    alignSelf: "center",
  },
  innerText: {
    fontFamily: 'Cairo',
    alignSelf: 'center',
    fontSize: 18,
  },
  button: {
    borderWidth: 1,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 10,
    height: 60,
    width: 200,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  logout: {
    borderWidth: 1,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 10,
    height: 60,
    width: 70,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: "Cairo",
    alignSelf: 'center',
    fontSize: 18,
    color: '#AA336A',
    fontWeight: 'bold',
  },
  input: {
    fontFamily: 'Cairo',
    borderRadius: 10,
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    marginBottom: 10, 
    width: 300, 
  },
  loader: {
    width: 170,
    padding: 27,
  },
  subtitle: {
    fontFamily: 'Cairo',
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 30,
    marginBottom: 20,
  },
  info: {
    borderWidth: 3,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  }, 
  icon: {
    alignSelf: 'center'
  }
});

export default PatientSettings;
