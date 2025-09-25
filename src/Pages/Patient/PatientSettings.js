import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { getSecureItem, deleteSecureItem, clearTokens } from '../../Components/Services/Memory';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions, Animated, Platform } from 'react-native';
import { Modal, TextInput, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomInput from '../../Components/Cards/CustomInput';
import { TokenContext } from '../../Components/Services/TokenContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFetchWithAuth } from '../../Components/Services/FetchWithAuth';
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

  const {width, height} = Dimensions.get('window');
  
  // Responsive design calculations
  const isTablet = width >= 768;
  const isLargePhone = width >= 414;
  const cardWidth = isTablet ? '60%' : '90%';
  const maxCardWidth = isTablet ? 500 : 400;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  
  // Animation references
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const sectionAnimations = useRef([
    new Animated.Value(0), // Profile section
    new Animated.Value(0), // Security section  
    new Animated.Value(0), // Account section
  ]).current;
  const shouldAnimate = useRef(true);


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
      // Trigger animations after data loads
      if (shouldAnimate.current) {
        startEntranceAnimations();
        shouldAnimate.current = false;
      }
    }
  };

  const startEntranceAnimations = () => {
    // Header animation
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Staggered section animations
    const animations = sectionAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 200 + (index * 150), // 200ms, 350ms, 500ms
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start();
  };

  const togglePasswordForm = () => {
    setShowPasswordForm(!showPasswordForm);
    // Clear form when closing
    if (showPasswordForm) {
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const toggleDangerZone = () => {
    setShowDangerZone(!showDangerZone);
  };

  
  useFocusEffect(
    useCallback(() => {
      // Reset animations when screen comes into focus
      headerOpacity.setValue(0);
      sectionAnimations.forEach(anim => anim.setValue(0));
      shouldAnimate.current = true;
      
      setLoading(true); 
      fetchSettingsData();
      
      // Cleanup function
      return () => {
        console.log('[PatientSettings] Screen losing focus, clearing animations');
        headerOpacity.setValue(0);
        sectionAnimations.forEach(anim => anim.setValue(0));
        shouldAnimate.current = true;
      };
    }, [])
  ); 

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
      Alert.alert('Success', data.message, [
        {
          text: 'OK',
          onPress: () => {
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setShowPasswordForm(false); // Close form on success
          }
        }
      ]);
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
        {/* Animated Header */}
        <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
          <Text style={[styles.mainTitle, { fontSize: isTablet ? 50 : 40 }]}>Settings</Text>
        </Animated.View>

        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Section */}
          <Animated.View 
            style={[
              styles.sectionCard,
              { 
                width: cardWidth,
                maxWidth: maxCardWidth,
                opacity: sectionAnimations[0],
                transform: [
                  {
                    translateY: sectionAnimations[0].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Icon name="person-outline" size={24} color="#AA336A" />
              <Text style={styles.sectionTitle}>Profile Information</Text>
            </View>
            
            {loading ? (
              <PatientDetailsSkeleton containerStyle={styles.infoCardContainer} />
            ) : (
              <PatientInfoCard 
                containerStyle={styles.infoCardContainer} 
                username={username} 
                email={email} 
                id={id} 
              />
            )}
          </Animated.View>

          {/* Security Section */}
          <Animated.View 
            style={[
              styles.sectionCard,
              { 
                width: cardWidth,
                maxWidth: maxCardWidth,
                opacity: sectionAnimations[1],
                transform: [
                  {
                    translateY: sectionAnimations[1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Icon name="shield-checkmark-outline" size={24} color="#AA336A" />
              <Text style={styles.sectionTitle}>Security</Text>
            </View>

            <TouchableOpacity 
              style={styles.expandButton}
              onPress={togglePasswordForm}
            >
              <Text style={styles.expandButtonText}>Change Password</Text>
              <Icon 
                name={showPasswordForm ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#AA336A" 
              />
            </TouchableOpacity>

            {showPasswordForm && (
              <LinearGradient
                colors={['#AA336A', '#8B2B5A']}
                style={styles.passwordFormContainer}
                start={[0, 0]}
                end={[1, 1]}
              >
                <CustomInput
                  containerStyle={styles.formInput}
                  placeholder="Current Password"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry
                />
                <CustomInput
                  containerStyle={styles.formInput}
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                <CustomInput
                  containerStyle={styles.formInput}
                  placeholder="Confirm New Password"
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  secureTextEntry
                />
                
                <View style={styles.formButtonContainer}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={togglePasswordForm}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.confirmButton, isChangingPassword && { opacity: 0.5 }]}
                    onPress={handleChangePassword}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Update</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            )}
          </Animated.View>

          {/* Account Actions Section */}
          <Animated.View 
            style={[
              styles.sectionCard,
              { 
                width: cardWidth,
                maxWidth: maxCardWidth,
                opacity: sectionAnimations[2],
                transform: [
                  {
                    translateY: sectionAnimations[2].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Icon name="settings-outline" size={24} color="#AA336A" />
              <Text style={styles.sectionTitle}>Account Actions</Text>
            </View>

            {/* Logout Section */}
            <View style={styles.actionContainer}>
              <Logout />
            </View>

            {/* Danger Zone */}
            <TouchableOpacity 
              style={styles.dangerToggle}
              onPress={toggleDangerZone}
            >
              <Icon name="warning-outline" size={20} color="#e74c3c" />
              <Text style={styles.dangerToggleText}>Danger Zone</Text>
              <Icon 
                name={showDangerZone ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#e74c3c" 
              />
            </TouchableOpacity>

            {showDangerZone && (
              <View style={styles.dangerZoneContainer}>
                <Text style={styles.dangerWarningText}>
                  This action cannot be undone. Your account and all data will be permanently deleted.
                </Text>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => setShowDeleteModal(true)}
                >
                  <Icon name="trash-outline" size={20} color="white" />
                  <Text style={styles.deleteButtonText}>Delete Account</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* Bottom spacing */}
          <View style={{ height: 40 }} />


        </ScrollView>

        {/* Enhanced Delete Modal */}
        {showDeleteModal && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDeleteModal}
            onRequestClose={() => setShowDeleteModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContainer, { width: isTablet ? '50%' : '85%' }]}>
                <View style={styles.modalHeader}>
                  <Icon name="warning" size={32} color="#e74c3c" />
                  <Text style={styles.modalTitle}>Delete Account</Text>
                </View>
                
                <Text style={styles.modalDescription}>
                  This action is permanent and cannot be undone. All your data, including your progress and personal information, will be permanently deleted.
                </Text>
                
                <Text style={styles.modalInputLabel}>
                  Enter your password to confirm:
                </Text>
                
                <LinearGradient
                  colors={['#e74c3c', '#c0392b']}
                  style={styles.modalInputGradient}
                  start={[0, 0]}
                  end={[1, 1]}
                >
                  <CustomInput
                    placeholder="Password"
                    secureTextEntry
                    value={deletePassword}
                    onChangeText={setDeletePassword}
                    containerStyle={styles.modalInput}
                  />
                </LinearGradient>
                
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.modalCancelButton]} 
                    onPress={() => {
                      setShowDeleteModal(false);
                      setDeletePassword('');
                    }}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.modalDeleteButton]} 
                    onPress={deleteAccount}
                  >
                    <Text style={styles.modalDeleteButtonText}>Delete Account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  // Main Container Styles
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
  
  // Header Styles
  headerContainer: {
    marginTop: Platform.OS === 'ios' ? 80 : 60,
    marginBottom: 20,
    alignItems: 'center',
  },
  mainTitle: {
    fontFamily: 'Cairo',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  
  // Scroll Container
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  
  // Section Card Styles
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
    padding: 20,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#AA336A',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontFamily: 'Cairo',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#AA336A',
    marginLeft: 12,
  },
  
  // Profile Info Card
  infoCardContainer: {
    borderWidth: 0,
    padding: 0,
    backgroundColor: 'transparent',
    width: '100%',
  },
  
  // Expandable Button Styles
  expandButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 8,
  },
  
  expandButtonText: {
    fontFamily: 'Cairo',
    fontSize: 16,
    fontWeight: '600',
    color: '#AA336A',
  },
  
  // Password Form Styles
  passwordFormContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
  },
  
  formInput: {
    marginBottom: 12,
  },
  
  
  formButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  
  confirmButton: {
    backgroundColor: '#AA336A',
  },
  
  cancelButtonText: {
    fontFamily: 'Cairo',
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  
  confirmButtonText: {
    fontFamily: 'Cairo',
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  // Account Actions
  actionContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  
  // Danger Zone Styles
  dangerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    marginTop: 16,
    justifyContent: 'space-between',
  },
  
  dangerToggleText: {
    fontFamily: 'Cairo',
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
    marginLeft: 8,
    flex: 1,
  },
  
  dangerZoneContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fed7d7',
  },
  
  dangerWarningText: {
    fontFamily: 'Cairo',
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 16,
    lineHeight: 20,
  },
  
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  
  deleteButtonText: {
    fontFamily: 'Cairo',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  
  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    maxWidth: 500,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  modalTitle: {
    fontFamily: 'Cairo',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginTop: 12,
  },
  
  modalDescription: {
    fontFamily: 'Cairo',
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  
  modalInputLabel: {
    fontFamily: 'Cairo',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  
  modalInput: {
    margin: 0,
  },
  
  modalInputGradient: {
    borderRadius: 10,
    padding: 8,
    marginBottom: 24,
  },
  
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  
  modalCancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  
  modalDeleteButton: {
    backgroundColor: '#e74c3c',
  },
  
  modalCancelButtonText: {
    fontFamily: 'Cairo',
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  
  modalDeleteButtonText: {
    fontFamily: 'Cairo',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default PatientSettings;
