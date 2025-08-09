import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Graph from '../../Components/Cards/Graph';
import { useFetchWithAuth } from '../../Components/Services/FetchWithAuth';
import PatientDetailsSkeleton from '../../Components/Skeletons/PatientDetailsSkeleton';
import PatientInfoCard from '../../Components/Cards/PatientInfoCard';
import GraphSkeleton from '../../Components/Skeletons/GraphSkeleton';

const PatientDetails = ({ route }) => {
  const { id, username, email } = route.params;
  const { width } = Dimensions.get('window');
  const boxWidth = width < 450 ? '90%' : '50%';
  const [detailsData, setDetailsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getJSON } = useFetchWithAuth();

  useEffect(() => {
    const fetchPatientDetails = async () => {
       setIsLoading(true); 
      try {
        const data = await getJSON(`/users/patient-graph/${id}/`);
        setDetailsData(data.weekData);
      } catch (err) {
        setError('Failed to load patient data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatientDetails();
  }, [id]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#AA336A', '#FFFFFF']}
        style={styles.gradient}
        start={[0, 0]}
        end={[1, 1]}
      >
        <Text style={styles.title}>Patient Details</Text>

        {isLoading ? (
          <>
            <PatientDetailsSkeleton containerStyle={[styles.cardContainer, { width: boxWidth }]} />
            <GraphSkeleton containerStyle={[styles.cardContainer, { height: 250, width: boxWidth }]} />
          </>
        ) : error ? (
          <View style={{ alignItems: 'center' }}>
            <Text>{error}</Text>
          </View>
        ) : (
          <>
            <PatientInfoCard username={username} email={email} id={id} containerStyle={[styles.cardContainer, { width: boxWidth }]} />
            <View style={[styles.cardContainer, { width: boxWidth }]}> 
              <Graph
              
                containerStyle={{ justifyContent: 'center', alignItems: 'center' }}
                weeklyData={[
                  { x: 'M', y: detailsData?.mon || 0 },
                  { x: 'T', y: detailsData?.tues || 0 },
                  { x: 'W', y: detailsData?.wed || 0 },
                  { x: 'Th', y: detailsData?.thur || 0 },
                  { x: 'F', y: detailsData?.fri || 0 },
                  { x: 'S', y: detailsData?.sat || 0 },
                  { x: 'Su', y: detailsData?.sun || 0 },
                ]}
                dailyData={[detailsData?.week || 0, detailsData?.all_time || 0]}
              />
            </View>
          </>
        )}
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
  cardContainer: {
    borderWidth: 3,
    padding: 15,
    borderRadius: 10,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    marginBottom: 20,
    alignItems: 'center',
    alignSelf: 'center'
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
