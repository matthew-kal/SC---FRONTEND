import React, { useState, useCallback, useContext, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Video } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFetchWithAuth } from '../../Components/FetchWithAuth';
import Logo from '../../Images/mini_logo.png';
import { PatientContext } from '../../Components/PatientContext';
import AudioPlayer from '../../Components/AudioPlayer';          // ← NEW

const DashPlayer = ({ route, navigation }) => {
  const {
    videoUrl, videoTitle, videoId,
    videoDescription, isCompleted, mediaType,
  } = route.params;

  const { width, height } = Dimensions.get('window');
  const videoRef   = useRef(null);
  const submitted  = useRef(false);
  const [confettiVisible, setConfettiVisible] = useState(false);

  const { refresh, setRefresh } = useContext(PatientContext);
  const { getJSON } = useFetchWithAuth();

  /* ------------------- Completion logic ------------------- */
  const handleComplete = useCallback(async () => {
    if (submitted.current || isCompleted) return;
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
        submitted.current = false;
        navigation.navigate('Dashboard');
      }, 3000);
    } catch (err) {
      console.error('Completion error', err);
      submitted.current = false;
    }
  }, [getJSON, videoId, navigation, setRefresh, isCompleted]);

  /* video-specific callback */
  const handleStatusUpdate = (status) => {
    if (status.didJustFinish && !status.isLooping) {
      handleComplete();
    }
  };

  /* ------------------- NAVIGATION ------------------- */
  const returnHome = async () => {
    if (videoRef.current) {
      await videoRef.current.pauseAsync();
      await videoRef.current.unloadAsync();
    }
    navigation.navigate('Dashboard');
  };

  /* ------------------- RENDER ------------------- */
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#AA336A', '#FFFFFF']} style={styles.gradient} start={[0, 0]} end={[1, 1]}>
        {/* Top bar */}
        <View style={[styles.top, { marginTop: width > 400 ? 0 : 30 }]}>
          <TouchableOpacity onPress={returnHome} style={styles.button}>
            <Icon name="return-up-back-outline" size={25} color="#AA336A" />
          </TouchableOpacity>
          <Image source={Logo} style={styles.logo} />
        </View>

        <Text style={styles.title}>{videoTitle}</Text>

        {mediaType === 'video' ? (
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            useNativeControls
            resizeMode="contain"
            shouldPlay
            onPlaybackStatusUpdate={handleStatusUpdate}
            onError={() => Alert.alert('Video Error', 'Unable to load video.')}
          />
        ) : (
          <AudioPlayer
            sourceUrl={videoUrl}
            iconColor="white"
            iconSize={70}
            onFinish={handleComplete}
          />
        )}

        <View style={styles.textContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.vidText}>{videoDescription}</Text>
          </ScrollView>
        </View>

        {!isCompleted && (
          <TouchableOpacity
            onPress={handleComplete}
            style={styles.button}
            accessibilityLabel="Mark module complete"
            disabled={submitted.current}
          >
            <Icon name="checkmark-outline" size={25} color="#AA336A" />
          </TouchableOpacity>
        )}

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

/* ------------------- Styles ------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  logo: { width: 60, height: 60 },
  title: { fontFamily: 'Cairo', fontSize: 40, fontWeight: 'bold', marginBottom: 10, color: 'white', textAlign: 'center' },
  video: { width: '90%', height: '30%', borderColor: 'white', borderWidth: 3, borderRadius: 10, marginBottom: 10 },
  textContainer: { width: '90%', height: 230, marginTop: 10 },
  vidText: { fontFamily: 'Cairo', textAlign: 'center', color: 'white', fontSize: 19, fontWeight: 'bold' },
  button: { marginHorizontal: 10, padding: 10, backgroundColor: 'white', borderColor: '#AA336A', borderRadius: 100, borderWidth: 2 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '90%' },
  confettiContainer: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
});

export default DashPlayer;