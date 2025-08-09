import React, { useState, useCallback, useContext, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFetchWithAuth } from '../../Components/Services/FetchWithAuth';
import { PatientContext } from '../../Components/Services/PatientContext';
import AudioPlayer from '../../Components/AV/AudioPlayer';
import VideoPlayer from '../../Components/AV/VideoPlayer';

const MediaPlayer = ({ route, navigation }) => {
  const {
    videoUrl, videoTitle, videoDescription, mediaType,
    mode, // 'dashboard' or 'library'
    videoId,
    isCompleted,
  } = route.params;

  const { width, height } = Dimensions.get('window');
  const videoRef = useRef(null);
  const submitted = useRef(false);
  const [confettiVisible, setConfettiVisible] = useState(false);

  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState(null);

  const { refresh, setRefresh } = useContext(PatientContext);
  const { getJSON } = useFetchWithAuth();

  const validateMediaUrl = useCallback(async () => {
    setMediaError(null);
    setMediaLoading(true);
    if (!videoUrl || !videoUrl.startsWith('http')) {
      setMediaError('A valid media URL was not provided.');
      setMediaLoading(false);
      return;
    }
    try {
      console.log(`[MediaPlayer] Validating URL: ${videoUrl}`);
      const response = await fetch(videoUrl, { method: 'HEAD' });
      if (response.ok) {
        setMediaError(null);
        setMediaLoading(false);
      } else {
        setMediaError('This media could not be found. It may have been moved or deleted.');
        setMediaLoading(false);
      }
    } catch (error) {
      console.error('[MediaPlayer] Network error validating URL:', error);
      setMediaError('A network error occurred. Please check your connection and try again.');
      setMediaLoading(false);
    }
  }, [videoUrl]);

  useEffect(() => {
    validateMediaUrl();
  }, [validateMediaUrl]);

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

  const handleRetry = useCallback(() => {
    validateMediaUrl();
  }, [validateMediaUrl]);

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
            onFinish={handleComplete}
            onPlaybackError={setMediaError}
          />
        ) : (
          <AudioPlayer
            sourceUrl={videoUrl}
            onFinish={handleComplete}
            onPlaybackError={setMediaError}
          />
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
            disabled={submitted.current || mediaLoading || mediaError}
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

export default MediaPlaye;


