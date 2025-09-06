import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFetchWithAuth } from '../../Components/Services/FetchWithAuth';
import { PatientContext } from '../../Components/Services/PatientContext';
import AudioPlayer from '../../Components/AV/AudioPlayer';
import VideoPlayer from '../../Components/AV/VideoPlayer';

const MediaPlayer = ({ route, navigation }) => {
  // The videoId is now the primary parameter - no more direct videoUrl
  const { videoId, videoTitle, videoDescription, mediaType, mode, isCompleted } = route.params;

  const [signedUrl, setSignedUrl] = useState(null); // NEW: State to hold the temporary URL
  const [isLoading, setIsLoading] = useState(true);
  const [mediaError, setMediaError] = useState(null);
  const [confettiVisible, setConfettiVisible] = useState(false);

  const { width, height } = Dimensions.get('window');
  const videoRef = useRef(null);
  const submitted = useRef(false);

  const { getJSON } = useFetchWithAuth();
  const { setRefresh } = useContext(PatientContext);

  // MODIFIED: useEffect now fetches the signed URL directly with cleanup
  useEffect(() => {
    let isMounted = true; // Flag to track if component is still mounted
    
    const fetchSignedUrl = async () => {
      if (!isMounted) return; // Early exit if component unmounted
      
      setIsLoading(true);
      setMediaError(null);
      setSignedUrl(null);
      
      try {
        console.log(`[MediaPlayer] Fetching signed URL for module ${videoId}`);
        const response = await getJSON(`/users/modules/${videoId}/signed-url/`);
        
        // Check if component is still mounted before updating state
        if (!isMounted) {
          console.log(`[MediaPlayer] Component unmounted, ignoring response for module ${videoId}`);
          return;
        }
        
        console.log(`[MediaPlayer] Response received:`, JSON.stringify(response));
        
        if (response && response.signedUrl) {
          console.log(`[MediaPlayer] Successfully received signed URL for module ${videoId}`);
          setSignedUrl(response.signedUrl);
        } else {
          console.error('[MediaPlayer] Invalid response structure:', response);
          throw new Error("Invalid response from server when fetching signed URL.");
        }
      } catch (err) {
        // Only update state if component is still mounted
        if (isMounted) {
          console.error('[MediaPlayer] Error fetching signed URL:', err);
          setMediaError("Could not load media. Please check your connection and try again.");
        } else {
          console.log(`[MediaPlayer] Component unmounted, ignoring error for module ${videoId}`);
        }
      } finally {
        // Only update state if component is still mounted
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSignedUrl();
    
    // Cleanup function: mark component as unmounted
    return () => {
      console.log(`[MediaPlayer] Component unmounting, canceling any pending operations for module ${videoId}`);
      isMounted = false;
    };
  }, [videoId]); // Only run when videoId changes

  const handleComplete = useCallback(async () => {
    if (mode !== 'dashboard') return;
    if (submitted.current || isCompleted || mediaError) {
      console.warn('[MediaPlayer] Completion skipped.');
      return;
    }
    submitted.current = true;
    try {
      const response = await getJSON(`/users/update_video_completion/${videoId}/`, {
        method: 'POST',
        body: JSON.stringify({ isCompleted: true }),
      });
      console.log('[MediaPlayer] Completion update response:', response);
      if (response.status === 200) {
        setConfettiVisible(true);
        setRefresh(true);
        setTimeout(() => {
          setConfettiVisible(false);
          submitted.current = false;
          navigation.navigate('Dashboard');
        }, 3000);
      } else {
        const errorDetails = await response.json();
        console.error('[MediaPlayer] Backend error:', errorDetails);
        Alert.alert('Completion Failed', `Backend error: ${errorDetails?.detail || 'Unknown error'}. Please try again.`);
        submitted.current = false;
      }
    } catch (err) {
      console.error('[MediaPlayer] Completion error:', err);
      Alert.alert('Completion Failed', 'A network error occurred. Please check your connection and try again.');
      submitted.current = false;
    }
  }, [getJSON, videoId, navigation, setRefresh, isCompleted, mediaError, mode]);

  const returnHome = useCallback(async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.pauseAsync();
        await videoRef.current.unloadAsync();
      } catch {}
    }
    const returnScreen = mode === 'dashboard' ? 'Dashboard' : 'AssortedCategories';
    navigation.navigate(returnScreen);
  }, [navigation, mode]);

  // MODIFIED: Retry logic now re-fetches the signed URL with mount checking
  const isMountedRef = useRef(true);
  
  // Set up component unmount tracking
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const handleRetry = useCallback(() => {
    if (!isMountedRef.current) return; // Don't retry if component is unmounted
    
    setIsLoading(true);
    setMediaError(null);
    setSignedUrl(null);
    
    const retryFetch = async () => {
      try {
        console.log(`[MediaPlayer] Retrying signed URL fetch for module ${videoId}`);
        const response = await getJSON(`/users/modules/${videoId}/signed-url/`);
        
        // Check if component is still mounted before updating state
        if (!isMountedRef.current) {
          console.log(`[MediaPlayer] Component unmounted during retry, ignoring response for module ${videoId}`);
          return;
        }
        
        if (response && response.signedUrl) {
          console.log(`[MediaPlayer] Successfully received signed URL for module ${videoId}`);
          setSignedUrl(response.signedUrl);
        } else {
          throw new Error("Invalid response from server when fetching signed URL.");
        }
      } catch (err) {
        if (isMountedRef.current) {
          console.error('[MediaPlayer] Error fetching signed URL:', err);
          setMediaError("Could not load media. Please check your connection and try again.");
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    
    retryFetch();
  }, [videoId, getJSON]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#AA336A', '#FFFFFF']} style={styles.gradient} start={[0, 0]} end={[1, 1]}>
        {/* Top bar */}
        <View style={[styles.top, { marginTop: width > 400 ? 0 : 30 }]}>
          <TouchableOpacity onPress={returnHome} style={styles.button} accessibilityLabel="Go back">
            <Icon name="return-up-back-outline" size={25} color="#AA336A" />
          </TouchableOpacity>
          {mediaError && (
            <TouchableOpacity onPress={handleRetry} style={styles.button} accessibilityLabel="Retry loading media">
              <Icon name="refresh-outline" size={25} color="#AA336A" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.title}>{videoTitle}</Text>

        {/* MODIFIED: Conditional rendering based on loading/error/success states */}
        {mediaError ? (
          <View style={styles.mediaErrorContainer}>
            <Icon name="alert-circle-outline" size={60} color="red" />
            <Text style={styles.mediaErrorText}>{mediaError}</Text>
          </View>
        ) : isLoading ? (
          <View style={styles.mediaLoadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.mediaLoadingText}>Loading Secure Media...</Text>
          </View>
        ) : (
          // The players are only rendered once the signedUrl is successfully fetched
          mediaType === 'video' ? (
            <VideoPlayer
              sourceUrl={signedUrl}
              onFinish={handleComplete}
              onPlaybackError={(error) => setMediaError(`Playback error: ${error}`)}
            />
          ) : (
            <AudioPlayer
              sourceUrl={signedUrl}
              onFinish={handleComplete}
              onPlaybackError={(error) => setMediaError(`Playback error: ${error}`)}
            />
          )
        )}

        <View style={styles.textContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.vidText}>{videoDescription}</Text>
          </ScrollView>
        </View>

        {mode === 'dashboard' && !isCompleted && (
          <TouchableOpacity
            onPress={handleComplete}
            style={styles.button}
            accessibilityLabel="Mark module complete"
            disabled={submitted.current || isLoading || mediaError}
          >
            <Icon name="checkmark-outline" size={25} color="#AA336A" />
          </TouchableOpacity>
        )}

        {confettiVisible && (
          <View style={styles.confettiContainer}>
            <ConfettiCannon count={200} origin={{ x: width / 2, y: height / 2 }} colors={['#AA336A', '#FFFFFF']} fadeOut />
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  title: { fontFamily: 'Cairo', fontSize: 40, fontWeight: 'bold', marginBottom: 10, color: 'white', textAlign: 'center' },
  textContainer: { width: '90%', height: 230, marginTop: 10 },
  vidText: { fontFamily: 'Cairo', textAlign: 'center', color: 'white', fontSize: 19, fontWeight: 'bold' },
  button: { marginHorizontal: 10, padding: 10, backgroundColor: 'white', borderColor: '#AA336A', borderRadius: 100, borderWidth: 2 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '90%' },
  confettiContainer: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
  mediaLoadingContainer: {
    width: '90%',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'white',
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  mediaLoadingText: { marginTop: 10, color: 'white', fontSize: 18, fontFamily: 'Cairo' },
  mediaErrorContainer: {
    width: '90%',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'red',
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  mediaErrorText: { marginTop: 10, color: 'red', fontSize: 18, textAlign: 'center', paddingHorizontal: 10, fontFamily: 'Cairo' },
});

export default MediaPlayer;