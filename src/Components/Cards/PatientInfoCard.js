import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PatientInfoCard = ({ username, email, id, containerStyle }) => {
  return (
    <View style={containerStyle}>
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
  text: {
    fontFamily: 'Cairo',
    lineHeight: 25,
    fontSize: 16,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default PatientInfoCard;


