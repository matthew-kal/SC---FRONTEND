import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import CustomInput from '../../Components/Cards/CustomInput';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFetchWithAuth } from '../../Components/Services/FetchWithAuth';

// import Orientation from 'react-native-orientation-locker';  // Developer Mode


const AccountCreation = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_PASSWORD_LEN = 8;
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { fetchWithAuth } = useFetchWithAuth();

  const handleSubmit = async () => {
  const cleanedEmail = email.trim().toLowerCase();

  if (!emailRegex.test(cleanedEmail)) {
    Alert.alert('Error', 'Please enter a valid email address.');
    return;
  }
  if (!username.trim()) {
    Alert.alert('Error', 'Username is required.');
    return;
  }
  if (password.length < MIN_PASSWORD_LEN) {
    Alert.alert('Error', `Password must be at least ${MIN_PASSWORD_LEN} characters.`);
    return;
  }
  if (password !== confirmPassword) {
    Alert.alert('Error', 'Passwords do not match.');
    return;
  }

  setSubmitting(true);
  try {
    const response = await fetchWithAuth('/users/patient/register/', {
      method: 'POST',
      body: JSON.stringify({
        email: cleanedEmail,
        username: username.trim(),
        password,
        password2: confirmPassword,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 201) {
      Alert.alert('Success', 'Account created successfully!');
      setEmail(''); setUsername(''); setPassword(''); setConfirmPassword('');
    } else if (response.status === 400) {
      Alert.alert('Error', data.message || 'Invalid input. Please review fields.');
    } else if (response.status === 429) {
      Alert.alert('Slow down', 'Too many accounts created. Try again later.');
    } else {
      Alert.alert('Error', 'Server error. Please try again later.');
    }
  } catch (error) {
    console.error('Account creation error:', error);
    Alert.alert('Network Error', 'Unable to reach server. Check your connection.');
  } finally {
    setSubmitting(false);
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
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            accessibilityLabel="Create patient account"
          >
            <Icon
              name="person-add-outline"
              style={{ marginTop: 10 }}
              size={25}
              color={submitting ? '#cccccc' : 'white'}
            />
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