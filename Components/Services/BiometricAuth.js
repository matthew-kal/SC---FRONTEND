import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';
import { getSecureItem, saveSecureItem, deleteSecureItem, clearTokens } from './Memory';

// Constants for biometric authentication
const BIOMETRIC_PREFERENCES_KEY = 'biometricPreferences';
const FAILED_ATTEMPTS_KEY = 'biometricFailedAttempts';
const LOCKOUT_TIMESTAMP_KEY = 'biometricLockoutTimestamp';
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export class BiometricAuth {
  
  /**
   * Check if the device supports biometric authentication
   */
  static async isAvailable() {
    try {
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
      const hardwareSupport = await LocalAuthentication.hasHardwareAsync();
      
      console.log('[BiometricAuth] Device capabilities:', {
        isEnrolled,
        securityLevel,
        hardwareSupport
      });
      
      return hardwareSupport && isEnrolled && securityLevel > 0;
    } catch (error) {
      console.error('[BiometricAuth] Error checking availability:', error);
      return false;
    }
  }

  /**
   * Get the types of biometric authentication available on the device
   */
  static async getSupportedTypes() {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const typeNames = types.map(type => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Touch ID';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Face ID';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Iris';
          default:
            return 'Biometric';
        }
      });
      
      console.log('[BiometricAuth] Supported types:', typeNames);
      return typeNames;
    } catch (error) {
      console.error('[BiometricAuth] Error getting supported types:', error);
      return [];
    }
  }

  /**
   * Check if user has opted into biometric authentication
   */
  static async getUserPreference() {
    try {
      const preference = await getSecureItem(BIOMETRIC_PREFERENCES_KEY);
      return preference ? JSON.parse(preference) : null;
    } catch (error) {
      console.error('[BiometricAuth] Error getting user preference:', error);
      return null;
    }
  }

  /**
   * Save user's biometric authentication preference
   */
  static async setUserPreference(enabled, userType) {
    try {
      const preference = {
        enabled,
        userType,
        setupDate: new Date().toISOString(),
        version: '1.0'
      };
      
      await saveSecureItem(BIOMETRIC_PREFERENCES_KEY, JSON.stringify(preference));
      console.log('[BiometricAuth] User preference saved:', preference);
      return true;
    } catch (error) {
      console.error('[BiometricAuth] Error saving user preference:', error);
      return false;
    }
  }

  /**
   * Check if user is currently locked out due to failed attempts
   */
  static async isLockedOut() {
    try {
      const lockoutTimestamp = await getSecureItem(LOCKOUT_TIMESTAMP_KEY);
      if (!lockoutTimestamp) return false;
      
      const lockoutTime = parseInt(lockoutTimestamp);
      const currentTime = Date.now();
      const isStillLockedOut = (currentTime - lockoutTime) < LOCKOUT_DURATION;
      
      if (!isStillLockedOut) {
        // Lockout period has expired, clear the lockout
        await this.clearLockout();
      }
      
      console.log('[BiometricAuth] Lockout check:', { 
        isStillLockedOut, 
        timeRemaining: isStillLockedOut ? LOCKOUT_DURATION - (currentTime - lockoutTime) : 0 
      });
      
      return isStillLockedOut;
    } catch (error) {
      console.error('[BiometricAuth] Error checking lockout status:', error);
      return false;
    }
  }

  /**
   * Get current failed attempt count
   */
  static async getFailedAttempts() {
    try {
      const attempts = await getSecureItem(FAILED_ATTEMPTS_KEY);
      return attempts ? parseInt(attempts) : 0;
    } catch (error) {
      console.error('[BiometricAuth] Error getting failed attempts:', error);
      return 0;
    }
  }

  /**
   * Increment failed attempt counter
   */
  static async incrementFailedAttempts() {
    try {
      const currentAttempts = await this.getFailedAttempts();
      const newAttempts = currentAttempts + 1;
      
      await saveSecureItem(FAILED_ATTEMPTS_KEY, newAttempts.toString());
      
      console.log('[BiometricAuth] Failed attempts incremented:', newAttempts);
      
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        await this.initiateSecurityLockout();
        return true; // Return true to indicate lockout was triggered
      }
      
      return false;
    } catch (error) {
      console.error('[BiometricAuth] Error incrementing failed attempts:', error);
      return false;
    }
  }

  /**
   * Clear failed attempts counter
   */
  static async clearFailedAttempts() {
    try {
      await deleteSecureItem(FAILED_ATTEMPTS_KEY);
      console.log('[BiometricAuth] Failed attempts cleared');
    } catch (error) {
      console.error('[BiometricAuth] Error clearing failed attempts:', error);
    }
  }

  /**
   * Clear lockout state
   */
  static async clearLockout() {
    try {
      await deleteSecureItem(LOCKOUT_TIMESTAMP_KEY);
      await this.clearFailedAttempts();
      console.log('[BiometricAuth] Lockout cleared');
    } catch (error) {
      console.error('[BiometricAuth] Error clearing lockout:', error);
    }
  }

  /**
   * Initiate security lockout - clear all tokens and set lockout timestamp
   */
  static async initiateSecurityLockout() {
    try {
      console.log('[BiometricAuth] Initiating security lockout due to repeated failures');
      
      // Clear all authentication tokens
      await clearTokens();
      
      // Set lockout timestamp
      await saveSecureItem(LOCKOUT_TIMESTAMP_KEY, Date.now().toString());
      
      // Clear failed attempts since we're now locked out
      await this.clearFailedAttempts();
      
      console.log('[BiometricAuth] Security lockout initiated');
      
      Alert.alert(
        'Security Lockout',
        'Too many failed authentication attempts. All stored credentials have been cleared for security. Please log in again with your username and password.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('[BiometricAuth] Error initiating security lockout:', error);
    }
  }

  /**
   * Prompt user to enable biometric authentication after first successful login
   * Note: This feature is only available for patients
   */
  static async promptForBiometricSetup(userType) {
    try {
      // Only allow biometric setup for patients
      if (userType !== 'patient') {
        console.log('[BiometricAuth] Biometric authentication is only available for patients');
        return false;
      }

      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        console.log('[BiometricAuth] Biometric authentication not available on this device');
        return false;
      }

      const supportedTypes = await this.getSupportedTypes();
      const biometricType = supportedTypes.length > 0 ? supportedTypes[0] : 'Biometric';
      
      return new Promise((resolve) => {
        Alert.alert(
          'Secure Patient Login Setup',
          `Would you like to use ${biometricType} for quick and secure access to your healthcare content? You can always change this in settings later.`,
          [
            {
              text: 'Not Now',
              onPress: async () => {
                await this.setUserPreference(false, userType);
                console.log('[BiometricAuth] Patient declined biometric setup');
                resolve(false);
              },
              style: 'cancel'
            },
            {
              text: `Enable ${biometricType}`,
              onPress: async () => {
                const enabled = await this.setUserPreference(true, userType);
                console.log('[BiometricAuth] Patient enabled biometric setup');
                resolve(enabled);
              }
            }
          ],
          { cancelable: false }
        );
      });
    } catch (error) {
      console.error('[BiometricAuth] Error prompting for biometric setup:', error);
      return false;
    }
  }

  /**
   * Perform biometric authentication
   */
  static async authenticate() {
    try {
      // Check if user is locked out
      const isLockedOut = await this.isLockedOut();
      if (isLockedOut) {
        Alert.alert(
          'Authentication Temporarily Disabled',
          'Please try again later or log in with your username and password.',
          [{ text: 'OK' }]
        );
        return { success: false, error: 'LOCKED_OUT' };
      }

      // Check user preferences
      const userPreference = await this.getUserPreference();
      if (!userPreference || !userPreference.enabled) {
        console.log('[BiometricAuth] Biometric authentication not enabled by user');
        return { success: false, error: 'NOT_ENABLED' };
      }

      // Check device availability
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        console.log('[BiometricAuth] Biometric authentication not available');
        return { success: false, error: 'NOT_AVAILABLE' };
      }

      const supportedTypes = await this.getSupportedTypes();
      const biometricType = supportedTypes.length > 0 ? supportedTypes[0] : 'biometric authentication';

      console.log('[BiometricAuth] Attempting biometric authentication');

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access SurgiCalm',
        subPromptMessage: 'Use your biometric authentication to securely access your healthcare content',
        cancelLabel: 'Use Password',
        fallbackLabel: 'Login with Username and Password',
        disableDeviceFallback: false, // Allow iOS to handle passcode fallback
        requireConfirmation: false,
      });

      console.log('[BiometricAuth] Authentication result:', result);

      if (result.success) {
        // Clear any previous failed attempts on successful auth
        await this.clearFailedAttempts();
        await this.clearLockout();
        
        return { 
          success: true, 
          userType: userPreference.userType,
          authType: 'biometric'
        };
      } else {
        // Handle authentication failure
        if (result.error === 'UserCancel' || result.error === 'UserFallback') {
          console.log('[BiometricAuth] User cancelled or chose fallback');
          return { success: false, error: result.error };
        }
        
        const lockoutTriggered = await this.incrementFailedAttempts();
        
        if (lockoutTriggered) {
          return { success: false, error: 'LOCKOUT_TRIGGERED' };
        }
        
        return { 
          success: false, 
          error: result.error,
          failedAttempts: await this.getFailedAttempts()
        };
      }
    } catch (error) {
      console.error('[BiometricAuth] Authentication error:', error);
      
      // On critical errors, increment failed attempts
      const lockoutTriggered = await this.incrementFailedAttempts();
      
      return { 
        success: false, 
        error: 'SYSTEM_ERROR',
        lockoutTriggered 
      };
    }
  }

  /**
   * Disable biometric authentication for the user
   */
  static async disableBiometricAuth() {
    try {
      await deleteSecureItem(BIOMETRIC_PREFERENCES_KEY);
      await this.clearFailedAttempts();
      await this.clearLockout();
      console.log('[BiometricAuth] Biometric authentication disabled');
    } catch (error) {
      console.error('[BiometricAuth] Error disabling biometric auth:', error);
    }
  }

  /**
   * Debug helper: Reset all biometric data (for troubleshooting)
   */
  static async resetBiometricData() {
    try {
      await deleteSecureItem(BIOMETRIC_PREFERENCES_KEY);
      await deleteSecureItem(FAILED_ATTEMPTS_KEY);
      await deleteSecureItem(LOCKOUT_TIMESTAMP_KEY);
      console.log('[BiometricAuth] All biometric data reset for debugging');
      return true;
    } catch (error) {
      console.error('[BiometricAuth] Error resetting biometric data:', error);
      return false;
    }
  }

  /**
   * Check if biometric authentication should be attempted for stored tokens
   * Note: This feature is only available for patients
   */
  static async shouldAttemptBiometricAuth(userType) {
    try {
      // Only allow biometric authentication for patients
      if (userType !== 'patient') {
        console.log('[BiometricAuth] Biometric authentication is only available for patients');
        return false;
      }

      const userPreference = await this.getUserPreference();
      const isAvailable = await this.isAvailable();
      const isLockedOut = await this.isLockedOut();
      
      return (
        userPreference && 
        userPreference.enabled && 
        userPreference.userType === userType && 
        isAvailable && 
        !isLockedOut
      );
    } catch (error) {
      console.error('[BiometricAuth] Error checking if should attempt biometric auth:', error);
      return false;
    }
  }
}

export default BiometricAuth;