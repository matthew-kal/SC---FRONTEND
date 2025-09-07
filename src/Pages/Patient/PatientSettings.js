import React, { useState, useEffect, useCallback, useContext } from 'react';
import { getSecureItem, deleteSecureItem, clearTokens } from '../../Components/Services/Memory';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { Modal, TextInput, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomInput from '../../Components/Cards/CustomInput';
import { TokenContext } from '../../Components/Services/TokenContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFetchWithAuth } from '../../Components/Services/FetchWithAuth';
import PrivacyPolicy from '../../Components/Cards/PrivacyPolicy';
import Logout from '../../Components/Services/Logout';
import PatientDetailsSkeleton from '../../Components/Skeletons/PatientDetailsSkeleton';
import PatientInfoCard from '../../Components/Cards/PatientInfoCard';


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
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {width, _} = Dimensions.get('window');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');


  const deleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Please enter your password to confirm deletion.');
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
        setDeletePassword('');
        setUserType('');
        setShowDeleteModal(false);
        navigation.replace('Login');
      } else if (res.status === 403) {
        Alert.alert('Incorrect Password', 'Please try again');
        setDeletePassword('');
      } else {
        let msg = 'Failed to delete account. Please try again later.';
        if (res && res.ok === false) {
          try {
            const data = await res.json();
            if (data && data.detail) msg = data.detail;
          } catch {}
        }
        Alert.alert(msg);
        setDeletePassword('');
      }
    } catch (err) {
      console.error('Delete error:', err);
      Alert.alert('Network Error', 'A network error occurred. Please check your connection and try again.');
      setDeletePassword('');
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
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      let missing = [];
      if (!oldPassword) missing.push("old password");
      if (!newPassword) missing.push("new password");
      if (!confirmNewPassword) missing.push("confirm new password");
      Alert.alert(`Please enter: ${missing.join(", ")}`);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('New password and confirm password do not match');
      return;
    }
    setIsChangingPassword(true);
    try {
      const response = await fetchWithAuth('/users/change-password/', {
        method: 'POST',
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });
      if (!response.ok) {
        let msg = 'Error changing password';
        try {
          const data = await response.json();
          if (data && (data.error || data.errors)) {
            msg = data.error || (Array.isArray(data.errors) ? data.errors.join(", ") : `${data.errors}`);
          }
        } catch {}
        Alert.alert(msg);
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        return;
      }
      const data = await response.json();
      Alert.alert(data.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Network Error', 'A network error occurred. Please check your connection and try again.');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } finally {
      setIsChangingPassword(false);
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
      


      {loading 
      ? (
        <PatientDetailsSkeleton containerStyle={[styles.cardContainer, { width: width < 450 ? '90%' : '50%' }]} />
      ) : (
        <PatientInfoCard containerStyle={[styles.cardContainer, { width: width < 450 ? '90%' : '50%' }]} username={username} email={email} id={id} />
      )}

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

        <TouchableOpacity 
          style={[styles.button, isChangingPassword && { opacity: 0.5 }]} 
          onPress={handleChangePassword}
          disabled={isChangingPassword}
        >
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
        
        <Logout/>

        <Text style={styles.title}>Delete Account</Text>
            <TouchableOpacity style={styles.logout} onPress={() => setShowDeleteModal(true)}>
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
  <PrivacyPolicy style={{marginBottom: 200 }} />
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
  icon: {
    alignSelf: 'center'
  },
  cardContainer: {
    borderWidth: 3,
    padding: 15,
    borderRadius: 10,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    marginBottom: 20,
    alignItems: 'center',
    alignSelf: 'center'
  }
});

export default PatientSettings;
