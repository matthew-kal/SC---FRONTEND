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

  const ValidationRules = () => (
    <View style={styles.rulesContainer}>
      <Text style={styles.rulesHeader}>Account Requirements</Text>
      <Text style={styles.ruleItem}>• Email: Must be a unique, valid email address.</Text>
      <Text style={styles.ruleItem}>• Username: Must be a unique, 3-30 alphanumeric character alphanumeric string.</Text>
      <Text style={styles.ruleItem}>• Password: Must be 8+ characters, including at least one uppercase letter, one number, and one special character.</Text>
    </View>
  );

  const handleSubmit = async () => {
    const cleanedEmail = email.trim().toLowerCase();
    const cleanedUsername = username.trim();

    // --- Start of New Validation Logic ---
    if (!emailRegex.test(cleanedEmail)) {
      Alert.alert('Invalid Input', 'Please enter a valid email address.');
      return;
    }
    if (cleanedUsername.length < 3 || cleanedUsername.length > 30) {
      Alert.alert('Invalid Input', 'Username must be between 3 and 30 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(cleanedUsername)) {
      Alert.alert('Invalid Input', 'Username must contain only letters and numbers.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Invalid Input', 'Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      Alert.alert('Invalid Input', 'Password must contain at least one uppercase letter.');
      return;
    }
    if (!/\d/.test(password)) {
      Alert.alert('Invalid Input', 'Password must contain at least one number.');
      return;
    }
    if (!/[!@#$%^&*()\-=_+[\]{};':"\\|,.<>\/?]/.test(password)) {
      Alert.alert('Invalid Input', 'Password must contain at least one special character.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Invalid Input', 'Passwords do not match.');
      return;
    }
    // --- End of New Validation Logic ---

    setSubmitting(true);
    try {
      const response = await fetchWithAuth('/users/patient/register/', {
        method: 'POST',
        body: JSON.stringify({
          email: cleanedEmail,
          username: cleanedUsername,
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
              color={submitting ? 'transparent' : 'white'}
            />
          </TouchableOpacity>
        </View>

        <ValidationRules />
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
  rulesContainer: {
    width: '80%',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    marginTop: 30,
  },
  rulesHeader: {
    fontSize: 19,
    alignSelf: 'center',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    fontFamily: 'Cairo',
  },
  ruleItem: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Cairo',
    lineHeight: 20,
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