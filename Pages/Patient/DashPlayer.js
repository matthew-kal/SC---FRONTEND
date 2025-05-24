import React, { useState, useCallback, useContext, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFetchWithAuth } from '../../Components/FetchWithAuth';
import Logo from '../../Images/mini_logo.png';
import { PatientContext } from '../../Components/PatientContext';


const DashPlayer = ({ route, navigation }) => {
  const { videoUrl, videoTitle, videoId, videoDescription, isCompleted} = route.params; 
  const [confettiVisible, setConfettiVisible] = useState(false);
  const videoRef = useRef(null);
  const { width, height } = Dimensions.get("window")
  const { refresh, setRefresh } = useContext(PatientContext);
  const { getJSON } = useFetchWithAuth();
  const submitted = useRef(false)


  const handlePlaybackStatusUpdate = async (playbackStatus) => {

    if (playbackStatus.didJustFinish && !playbackStatus.isLooping && !isCompleted) {
      await videoRef.current.setPositionAsync(0); 
      handleCompletePress();  
    }
  };

  const returnHome = async () => {
    if (videoRef.current) {
      await videoRef.current.pauseAsync();
    }
    console.log(isCompleted)
    navigation.navigate('Dashboard')
  };

  const handleCompletePress = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true;
    try {
      await getJSON(`/users/update_video_completion/${videoId}/`, {
        method: 'POST',
        body: JSON.stringify({ isCompleted: true }),
      });

      setConfettiVisible(true);
      setRefresh(true);
      setTimeout(() => {
        setConfettiVisible(false);
        navigation.navigate('Dashboard');
      }, 3000);
    } catch (error) {
      console.error('Fetch error:', error);
      submitted.current = false;
    }
  }, [getJSON, navigation, videoId, setRefresh]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#AA336A', '#FFFFFF']}
        style={styles.gradient}
        start={[0, 0]}
        end={[1, 1]}
      >
       <View style={[styles.top, {marginTop: width > 400 ? 0 : 30}]}>
        <TouchableOpacity onPress={ returnHome } style={styles.button}>
          <Icon name={"return-up-back-outline"} style={styles.icon} size={25} color="#AA336A" />
        </TouchableOpacity>
        <Image source={Logo} style={styles.logo} />
        </View>
        <Text style={styles.title}>{videoTitle}</Text>
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          isMuted={false}
          useNativeControls
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          resizeMode="contain"
          shouldPlay
        />

        <View style={styles.textContainer}> 
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.vidText}>
              {videoDescription}
             </Text>
          </ScrollView>
        </View>

        <View style={styles.buttonContainer}>
          {!isCompleted && (
          <TouchableOpacity onPress={handleCompletePress} style={styles.button} disabled={submitted.current}>
            <Icon name={"checkmark-outline"} style={styles.icon} size={25} color="#AA336A" />
          </TouchableOpacity>
          )}
        </View>

        {confettiVisible && (
          <View style={styles.confettiContainer}>
            <ConfettiCannon
              count={200}
              origin={{ x: width / 2, y: height / 2 }}
              colors={['#AA336A', '#FFFFFF']}
              fadeOut
            />
          </View>
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
  video: {
    width: '90%',
    height: '30%',
    borderColor: 'white',
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 10,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontFamily: 'Cairo',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    textAlign: 'center',
  },
  textContainer: {
    width: '90%', 
    height: 230,  
    marginTop: 10,
  },
  vidText: {
    fontFamily: 'Cairo',
    textAlign: 'center',
    color: 'white',
    fontSize: 19,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    width: '90%',
  },
  button: {
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: 'white',
    borderColor: '#AA336A',
    borderRadius: 100,
    borderWidth: 2,
  },
  buttonText: {
    color: '#AA336A',
    fontWeight: 'bold',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10, 
  },
});

export default DashPlayer;
