import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomInput from '../../Components/CustomInput';
import { useFonts, Cairo_400Regular, Cairo_700Bold } from '@expo-google-fonts/cairo';

const BASE_URL = 'http://192.168.1.72:80' // 'https://api.surgicalm.com'

const PasswordRecovery = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [fontsLoaded] = useFonts({
        Cairo_400Regular,
        Cairo_700Bold,
    });

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handlePasswordRecovery = async () => {
        const cleanedEmail = email.trim().toLowerCase();
        if (!cleanedEmail || !isValidEmail(cleanedEmail)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/users/password-reset/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: cleanedEmail }),
            });

            if (response.status === 200) {
                Alert.alert('Success', `If that account exists, a password reset link has been sent to ${cleanedEmail}`);
            } else if (response.status === 429) {
                Alert.alert('Slow down', 'Too many requests. Please try again in about an hour.');
            } else {
                Alert.alert('Error', 'Failed to send recovery email. Please try again later.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Network Error', 'Unable to contact server. Please check your connection and try again.');
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
                <Text style={styles.header}>Password Recovery</Text>
                <View style={styles.innerContainer}>
                    <CustomInput
                        containerStyle={styles.inputContainer}
                        placeholder="Enter your email"
                        onChangeText={setEmail}
                        value={email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity style={styles.finalLogin} onPress={handlePasswordRecovery}>
                        <Text style={styles.innerFinal}>Send Recovery Email</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backText}>Back to Login</Text>
                    </TouchableOpacity>
                </View>
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
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
    },
    innerContainer: {
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        marginBottom: 10,
        width: '80%',
    },
    finalLogin: {
        width: '100%',
        marginTop: 10,
    },
    innerFinal: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Cairo',
        color: 'white',
    },
    header: {
        position: 'absolute',
        top: 100,
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 40,
        fontFamily: 'Cairo',
        color: 'white',
    },
    backButton: {
        marginTop: 20,
    },
    backText: {
        fontSize: 18,
        fontFamily: 'Cairo',
        color: '#AA336A',
    },
});

export default PasswordRecovery;
