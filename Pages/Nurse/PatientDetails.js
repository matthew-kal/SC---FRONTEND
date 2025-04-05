import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Graph from '../../Components/Graph';

const PatientDetails = ({ route }) => {
  const { email, username, id, weeklyData, dailyData } = route.params;
  const {width, _ } = Dimensions.get("window")  
  const boxWidth = width < 450 ? '90%' : '50%';

  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#AA336A', '#FFFFFF']}
        style={styles.gradient}
        start={[0, 0]}
        end={[1, 1]}
      >
        <Text style={styles.title}>Patient Details</Text>
        <View style={[styles.detailsContainer, {width: boxWidth}]}>
          <Text style={styles.detailsText}> 
            <Text style={{ fontWeight: 'bold' }}> User: </Text> 
            {username}
          </Text>
          <Text style={styles.detailsText}> 
            <Text style={{ fontWeight: 'bold' }}> Email: </Text> 
            {email}
          </Text>
          <Text style={styles.detailsText}> 
            <Text style={{ fontWeight: 'bold' }}> ID: </Text>
            {id}
          </Text>
        </View>

        <View style={[styles.detailsContainer, {width: boxWidth}]}> 
          <Graph weeklyData={weeklyData} dailyData={dailyData}/>
          </View>
       
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  title: {
    fontFamily: 'Cairo',
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    marginTop: 60,
  },
  detailsContainer: {
    borderWidth: 3,
    padding: 15,
    borderRadius: 10,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    marginBottom: 20,
    alignItems: 'center',
  },
  detailsText: {
    fontFamily: 'Cairo',
    lineHeight: 25,
    fontSize: 16,
  },
  placeholderStyle: {
    fontFamily: 'Cairo',
    fontSize: 16,
    color: '#999999',
  },
  selectedTextStyle: {
    fontFamily: 'Cairo',
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});

export default PatientDetails;
