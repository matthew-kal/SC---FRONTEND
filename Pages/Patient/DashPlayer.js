import React, { useState, useCallback, useContext, useRef, useEffect } from 'react'; // Added useEffect
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Video } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFetchWithAuth } from '../../Components/FetchWithAuth';
import Logo from '../../Images/mini_logo.png';
import { PatientContext } from '../../Components/PatientContext';
import AudioPlayer from '../../Components/AudioPlayer';

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

  // --- NEW: Validate and prepare media URL on mount ---
  useEffect(() => {
    console.log("[DashPlayer] Effect running: Initial media URL check.");
    if (!videoUrl) {
      console.error("[DashPlayer] Error: videoUrl is missing from route params.");
      setMediaError('Media content URL is missing. Please contact support.');
      setMediaLoading(false);
      return;
    }
    // Check for "fake" URLs or invalid protocols upfront
    if (videoUrl.includes('fakeurl.com') || !videoUrl.startsWith('http')) {
      console.warn(`[DashPlayer] Warning: Invalid or mock URL detected: ${videoUrl}`);
      setMediaError('Invalid media URL detected. Content may not load. Please use a valid, accessible URL (e.g., HTTPS).');
      setMediaLoading(false);
      return;
    }
    console.log(`[DashPlayer] Valid URL format detected: ${videoUrl}`);
    // If URL seems valid, the specific player component (Video/AudioPlayer) will handle loading.
    // Set loading to false here, so the player components' own loading indicators take over.
    setMediaLoading(false); 
    setMediaError(null); // Clear any previous error
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

  /* NEW: Video status update handler for loading/error reporting */
  const handleVideoPlaybackStatusUpdate = useCallback((status) => {
    // Only set loading to false once the video is actually loaded
    if (status.isLoaded && mediaLoading) {
      setMediaLoading(false);
      console.log("[DashPlayer] Video loaded successfully.");
    }
    // Check for playback finishing
    if (status.didJustFinish && !status.isLooping) {
      console.log("[DashPlayer] Video playback finished.");
      handleComplete();
    }
    // Check for errors during playback
    if (status.error && !mediaError) { // Prevent setting same error multiple times
      const errorMessage = `Video playback error: ${status.error}. Please check your internet connection.`;
      console.error(`[DashPlayer] Video playback error detected: ${status.error}`);
      setMediaError(errorMessage);
      setMediaLoading(false); // Stop loading if an error occurs
      Alert.alert('Video Playback Error', errorMessage);
    }
  }, [handleComplete, mediaLoading, mediaError]); // Added mediaLoading, mediaError to dependencies

  /* NEW: Video error handler (for initial load errors from Video component) */
  const handleVideoError = useCallback((error) => {
    console.error('[DashPlayer] Expo Video onError (initial load):', error);
    setMediaError('Failed to load video: Check URL, network, or content. Contact support if issue persists.');
    setMediaLoading(false);
    Alert.alert('Video Load Error', 'Unable to load video. Please verify the URL or your network connection.');
  }, []);

  /* NEW: Audio error handler (passed to AudioPlayer component) */
  const handleAudioError = useCallback((error) => {
    console.error('[DashPlayer] AudioPlayer reported error:', error);
    setMediaError('Failed to load audio: Check URL, network, or content. Contact support if issue persists.');
    setMediaLoading(false);
    Alert.alert('Audio Load Error', 'Unable to load audio. Please verify the URL or your network connection.');
  }, []);


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
          <Image source={Logo} style={styles.logo} />
        </View>

        <Text style={styles.title}>{videoTitle}</Text>

        {/* --- NEW: Conditional Rendering of Media Player / Loading / Error State --- */}
        {mediaError ? (
          <View style={styles.mediaErrorContainer}>
            <Icon name="alert-circle-outline" size={60} color="red" />
            <Text style={styles.mediaErrorText}>{mediaError}</Text>
          </View>
        ) : mediaLoading ? (
          <View style={styles.mediaLoadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.mediaLoadingText}>Loading Media...</Text>
          </View>
        ) : mediaType === 'video' ? (
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            useNativeControls
            resizeMode="contain"
            shouldPlay
            onPlaybackStatusUpdate={handleVideoPlaybackStatusUpdate} // NEW: Use detailed handler
            onError={handleVideoError} // NEW: Use detailed handler for load errors
          />
        ) : (
          <AudioPlayer
            sourceUrl={videoUrl}
            iconColor="white"
            iconSize={70}
            onFinish={handleComplete}
            onPlaybackError={handleAudioError} // NEW: Pass error handler to AudioPlayer
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