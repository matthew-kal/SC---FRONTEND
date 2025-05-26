import React, { useState, useCallback, useEffect, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, Dimensions, SafeAreaView, KeyboardAvoidingView } from 'react-native';
// import Orientation from 'react-native-orientation-locker';  // Developer Mode
import { LinearGradient } from 'expo-linear-gradient';
import CustomInput from '../../Components/CustomInput';
import { getSecureItem, saveSecureItem, deleteSecureItem } from '../../Components/Memory';
import { useFonts, Cairo_400Regular, Cairo_700Bold } from '@expo-google-fonts/cairo';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Logo from '../../Images/Logo.png'; 
import { PatientContext } from '../../Components/PatientContext';
import { TokenContext } from '../../Components/TokenContext';
import { registerForPushNotificationsAsync } from '../../Services/notifications';
import { BASE_URL } from '@env';


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
  const { setUserType } = useContext(TokenContext);
  const { width } = Dimensions.get('window');
  const dynamicStyles = width < 450 ? styles.smallScreen : styles.largeScreen;
  
  
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
  const outerSizer = 26;
  const w = 315;
  const h = 75;
  const logoWidth = width < 400 ? w * 0.8 : width < 450 ? w * 0.9 : w;
  const logoHeight = width < 400 ? h * 0.8 : width < 450 ? h * 0.9 : h;

 
    useEffect(() => {
    checkPatientLoginStatus(); 
  }, []); 

  
  const checkPatientLoginStatus = async () => {
  
    const refreshToken = await getSecureItem('refreshPatient');

    if (!refreshToken) return;
    await refreshPatientAccessToken(refreshToken);

  }; 
  
  const refreshPatientAccessToken = async (refreshToken) => {
    try {
      const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });
  
      if (response.ok) {
        const data = await response.json();
        await saveSecureItem("accessPatient", data.access);
        setRefresh(true)
        setUserType('patient');
        navigation.navigate('PatientNavigation', {
          screen: 'PatientDashboard'
        });
      } else {
        await deleteSecureItem("accessPatient");
        await deleteSecureItem("refreshPatient");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
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
        // await registerForPushNotificationsAsync();

        console.log("🚀 `registerForPushNotificationsAsync` executed successfully!");
        setRefresh(true)
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

  if (!fontsLoaded) {
    return <View />;
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
});

export default Login;