import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFetchWithAuth } from '../../Components/FetchWithAuth';

const PatientLookup = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [searchBy, setSearchBy] = useState('username'); 
  const { width } = Dimensions.get('window');
  const filterWidth = width > 450 ? '40%' : '90%'
  const { getJSON, fetchWithAuth } = useFetchWithAuth();

  const searchPatients = async () => {
    if (!searchQuery) return;

    try {
      const data = await getJSON(`/users/patients-list/?searchBy=${searchBy}&query=${searchQuery}`);
      setPatients(data);
      setSearchAttempted(true);
    } catch (error) {
      console.error('Error searching patients:', error);
      setPatients([]);
      setSearchAttempted(true);
    }
  };

  const getGraphData = async (id) => {
    try {
      const data = await getJSON(`/users/patient-graph/${id}/`);
      return data.weekData || {};
    } catch (error) {
      console.error("Error fetching graph data:", error);
      return {};
    }
  };
  

  const handleUserClick = async (user) => {
      const weekData = await getGraphData(user.id);
      navigation.navigate('PatientDetails', {

        email: user.email,
        username: user.username,
        password: user.password,
        id: user.id,

        weeklyData: 
        [{ x: 'M', y: weekData.mon || 0 },
        { x: 'T', y: weekData.tues || 0 },
        { x: 'W', y: weekData.wed || 0 },
        { x: 'Th', y: weekData.thur || 0 },
        { x: 'F', y: weekData.fri || 0 },
        { x: 'S', y: weekData.sat || 0 },
        { x: 'Su', y: weekData.sun || 0 }],

        dailyData: [weekData.week || 0, weekData.all_time || 0]

      });
  };
  

  const handleSearchByChange = (type) => {
    setSearchBy(type);
    setSearchQuery('');  
    setPatients([]);     
    setSearchAttempted(false); 
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#AA336A', '#FFFFFF']}
        style={styles.gradient}
        start={[0, 0]}
        end={[1, 1]}
      >
        <Text style={styles.title}>Patient Search</Text>

        <View style={[styles.buttonContainer, {width: filterWidth}]}>
          <Icon name="funnel-outline" size={45} color="white" />
          <TouchableOpacity
            style={[styles.switchButton, searchBy === 'username' && styles.activeButton]}
            onPress={() => handleSearchByChange('username')}
          >
            <Text style={styles.switchButtonText}>User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switchButton, searchBy === 'email' && styles.activeButton]}
            onPress={() => handleSearchByChange('email')}
          >
            <Text style={styles.switchButtonText}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switchButton, searchBy === 'id' && styles.activeButton]}
            onPress={() => handleSearchByChange('id')}
          >
            <Text style={styles.switchButtonText}>ID</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}> 
        <TextInput
          style={styles.input}
          placeholder={`Search by ${searchBy}${searchBy === 'id' ? " (only #s)..." : "..." }`}
          value={searchQuery}
          onChangeText={(text) => {
            if (searchBy === 'id') {
              setSearchQuery(text.replace(/[^0-9]/g, ''));
            } else {
              setSearchQuery(text);
            }
          }}
          keyboardType='default' 
        />
          <TouchableOpacity style={styles.searchButton} onPress={searchPatients}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {patients.length > 0 ? (
          <FlatList
           showsVerticalScrollIndicator={false}
            style={{ marginTop: 40 }}
            data={patients}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.patientItem} onPress={() => handleUserClick(item)}>
                <Text style={styles.itemText}> User: 
                <Text style={{ fontWeight: 'bold' }}> {item.username}</Text>
                  </Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          searchAttempted && <Text style={styles.notFound} >No patients found with that {searchBy}.</Text>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchButton: {
    borderWidth: 3,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    width: 80,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#E699B6',
  },
  switchButtonText: {
    color: '#AA336A',
    fontFamily: 'Cairo',
    fontWeight: 'bold',
    lineHeight: 24,
  },
  searchBar: {
    flexDirection: 'row',
    width: 300,
  },
  searchButton: {
    borderWidth: 3,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'Cairo',
    borderWidth: 3,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 52,
    marginRight: 10,
  },
  patientItem: {
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    padding: 15,
    width: 300,
    marginBottom: 10,
  },
  itemText: {
    fontFamily: 'Cairo',
    fontSize: '15'
  },
  buttonText: {
    color: '#AA336A',
    fontFamily: 'Cairo',
    lineHeight: 25,
    fontWeight: 'bold'
    },
  notFound: {
    marginTop: 30,
    fontFamily: 'Cairo',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default PatientLookup;