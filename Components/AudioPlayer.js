// components/AudioPlayer.js
import React, { useState, useRef, useEffect } from 'react';
import { TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Audio } from 'expo-audio';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * AudioPlayer
 * @param {string}  sourceUrl   – full URL of the audio file
 * @param {string}  iconColor   – optional; defaults to white
 * @param {number}  iconSize    – optional; defaults to 60
 * @param {func}    onFinish    – optional callback when playback finishes
 */
const AudioPlayer = ({ sourceUrl, iconColor = 'white', iconSize = 60, onFinish }) => {
  const soundRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  // Load once on mount
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: sourceUrl },
          { shouldPlay: false },
          (status) => {
            if (!mounted) return;

            // Update play/pause state
            setPlaying(status.isPlaying);

            // Fire callback when done
            if (status.didJustFinish && onFinish) onFinish();
          }
        );
        soundRef.current = sound;
      } catch (e) {
        Alert.alert('Audio Error', 'Unable to load this audio file.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Cleanup on unmount
    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, [sourceUrl, onFinish]);

  const togglePlay = async () => {
    if (!soundRef.current) return;
    playing ? await soundRef.current.pauseAsync() : await soundRef.current.playAsync();
  };

  if (loading) {
    return <ActivityIndicator size="large" color={iconColor} />;
  }

  return (
    <TouchableOpacity onPress={togglePlay} style={styles.button} accessibilityLabel={playing ? 'Pause audio' : 'Play audio'}>
      <Ionicons name={playing ? 'pause' : 'play'} size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
  },
});

export default AudioPlayer;