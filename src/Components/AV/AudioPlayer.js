// In Components/AudioPlayer.js
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, View, Text, Animated } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const AudioPlayer = React.forwardRef(({ sourceUrl, iconColor = 'white', iconSize = 60, onFinish, onPlaybackError }, ref) => {
  const [loading, setLoading] = useState(true);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [waveAnim] = useState(new Animated.Value(0));
  
  // Use expo-audio's useAudioPlayer hook
  const player = useAudioPlayer(sourceUrl ? { uri: sourceUrl } : null);
  const status = useAudioPlayerStatus(player);

  // Expose pause function to parent component via ref
  React.useImperativeHandle(ref, () => ({
    pause: () => {
      if (player && status.playing) {
        try {
          player.pause();
        } catch (error) {
          console.warn('Error pausing audio:', error);
        }
      }
    },
    play: () => {
      if (player && !status.playing) {
        try {
          player.play();
        } catch (error) {
          console.warn('Error playing audio:', error);
        }
      }
    },
    player: player,
  }), [player, status.playing]);

  useEffect(() => {
    if (!sourceUrl) {
      setLoading(false);
      return;
    }

    // Set loading to false once we have a player
    if (player) {
      setLoading(false);
    }
  }, [sourceUrl, player]);

  useEffect(() => {
    // Handle playback completion
    if (status.didJustFinish && onFinish) {
      onFinish();
    }
  }, [status.didJustFinish, onFinish]);

  useEffect(() => {
    // Animate pulse when playing
    if (status.playing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave animation
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }
  }, [status.playing, pulseAnim, waveAnim]);

  const togglePlay = () => {
    if (!player) return;
    
    try {
      if (status.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch (error) {
      if (onPlaybackError) {
        onPlaybackError(error.message);
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#AA336A', '#FFFFFF']} style={styles.loadingGradient}>
          <ActivityIndicator size="large" color={iconColor} />
          <Text style={styles.loadingText}>Loading audio...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#AA336A', '#FFFFFF']} style={styles.playerGradient}>
        {/* Animated wave background */}
        {status.playing && (
          <Animated.View style={[
            styles.waveBackground,
            {
              opacity: waveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.7],
              }),
              transform: [{
                scale: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.5],
                })
              }]
            }
          ]} />
        )}

        {/* Main play button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity 
            style={[styles.playButton, status.playing && styles.playButtonActive]}
            onPress={togglePlay} 
            accessibilityLabel={status.playing ? 'Pause audio' : 'Play audio'}
          >
            <Ionicons 
              name={status.playing ? 'pause' : 'play'} 
              size={iconSize} 
              color={iconColor} 
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Audio progress and time */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((status.currentTime || 0) / (status.duration || 1)) * 100}%` }
              ]} 
            />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(status.currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(status.duration)}</Text>
          </View>
        </View>

        {/* Status indicators */}
        <View style={styles.statusContainer}>
          {status.isBuffering && (
            <View style={styles.statusItem}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.statusText}>Buffering...</Text>
            </View>
          )}
          {status.playing && (
            <View style={styles.statusItem}>
              <Ionicons name="musical-notes" size={16} color="white" />
              <Text style={styles.statusText}>Playing</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    color: 'white',
    fontSize: 16,
    fontFamily: 'Cairo',
    fontWeight: 'bold',
  },
  playerGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'white',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  waveBackground: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: '50%',
    left: '50%',
    marginTop: -50,
    marginLeft: -50,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#AA336A',
  },
  playButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  progressContainer: {
    width: '100%',
    marginTop: 15,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Cairo',
    fontWeight: 'bold',
  },
  statusContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Cairo',
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;
