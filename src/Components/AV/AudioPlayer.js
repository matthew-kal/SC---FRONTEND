// In Components/AudioPlayer.js
import React, { useState, useRef, useEffect } from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Audio } from 'expo-audio';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AudioPlayer = ({ sourceUrl, iconColor = 'white', iconSize = 60, onFinish, onPlaybackError }) => {
  const soundRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: sourceUrl },
          { shouldPlay: false },
          (status) => {
            if (!mounted) return;
            setPlaying(status.isPlaying);
            if (status.didJustFinish && onFinish) onFinish();
          }
        );
        if (mounted) soundRef.current = sound;
      } catch (e) {
        if (mounted && onPlaybackError) onPlaybackError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadSound();

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, [sourceUrl, onFinish, onPlaybackError]);

  const togglePlay = async () => {
    if (!soundRef.current) return;
    playing ? await soundRef.current.pauseAsync() : await soundRef.current.playAsync();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={iconColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={togglePlay} accessibilityLabel={playing ? 'Pause audio' : 'Play audio'}>
        <Ionicons name={playing ? 'pause' : 'play'} size={iconSize} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AudioPlayer;
