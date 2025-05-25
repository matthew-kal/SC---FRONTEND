import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const PrivacyPolicy = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Text style={styles.title}>Privacy Policy</Text>
      <TouchableOpacity style={styles.logout} onPress={() => setVisible(true)}>
        <Icon
          name="newspaper-outline"
          style={styles.icon}
          size={25}
          color="#AA336A"
        />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* 1. Introduction */}
              <Text style={styles.modalPolicyHeader}>1. Introduction</Text>
              <Text style={styles.modalPolicyText}>
                This Privacy Policy describes how SurgiCalm (“we,” “us,” “our”) collects, uses,
                shares, and protects data when you use our mobile application. By registering
                for an account, you agree to these practices.
              </Text>
              <View style={styles.separator} />

              {/* 2. Data Controllers */}
              <Text style={styles.modalPolicyHeader}>2. Data Controllers</Text>
              <Text style={styles.modalPolicyBullet}>
                • Developer: Individual developer responsible for app development and improvements.
              </Text>
              <Text style={styles.modalPolicyBullet}>
                • Partner Hospitals & Professionals: Each hospital and its staff who enroll patients
                  and manage archival policies.
              </Text>
              <View style={styles.separator} />

              {/* 3. Data We Never Collect */}
              <Text style={styles.modalPolicyHeader}>3. Data We Never Collect</Text>
              <Text style={styles.modalPolicyBullet}>
                • Full name, date of birth, phone number, or other traditional identifiers
              </Text>
              <Text style={styles.modalPolicyBullet}>
                • Health records, images, audio, or location data
              </Text>
              <Text style={styles.modalPolicyBullet}>
                • Camera, microphone, contacts, or calendar access
              </Text>
              <View style={styles.separator} />

              {/* 4. Data We Do Collect */}
              <Text style={styles.modalPolicyHeader}>4. Data We Do Collect</Text>
              <Text style={styles.modalPolicyBullet}>
                • Account Credentials: Username & password
              </Text>
              <Text style={styles.modalPolicyBullet}>
                • Contact Email: Email address for password recovery
              </Text>
              <Text style={styles.modalPolicyBullet}>
                • Hospital Affiliation: Hospital identifier
              </Text>
              <Text style={styles.modalPolicyBullet}>
                • Push Notification Token: Expo push token
              </Text>
              <Text style={styles.modalPolicyBullet}>
                • Usage & Progress Data: Counts of videos/modules and tasks completed
              </Text>
              <View style={styles.separator} />

              {/* 5. How We Use Your Data */}
              <Text style={styles.modalPolicyHeader}>5. How We Use Your Data</Text>
              <Text style={styles.modalPolicyBullet}>
                • Authentication & Account Management
              </Text>
              <Text style={styles.modalPolicyBullet}>• Password Recovery via email</Text>
              <Text style={styles.modalPolicyBullet}>
                • Clinical Monitoring & Research support
              </Text>
              <Text style={styles.modalPolicyBullet}>
                • App Improvement & Bug-Fixing
              </Text>
              <Text style={styles.modalPolicyBullet}>• Push Notifications</Text>
              <View style={styles.separator} />

              {/* 6. Third-Party Services */}
              <Text style={styles.modalPolicyHeader}>6. Third-Party Services</Text>
              <Text style={styles.modalPolicyText}>
                • AWS (RDS, S3, EC2) for backend hosting{'\n'}
                • Expo Notifications for push delivery{'\n'}
                We do not sell or trade personal data.
              </Text>
              <View style={styles.separator} />

              {/* 7. Data Retention & Deletion */}
              <Text style={styles.modalPolicyHeader}>7. Data Retention & Deletion</Text>
              <Text style={styles.modalPolicyBullet}>
                • Patients: Data retained until they delete their account; all records then erased.
              </Text>
              <Text style={styles.modalPolicyBullet}>
                • Admins: Accounts deleted by emailing admin@surgicalm.com.
              </Text>
              <View style={styles.separator} />

              {/* 8. User Rights */}
              <Text style={styles.modalPolicyHeader}>8. User Rights</Text>
              <Text style={styles.modalPolicyBullet}>• Account Deletion in Settings</Text>
              <Text style={styles.modalPolicyBullet}>• Notification Opt-Out in Settings</Text>
              <Text style={styles.modalPolicyBullet}>• No Data Export feature</Text>
              <View style={styles.separator} />

              {/* 9. Security Measures */}
              <Text style={styles.modalPolicyHeader}>9. Security Measures</Text>
              <Text style={styles.modalPolicyBullet}>• HTTPS encryption (ATS compliant)</Text>
              <Text style={styles.modalPolicyBullet}>• SecureStore/Keychain for tokens</Text>
              <Text style={styles.modalPolicyBullet}>• Rate-limited sensitive endpoints</Text>
              <View style={styles.separator} />

              {/* 10. Children’s Privacy */}
              <Text style={styles.modalPolicyHeader}>10. Children’s Privacy</Text>
              <Text style={styles.modalPolicyText}>
                App may be downloaded by anyone 13+, but only hospitals create patient
                accounts.
              </Text>
              <View style={styles.separator} />

              {/* 11. International Privacy Laws */}
              <Text style={styles.modalPolicyHeader}>11. International Privacy Laws</Text>
              <Text style={styles.modalPolicyText}>
                Operates in New Jersey, USA; not subject to GDPR or CCPA.
              </Text>
              <View style={styles.separator} />

              {/* 12. Changes to This Policy */}
              <Text style={styles.modalPolicyHeader}>12. Changes to This Policy</Text>
              <Text style={styles.modalPolicyText}>
                We update this policy; “Last updated” date will change accordingly.
              </Text>
              <View style={styles.separator} />

              {/* 13. Contact Us */}
              <Text style={styles.modalPolicyHeader}>13. Contact Us</Text>
              <Text style={styles.modalPolicyText}>
                SurgiCalm Dev Team{'\n'}privacy@surgicalm.com
              </Text>
            </ScrollView>

            <TouchableOpacity style={styles.modalPolicyHeader} onPress={() => setVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Cairo',
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  logout: {
    width: 70,
    height: 60,
    borderWidth: 1,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontFamily: 'Cairo',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#AA336A',
    marginBottom: 10,
  },
  modalScroll: {
    paddingBottom: 20,
  },
  modalPolicyHeader: {
    fontFamily: 'Cairo',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#AA336A',
    marginBottom: 4,
  },
  modalPolicyText: {
    fontFamily: 'Cairo',
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  modalPolicyBullet: {
    fontFamily: 'Cairo',
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    marginBottom: 6,
  },
  separator: {
    height: 1,
    backgroundColor: '#DDD',
    marginVertical: 12,
  },
  icon: {
    alignSelf: 'center',
  }
});

export default PrivacyPolicy;