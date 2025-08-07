import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import AudioPlayer from '../../Components/AV/AudioPlayer';
import VideoPlayer from '../../Components/AV/VideoPlayer';

const AssortedPlayer = ({ route, navigation }) => {
  const { videoUrl, videoTitle, videoDescription, mediaType } = route.params;
  const videoRef = useRef(null);

  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState(null);

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

  /* ------------------- NAVIGATION ------------------- */
  const returnHome = useCallback(async () => {
    if (videoRef.current) {
      console.log("[AssortedPlayer] Pausing and unloading video before navigating home.");
      await videoRef.current.pauseAsync();
      await videoRef.current.unloadAsync();
    }
    console.log("[AssortedPlayer] Navigating to Dashboard.");
    navigation.navigate('AssortedCategories') // AssortedPlayer uses goBack, not 
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#AA336A', '#FFFFFF']}
          style={styles.gradient}
          start={[0, 0]}
          end={[1, 1]}
        >
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
              onPlaybackError={setMediaError}
            />
          ) : (
            <AudioPlayer
              sourceUrl={videoUrl}
              onPlaybackError={setMediaError}
            />
          )}

          <View style={styles.textContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.vidText}>{videoDescription}</Text>
            </ScrollView>
          </View>

          <TouchableOpacity
            onPress={returnHome} 
            style={styles.button}
            accessibilityLabel="Return to categories"
          >
            <Icon name="checkmark-outline" size={25} color="#AA336A" />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#AA336A' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  video: { width: '80%', height: '30%', borderColor: 'white', borderWidth: 3, borderRadius: 10, marginBottom: 10 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' },
  title: { fontFamily: 'Cairo', fontSize: 40, fontWeight: 'bold', marginBottom: 10, color: 'white', textAlign: 'center' },
  textContainer: { width: '90%', height: 230, marginTop: 10 },
  vidText: { fontFamily: 'Cairo', textAlign: 'center', color: 'white', fontSize: 19, fontWeight: 'bold' },
  button: { marginTop: 30, padding: 10, backgroundColor: 'white', borderColor: '#AA336A', borderRadius: 100, borderWidth: 2 },
  // New styles for media loading/error containers (shared with DashPlayer if possible, but defined here for completeness)
  mediaLoadingContainer: {
    width: '80%', // Adjusted width for AssortedPlayer's video style
    height: '30%', // Adjusted height for AssortedPlayer's video style
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'white',
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  mediaLoadingText: {
    marginTop: 10,
    color: 'white',
    fontSize: 18,
    fontFamily: 'Cairo',
  },
  mediaErrorContainer: {
    width: '80%', // Adjusted width for AssortedPlayer's video style
    height: '30%', // Adjusted height for AssortedPlayer's video style
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'red',
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
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

export default AssortedPlayer;