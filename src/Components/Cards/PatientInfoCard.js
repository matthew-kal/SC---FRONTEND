// PatientInfoCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PatientInfoCard = ({ username, email, id, containerStyle }) => {
  return (
    // Merge default styles with styles passed from the parent
    <View style={[styles.defaultContainer, containerStyle]}>
      <Text style={styles.text}>
        <Text style={styles.bold}> User: </Text>
        {username}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.bold}> Email: </Text>
        {email}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.bold}> ID: </Text>
        {id}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Add default styles for the card itself
  defaultContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  text: {
    fontFamily: 'Cairo',
    lineHeight: 25,
    fontSize: 16, // Font size is now fixed
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default PatientInfoCard;