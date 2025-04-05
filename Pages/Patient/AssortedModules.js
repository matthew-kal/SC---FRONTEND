import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Logo from '../../Images/Logo.png';
import miniLogo from '../../Images/mini_logo.png';
import {getSecureItem, saveSecureItem} from "../../Components/Memory"


const Module = ({ title, handlePress }) => (
  <TouchableOpacity style={styles.buttonContainer} onPress={handlePress}>
    <View style={styles.button}>
      <Text style={styles.title}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const AssortedModules = () => {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const route = useRoute();
  const { categoryId, subcategoryId, subcategory } = route.params;
  const {width, _ } = Dimensions.get("window") 

  useFocusEffect(
    useCallback(() => {
        fetchModules();
    }, [categoryId, subcategoryId])
  );

  const fetchModules = async () => {
    try {
      let token = await getSecureItem('accessPatient');
      if (!token) throw new Error('No access token found');

      let response = await fetch(`http://127.0.0.1:8000/users/${categoryId}/${subcategoryId}/modules-list/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        const refreshToken = await getSecureItem('refreshPatient');
        if (!refreshToken) throw new Error('No refresh token found');

        const refreshResponse = await fetch('http://127.0.0.1:8000/users/token/refresh/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!refreshResponse.ok) throw new Error('Failed to refresh token');

        const refreshData = await refreshResponse.json();
        await saveSecureItem('accessPatient', refreshData.access);
        token = refreshData.access;

        response = await fetch(`http://127.0.0.1:8000/users/${categoryId}/${subcategoryId}/modules-list/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log(data)

      // Mapping video titles and URLs
      const videoData = data.videos ? data.videos.map(video => ({
        title: video.title,
        url: video.url,
        description: video.description,
      })) : [];
      setVideos(videoData);

    } catch (error) {
      console.error('Fetch error:', error);
      setError(error);
    } finally {
      setLoading(false);
      console.log(videos)
    }
  };

  const handleNavigate = (videoUrl, videoTitle, videoDescription) => {
    setLoading(true);
    navigation.navigate('AssortedPlayer', { videoUrl, videoTitle, videoDescription });
  };

  const handleReturn = () => {
    setLoading(true);
    navigation.navigate('AssortedCategories');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#AA336A', '#FFFFFF']}
          style={styles.gradient}
          start={[0, 0]}
          end={[1, 1]}
        >
          <Image source={Logo} style={styles.logo} />
          <ActivityIndicator size="large" color="white" />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#AA336A', '#FFFFFF']}
        style={styles.gradient}
        start={[0, 0]}
        end={[1, 1]}
      >

        <View style={[styles.top, , {marginTop: width > 450 ? 50 : 75}]}>
        <TouchableOpacity onPress={handleReturn} style={styles.backbutton}>
          <Icon name={"return-up-back-outline"} style={styles.icon} size={27} color="#AA336A" />
        </TouchableOpacity>
        <Image source={miniLogo} style={styles.miniLogo} />
        </View>

        <Text style={styles.header}>{subcategory}</Text>

        {error ? (
          <Text style={styles.errorMessage}>No videos found.</Text>
        ) : 
        
        videos.length > 0 ? (
          <ScrollView contentContainerStyle={styles.scroll}>
            {videos.map((video, index) => (
              <Module
                key={index}
                title={video.title}
                handlePress={() => handleNavigate(video.url, video.title, video.description)}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.errorMessage}>No modules available</Text>
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
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    width: '90%',
    marginTop: 40,
  },
  miniLogo: {
    width: 60,
    height: 60,
  },
  logo: {
    marginTop: 80,
    marginBottom: 20,
    width: 275,
    height: 65,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  scroll: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 20,
  },
  header: {
    fontFamily: 'Cairo',
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  title: {
    fontFamily: 'Cairo',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  backbutton: {
    marginHorizontal: 10,
    padding: 10,
    margin: 5,
    backgroundColor: 'white',
    borderColor: '#AA336A',
    borderRadius: 100,
    borderWidth: 2,
  },
  buttonContainer: {
    width: 270,
    alignSelf: 'center',
    marginBottom: 10,
  },
  button: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
  },
  errorMessage: {
    fontFamily: 'Cairo',
    fontSize: 20,
    color: 'red',
    height: '75%',
  },
});

export default AssortedModules;