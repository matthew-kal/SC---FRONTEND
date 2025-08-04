import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, Dimensions, SafeAreaView, KeyboardAvoidingView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomInput from '../../Components/CustomInput';
// import * as ScreenOrientation from 'expo-screen-orientation';
import { getSecureItem, saveSecureItem, deleteSecureItem } from '../../Components/Memory';
import { useFonts, Cairo_400Regular, Cairo_700Bold } from '@expo-google-fonts/cairo';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Logo from '../../Images/Logo.png'; 
import { PatientContext } from '../../Components/PatientContext';
import { TokenContext } from '../../Components/TokenContext';
import { registerForPushNotificationsAsync } from '../../Services/notifications';
import BiometricAuth from '../../Components/BiometricAuth';
// import { BASE_URL } from '@env';

const BASE_URL = 'https://api.surgicalm.com'


const LoginForm = ({ userPlaceholder, passPlaceholder, username, setUsername, password, setPassword, onSubmit, isPatient }) => {
  const navigation = useNavigation();
  const { width } = Dimensions.get('window');
  const innerSizer = width < 400 ? 22 : 25;
  const [loginDisabled, setLoginDisabled] = useState(false);

  const handleLoginPress = () => {
  if (username && password) {
    setLoginDisabled(true);
    onSubmit();  
    setTimeout(() => setLoginDisabled(false), 4000);
  } else {
    onSubmit();  
  }
};
  return (
    <KeyboardAvoidingView style={styles.buttonContainer}>
      <CustomInput
        containerStyle={styles.inputContainer}
        placeholder={userPlaceholder}
        onChangeText={setUsername}
        value={username}
      />
      <CustomInput
        containerStyle={styles.inputContainer}
        placeholder={passPlaceholder}
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />

      {/* Buttons Side by Side */}
      <View style={[styles.loginButtons, {marginRight: isPatient ? 30 : 0}]}>
         <TouchableOpacity
          style={[
            styles.finalLogin,
            styles.halfWidthButton,
            loginDisabled && { opacity: 0.5 },
          ]}
          onPress={handleLoginPress}
          disabled={loginDisabled}
        >
          <Text style={[styles.innerFinal, { fontSize: innerSizer }]}>
            Login
          </Text>
        </TouchableOpacity>

        {isPatient && (
          <TouchableOpacity 
            style={[styles.finalLogin, styles.halfWidthButton]} 
            onPress={() => navigation.navigate('PasswordRecovery')}
          >
            <Text style={[styles.innerFinal, {fontSize: innerSizer}]}>Forgot Password</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const Login = () => {
  const navigation = useNavigation();
  const { refresh, setRefresh } = useContext(PatientContext);
  const { setUserType, isInitialized } = useContext(TokenContext);
  const { width } = Dimensions.get('window');
  const dynamicStyles = width < 450 ? styles.smallScreen : styles.largeScreen;
  
  // Animation refs
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_700Bold,
  });

  const [nurseUsername, setNurseUsername] = useState('');
  const [nursePassword, setNursePassword] = useState('');
  const [patientUsername, setPatientUsername] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [renderPatient, setRenderPatient] = useState(false);
  const [renderNurse, setRenderNurse] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingSSO, setIsCheckingSSO] = useState(false);
  const outerSizer = 26;
  const w = 315;
  const h = 75;
  const logoWidth = width < 400 ? w * 0.8 : width < 450 ? w * 0.9 : w;
  const logoHeight = width < 400 ? h * 0.8 : width < 450 ? h * 0.9 : h;

  useEffect(() => {
    async function lockOrientation() {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }

    lockOrientation();

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // Wait for TokenContext to initialize before checking SSO
  useEffect(() => {
    if (isInitialized) {
      checkStoredLoginStatus(); 
    }
  }, [isInitialized]); 

  // Animation setup for loading state
  useEffect(() => {
    if (!isInitialized || isCheckingSSO) {
      // Fade in animation
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Spinning animation
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();


    }
  }, [isInitialized, isCheckingSSO]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const checkStoredLoginStatus = async () => {
    try {
      setIsCheckingSSO(true);
      
      // Only check for patient tokens - nurses always use manual login
      const patientRefreshToken = await getSecureItem('refreshPatient');
      
      if (patientRefreshToken) {
        console.log('[SSO] Found patient refresh token, checking authentication');
        await checkAndAuthenticatePatient(patientRefreshToken);
      } else {
        console.log('[SSO] No patient tokens found, showing login screen');
      }
    } catch (error) {
      console.error('[SSO] Error during stored login check:', error);
      // Clean up potentially corrupted patient tokens
      await deleteSecureItem("accessPatient");
      await deleteSecureItem("refreshPatient");
    } finally {
      setIsCheckingSSO(false);
    }
  };

  const checkAndAuthenticatePatient = async (refreshToken) => {
    try {
      // Debug: Check biometric status for patient
      const userPreference = await BiometricAuth.getUserPreference();
      const isAvailable = await BiometricAuth.isAvailable();
      const isLockedOut = await BiometricAuth.isLockedOut();
      
      console.log('[SSO] Patient biometric debug:', {
        userPreference,
        isAvailable,
        isLockedOut
      });
      
      // Check if biometric authentication should be attempted for patient
      const shouldUseBiometric = await BiometricAuth.shouldAttemptBiometricAuth('patient');
      console.log('[SSO] Should use biometric for patient:', shouldUseBiometric);
      
      if (shouldUseBiometric) {
        console.log('[SSO] Attempting biometric authentication for stored patient session');
        const biometricResult = await BiometricAuth.authenticate();
        
        if (biometricResult.success) {
          console.log('[SSO] Biometric authentication successful for patient, proceeding with token refresh');
          await refreshPatientAccessToken(refreshToken);
          return;
        } else {
          console.log('[SSO] Biometric authentication failed for patient:', biometricResult.error);
          
          // Handle different failure scenarios
          if (biometricResult.error === 'LOCKED_OUT' || biometricResult.error === 'LOCKOUT_TRIGGERED') {
            // User is locked out, clear tokens and show login screen
            await deleteSecureItem('accessPatient');
            await deleteSecureItem('refreshPatient');
            return;
          } else if (biometricResult.error === 'UserCancel' || biometricResult.error === 'UserFallback') {
            // User cancelled or chose to use fallback, show normal login screen
            console.log('[SSO] User cancelled biometric auth for patient, showing login screen');
            return;
          }
          // For other errors, fall through to show login screen
          console.log('[SSO] Biometric auth failed for patient, falling back to manual login');
          return;
        }
      } else {
        console.log('[SSO] Biometric not enabled/available for patient, attempting automatic login with stored refresh token');
        await refreshPatientAccessToken(refreshToken);
      }
    } catch (error) {
      console.error('[SSO] Error during patient authentication check:', error);
      // Clean up potentially corrupted tokens
      await deleteSecureItem('accessPatient');
      await deleteSecureItem('refreshPatient');
    }
  };


  const refreshPatientAccessToken = async (refreshToken) => {
    try {
      console.log('[SSO] Refreshing access token...');
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
  
      if (response.ok) {
        const data = await response.json();
        await saveSecureItem("accessPatient", data.access);
        // Save new refresh token if provided (token rotation)
        if (data.refresh) {
          await saveSecureItem("refreshPatient", data.refresh);
          console.log('[SSO] Updated refresh token due to rotation');
        }
        setRefresh(true)
        setUserType('patient');
        console.log('[SSO] Automatic login successful, navigating to dashboard');
        navigation.navigate('PatientNavigation', {
          screen: 'PatientDashboard'
        });
      } else {
        console.log('[SSO] Token refresh failed, clearing tokens');
        const errorText = await response.text();
        console.error('[SSO] Refresh error response:', errorText);
        await deleteSecureItem("accessPatient");
        await deleteSecureItem("refreshPatient");
      }
    } catch (error) {
      console.error("[SSO] Error refreshing token:", error);
      if (error.name === 'AbortError') {
        console.error("[SSO] Request timed out");
      }
      // Clean up tokens on network errors
      await deleteSecureItem("accessPatient");
      await deleteSecureItem("refreshPatient");
    }
  };
  

useFocusEffect(
  useCallback(() => {
    setNurseUsername('');
    setNursePassword('');
    setPatientUsername('');
    setPatientPassword('');
    setRenderPatient(false);
    setRenderNurse(false);
    setError('');
  }, [])
);

  const handleNurseLogin = async () => {
    if (!nurseUsername || !nursePassword){
      Alert.alert("Enter both fields");
      return;
    }
    try {
      console.log(`${BASE_URL}/users/nurse/login/`)
      const response = await fetch(`${BASE_URL}/users/nurse/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: nurseUsername, password: nursePassword }),
      });

      if (response.status === 200) {
        const data = await response.json();
        await saveSecureItem('accessNurse', data.access);
        await saveSecureItem('refreshNurse', data.refresh);
        setUserType('nurse');
        
        // Nurses always use manual login - no biometric setup
        console.log('[Login] Nurse login successful - proceeding without biometric setup');
        
        navigation.navigate('NurseNavigation', { screen: 'AccountCreation' });
      } else {
        setError('Login failed');
        Alert.alert('Login failed', 'Please check your credentials and try again.');
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred');
      Alert.alert('Error', 'An error occurred. Please try again later.');
    }
  };

  const handlePatientLogin = async () => {
    if (!patientUsername || !patientPassword){
      Alert.alert("Please enter both fields");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/users/patient/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: patientUsername, password: patientPassword }),
      });
  
      if (response.status === 200) {
        const data = await response.json();
        await saveSecureItem('accessPatient', data.access);
        await saveSecureItem('refreshPatient', data.refresh);
        setUserType('patient');
        
        // ✅ Register push token
        await registerForPushNotificationsAsync();
        console.log("🚀 `registerForPushNotificationsAsync` executed successfully!");
        
        // Check if we should prompt for biometric setup
        const existingPreference = await BiometricAuth.getUserPreference();
        const isAvailable = await BiometricAuth.isAvailable();
        
        console.log('[Login] Patient biometric setup check:', {
          existingPreference,
          isAvailable,
          shouldPrompt: !existingPreference && isAvailable
        });
        
        if (!existingPreference && isAvailable) {
          console.log('[Login] Prompting for biometric setup after successful patient login');
          // Prompt user to set up biometric authentication
          const setupResult = await BiometricAuth.promptForBiometricSetup('patient');
          console.log('[Login] Biometric setup result:', setupResult);
        }
        
        setRefresh(true);
        navigation.navigate('PatientNavigation', { screen: 'PatientDashboard' });
      } else {
        console.log("❌ Login failed. Response:", await response.text());
        setError('Login failed');
        Alert.alert('Login failed', 'Please check your credentials and try again.');
      }
    } catch (error) {
      console.error("Error during patient login:", error);
      setError('An error occurred');
      Alert.alert('Error', 'An error occurred. Please try again later.');
    }
  };

  if (!fontsLoaded || !isInitialized || isCheckingSSO) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#AA336A', '#FFFFFF']}
          style={styles.gradient}
          start={[0, 0]}
          end={[1, 1]}
        >
          <SafeAreaView style={[styles.SafeArea, dynamicStyles]}> 
            <Image source={Logo} style={[styles.logo, {width: logoWidth, height: logoHeight}]} /> 
            
            <Animated.View style={[styles.loadingContainer, { opacity: fadeValue }]}>
              <View style={styles.loadingCard}>
                <View style={styles.spinnerContainer}>
                  <Animated.View 
                    style={[
                      styles.spinner, 
                      { transform: [{ rotate: spin }] }
                    ]} 
                  />
                </View>
                <Text style={styles.loadingTitle}>
                  {!isInitialized ? 'Initializing App' : 'Checking Login Status'}
                </Text>
                <Text style={styles.loadingSubtitle}>
                  {!isInitialized 
                    ? 'Setting up your secure connection...' 
                    : 'Verifying your credentials...'
                  }
                </Text>
              </View>
            </Animated.View>
          </SafeAreaView>
          <Text style={styles.copyright}>© 2025 SurgiCalm. All rights reserved.</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#AA336A', '#FFFFFF']}
        style={styles.gradient}
        start={[0, 0]}
        end={[1, 1]}
      >

      <SafeAreaView style={[styles.SafeArea, dynamicStyles]}> 
        <Image source={Logo} style={[styles.logo, {width: logoWidth, height: logoHeight}]} /> 
        

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        
        <View style={[styles.innerContainer, { marginBottom: width < 450 ? 0 : 200}]}>
        { !renderNurse && (
          <TouchableOpacity
            style={[styles.btn, renderPatient && { borderWidth: 3 }]}
            onPress={() => { setRenderPatient(!renderPatient); setRenderNurse(false); }}
          >
            <Text style={[styles.btnTitle, { fontSize: outerSizer }]}>Patient Login</Text>
          </TouchableOpacity>
          )}
        
        { !renderPatient && (
          <TouchableOpacity
            style={[styles.btn, renderNurse && { borderWidth: 3 }]}
            onPress={() => { setRenderNurse(!renderNurse); setRenderPatient(false); }}
          >
            <Text style={[styles.btnTitle, { fontSize: outerSizer }]}>Admin Login</Text>
          </TouchableOpacity>
            )}

          {renderPatient && (
            <LoginForm
              userPlaceholder="Patient Username"
              passPlaceholder="Patient Password"
              username={patientUsername}
              setUsername={setPatientUsername}
              password={patientPassword}
              setPassword={setPatientPassword}
              onSubmit={handlePatientLogin}
              isPatient={true}
            />
          )}

          {renderNurse  && (
            <LoginForm
              userPlaceholder="Admin Username"
              passPlaceholder="Admin Password"
              username={nurseUsername}
              setUsername={setNurseUsername}
              password={nursePassword}
              setPassword={setNursePassword}
              onSubmit={handleNurseLogin}
              isPatient={false}
            />
          )}

        </View>
        </SafeAreaView>

        <Text style={styles.copyright}>© 2025 SurgiCalm. All rights reserved.</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  SafeArea: {
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  smallScreen: {
    marginTop: 70, 
  },
  largeScreen: {
    justifyContent: 'center', 
  },
  innerContainer: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginBottom: 40,
    marginTop: 40,
  },
  btn: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
    padding: 10,
    marginBottom: 10,
  },
  btnTitle: {
    fontWeight: 'bold',
    padding: 5,
    alignItems: 'center',
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Cairo',
  },
  buttonContainer: {
    marginBottom: 10,
    width: '100%',
  },
  inputContainer: {
    marginBottom: 10,
  },
  finalLogin: {
    width: '100%',
  },
  innerFinal: {
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Cairo',
    borderColor: 'white',
    fontStyle: 'italic',
    color: 'white',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  copyright: {
    position: 'absolute',
    bottom: 20,
    color: '#AA336A',
  },
  loginButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidthButton: {
    flex: 1,
  },
  loadingContainer: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '85%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(170, 51, 106, 0.1)',
  },
  spinnerContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#AA336A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(170, 51, 106, 0.05)',
  },
  spinner: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 4,
    borderColor: '#AA336A',
    borderTopColor: 'transparent',
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Cairo',
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
    fontFamily: 'Cairo',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Login;