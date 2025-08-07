import React, { useState, useCallback, useContext, useRef, useEffect } from 'react'; // Added useEffect
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFetchWithAuth } from '../../Components/Services/FetchWithAuth';
import { PatientContext } from '../../Components/Services/PatientContext';
import AudioPlayer from '../../Components/AV/AudioPlayer';
import VideoPlayer from '../../Components/AV/VideoPlayer';

const DashPlayer = ({ route, navigation }) => {
  const {
    videoUrl, videoTitle, videoId,
    videoDescription, isCompleted, mediaType,
  } = route.params;

  const { width, height } = Dimensions.get('window');
  const videoRef = useRef(null);
  const submitted = useRef(false);
  const [confettiVisible, setConfettiVisible] = useState(false);

  // --- NEW: State for media loading and errors within DashPlayer ---
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState(null); // Stores a user-friendly error message

  const { refresh, setRefresh } = useContext(PatientContext);
  const { getJSON } = useFetchWithAuth();

  // NEW: Validate and prepare media URL on mount with a HEAD request
  useEffect(() => {
    const validateMediaUrl = async () => {
      if (!videoUrl || !videoUrl.startsWith('http')) {
        setMediaError('A valid media URL was not provided.');
        setMediaLoading(false);
        return;
      }

      try {
        console.log(`[Player] Validating URL: ${videoUrl}`);
        const response = await fetch(videoUrl, { method: 'HEAD' });

        if (response.ok) {
          // URL is valid and resource exists
          setMediaError(null);
          setMediaLoading(false); // Let the player components handle their own loading
        } else {
          // URL is valid but resource is not found (404) or other error
          setMediaError('This media could not be found. It may have been moved or deleted.');
          setMediaLoading(false);
        }
      } catch (error) {
        // Network error, DNS error, etc.
        console.error('[Player] Network error validating URL:', error);
        setMediaError('A network error occurred. Please check your connection and try again.');
        setMediaLoading(false);
      }
    };
    validateMediaUrl();
  }, [videoUrl]);


  /* ------------------- Completion logic ------------------- */
  const handleComplete = useCallback(async () => {
    if (submitted.current || isCompleted || mediaError) { // NEW: Don't mark complete if media had an error
      console.warn("[DashPlayer] Completion skipped: Already submitted, already completed, or media had error.");
      return;
    }
    submitted.current = true;
    console.log(`[DashPlayer] Attempting to mark videoId ${videoId} as complete.`);
    try {
      const response = await getJSON(`/users/update_video_completion/${videoId}/`, {
        method: 'POST',
        body: JSON.stringify({ isCompleted: true }),
      });
      // Optionally check response.ok here for backend success
      console.log('[DashPlayer] Completion update response:', response);

      if (response.status === 200) { // Assuming 200 OK for success
        setConfettiVisible(true);
        setRefresh(true);
        console.log("[DashPlayer] Completion successful. Showing confetti and navigating.");
        setTimeout(() => {
          setConfettiVisible(false);
          submitted.current = false;
          navigation.navigate('Dashboard');
        }, 3000);
      } else {
        const errorDetails = await response.json(); // Attempt to get JSON error from backend
        console.error('[DashPlayer] Backend reported error during completion:', errorDetails);
        Alert.alert('Completion Failed', `Backend error: ${errorDetails?.detail || 'Unknown error'}. Please try again.`);
        submitted.current = false;
      }
    } catch (err) {
      console.error('[DashPlayer] Network or unexpected error during completion:', err);
      Alert.alert('Completion Failed', 'A network error occurred. Please check your connection and try again.');
      submitted.current = false;
    }
  }, [getJSON, videoId, navigation, setRefresh, isCompleted, mediaError]); // Added mediaError to dependencies



  /* ------------------- NAVIGATION ------------------- */
  const returnHome = useCallback(async () => {
    if (videoRef.current) {
      console.log("[DashPlayer] Pausing and unloading video before navigating home.");
      await videoRef.current.pauseAsync();
      await videoRef.current.unloadAsync();
    }
    console.log("[DashPlayer] Navigating to Dashboard.");
    navigation.navigate('Dashboard');
  }, [navigation]);


  /* ------------------- RENDER ------------------- */
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#AA336A', '#FFFFFF']} style={styles.gradient} start={[0, 0]} end={[1, 1]}>
        {/* Top bar */}
        <View style={[styles.top, { marginTop: width > 400 ? 0 : 30 }]}>
          <TouchableOpacity onPress={returnHome} style={styles.button}>
            <Icon name="return-up-back-outline" size={25} color="#AA336A" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{videoTitle}</Text>

        {/* --- NEW: Conditional Rendering of Media Player --- */}
        {mediaError ? (
          <View style={styles.mediaErrorContainer}>
            <Icon name="alert-circle-outline" size={60} color="red" />
            <Text style={styles.mediaErrorText}>{mediaError}</Text>
          </View>
        ) : mediaLoading ? (
          <View style={styles.mediaLoadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.mediaLoadingText}>Validating Media...</Text>
          </View>
        ) : mediaType === 'video' ? (
          <VideoPlayer
            sourceUrl={videoUrl}
            onFinish={handleComplete} // Only DashPlayer has handleComplete
            onPlaybackError={setMediaError}
          />
        ) : (
          <AudioPlayer
            sourceUrl={videoUrl}
            onFinish={handleComplete} // Only DashPlayer has handleComplete
            onPlaybackError={setMediaError}
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
            disabled={submitted.current || mediaLoading || mediaError} // NEW: Disable if loading or error
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
  // New styles for media loading/error
  mediaLoadingContainer: {
    width: '90%',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'white',
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim background
  },
  mediaLoadingText: {
    marginTop: 10,
    color: 'white',
    fontSize: 18,
    fontFamily: 'Cairo',
  },
  mediaErrorContainer: {
    width: '90%',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'red',
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.7)', // Darker dim background for error
  },
  mediaErrorText: {
    marginTop: 10,
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 10,
    fontFamily: 'Cairo',
  },
});

export default DashPlayer;