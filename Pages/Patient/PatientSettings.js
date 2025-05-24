import React, { useState, useEffect, useCallback, useContext } from 'react';
import { getSecureItem, deleteSecureItem } from '../../Components/Memory';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { Modal, TextInput, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomInput from '../../Components/CustomInput';
import { TokenContext } from '../../Components/TokenContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFetchWithAuth } from '../../Components/FetchWithAuth';


const PatientSettings = () => {
  const navigation = useNavigation();
  const { fetchWithAuth } = useFetchWithAuth();
  const [username, setUsername] = useState('');
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const { setUserType } = useContext(TokenContext);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState(''); 

  const {width, _} = Dimensions.get('window');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const mainLogout = async () => {
  try {
    await Logout();
    setUserType('');
  } catch (e) {
    console.error('Logout error:', e);
  } finally {
    await clearTokens();
    
    navigation.replace('Login');
  }
  };
  
  const Logout = async () => {
    try {
      const refreshToken = await getSecureItem('refreshPatient');
      if (!refreshToken) return;
      await fetchWithAuth('/users/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const deleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Please enter a valid password');
      return;
    }
    try {
      const res = await fetchWithAuth('/users/delete-account/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword.trim() }),
      });

      if (res.status === 204 || res.status === 200) {
        await clearTokens();
        setShowDeleteModal(false);
        setUserType('');
        navigation.replace('Login');
      } else if (res.status === 403) {
        Alert.alert('Incorrect Password', 'Please try again');
        setDeletePassword('');
      } else {
        Alert.alert('Failed to delete account', 'Please try again later.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      Alert.alert('Error', 'Please logout, log back in, and try again.');
    }
  };

  const clearTokens = async () => {
    try {
      await deleteSecureItem('accessPatient');
      await deleteSecureItem('refreshPatient');
      console.log('Cleared Tokens');
      console.log(getSecureItem('accessPatient'))
      console.log(getSecureItem('refreshPatient'))
    } catch (error) {
      console.error('Failed to clear tokens', error);
    }
  };


  const fetchSettingsData = async () => {
    setLoading(true);
    try {
      const res  = await fetchWithAuth('/users/user-settings/', { method: 'GET' });
      const data = await res.json();
      setUsername(data.username);
      setId(data.id);
      setEmail(data.email);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    setLoading(true); 
    fetchSettingsData();
  }, []); 

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert('New password and confirm password do not match');
      return;
    }

    if(!oldPassword || !newPassword || !confirmNewPassword){
      Alert.alert("Please enter missing fields")
    }

    try {
      const response = await fetchWithAuth('/users/change-password/', {
        method: 'POST',
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      Alert.alert(data.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error changing password');
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

      <Text style={[styles.title, { marginBottom: 0, fontSize: 45 }]}>Settings</Text>
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

      <View style={{ alignItems: 'center' }}>
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
        </View>

        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Logout</Text>
        <TouchableOpacity style={styles.logout} onPress={() => mainLogout()}>
        <Icon
                          name={'log-out-outline'}
                          style={styles.icon}
                          size={25}
                          color={"#AA336A"}
                        />
        </TouchableOpacity>

        <Text style={styles.title}>Delete Account</Text>
            <TouchableOpacity style={[styles.logout, width >= 450 ? { marginBottom: 200 } : { marginBottom: 0 } ]} onPress={() => setShowDeleteModal(true)}>
        <Icon
                          name={'trash-outline'}
                          style={styles.icon}
                          size={25}
                          color={"#AA336A"}
                        />
        </TouchableOpacity>


  {showDeleteModal && (
    <Modal
      transparent={true}
      animationType="slide"
      visible={showDeleteModal}
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderwidth: 3, 
        borderColor: "#AA336A",

      }}>
        <View style={{
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 10,
          width: '80%'
        }}>
          <Text style={{ fontFamily: 'Cairo', fontSize: 18, marginBottom: 10 }}>Enter your password to confirm account deletion:</Text>
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={deletePassword}
            onChangeText={setDeletePassword}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              padding: 10,
              marginBottom: 15,
              fontFamily: 'Cairo'
            }}
          />
          <TouchableOpacity style={styles.button} onPress={deleteAccount}>
            <Text style={styles.buttonText}>Delete Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={() => setShowDeleteModal(false)}>
            <Text style={[styles.buttonText, { color: 'gray' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )}
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
    marginTop: 50,
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
