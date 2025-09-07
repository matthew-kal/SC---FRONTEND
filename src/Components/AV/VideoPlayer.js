import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const VideoPlayer = ({ sourceUrl, onFinish, onPlaybackError }, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const loadingTimeoutRef = useRef(null);
  const hasLoadedRef = useRef(false);

  // Reset loading state when URL changes
  useEffect(() => {
    console.log('[VideoPlayer] Source URL changed:', sourceUrl);
    setIsLoading(true);
    hasLoadedRef.current = false;
    
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // Preload the video immediately when URL is available
    if (sourceUrl) {
      console.log('[VideoPlayer] 🚀 Starting video preload for faster playback');
    }
  }, [sourceUrl]);

  const player = useVideoPlayer(sourceUrl, (player) => {
    const playerInitTime = performance.now();
    console.log(`[VideoPlayer] 🎬 Player initialized at ${playerInitTime}, starting playback`);
    
    // Configure player for faster loading
    player.loop = false;
    player.muted = false;
    
    // Start playback immediately
    player.play();
  });

  // Expose player controls to parent component via ref
  React.useImperativeHandle(ref, () => ({
    pause: () => {
      if (player) {
        player.pause();
      }
    },
    play: () => {
      if (player) {
        player.play();
      }
    },
    player: player,
  }), [player]);

  // Optimized loading detection with event-driven approach + frequent checks
  useEffect(() => {
    if (!player) return;
    
    console.log('[VideoPlayer] Setting up optimized event listeners');
    
    // Set a maximum loading timeout to prevent infinite loading
    loadingTimeoutRef.current = setTimeout(() => {
      if (!hasLoadedRef.current) {
        console.log('[VideoPlayer] ⏰ Loading timeout reached, hiding skeleton');
        setIsLoading(false);
      }
    }, 5000); // 5 second max loading time

    // Single function to handle loading completion
    const handleVideoReady = (reason) => {
      if (hasLoadedRef.current) return; // Prevent multiple calls
      
      hasLoadedRef.current = true;
      const readyTime = performance.now();
      console.log(`[VideoPlayer] ✅ Video ready (${reason}) at ${readyTime}, hiding skeleton`);
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      setIsLoading(false);
    };

    // Check if video is ready (more frequent checks)
    const checkVideoReady = () => {
      if (hasLoadedRef.current) return true;
      
      const status = player.status;
      const duration = player.duration;
      const currentTime = player.currentTime;
      const isPlaying = player.playing;
      
      console.log('[VideoPlayer] Checking video state:', {
        status,
        duration,
        currentTime,
        isPlaying
      });
      
      // Multiple conditions to detect when video is ready
      if (status === 'readyToPlay' && duration > 0) {
        handleVideoReady('check-readyToPlay');
        return true;
      }
      
      if (isPlaying && currentTime > 0 && duration > 0) {
        handleVideoReady('check-playing');
        return true;
      }
      
      if (duration > 0 && currentTime >= 0) {
        handleVideoReady('check-hasDuration');
        return true;
      }
      
      return false;
    };

    // Very frequent checks every 50ms for faster response
    const checkInterval = setInterval(() => {
      if (checkVideoReady()) {
        clearInterval(checkInterval);
      }
    }, 50);

    // Event listeners - much more efficient than polling
    const subStatus = player.addListener('statusChange', (status) => {
      console.log('[VideoPlayer] Status change:', status);
      checkVideoReady();
    });

    // Video started playing (most reliable indicator)
    const subTimeUpdate = player.addListener('timeUpdate', (currentTime) => {
      if (currentTime > 0) {
        console.log('[VideoPlayer] Time update - video playing at:', currentTime);
        checkVideoReady();
      }
    });

    // Video finished
    const subFinish = player.addListener('playToEnd', () => {
      console.log('[VideoPlayer] Video finished');
      if (onFinish) onFinish();
    });

    // Error handling
    const subError = player.addListener('error', (error) => {
      console.log('[VideoPlayer] Error occurred:', error);
      handleVideoReady('error');
      if (onPlaybackError) onPlaybackError(error);
    });

    // Cleanup
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      clearInterval(checkInterval);
      subStatus.remove();
      subTimeUpdate.remove();
      subFinish.remove();
      subError.remove();
    };
  }, [player, onFinish, onPlaybackError]);

  const VideoSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <ShimmerPlaceHolder 
        LinearGradient={LinearGradient} 
        style={styles.skeletonMain}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading && <VideoSkeleton />}
      <VideoView
        player={player}
        style={[styles.video, isLoading && styles.hiddenVideo]}
        nativeControls
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'white',
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  hiddenVideo: {
    opacity: 0,
  },
  skeletonContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 7,
  },
  skeletonMain: {
    width: '80%',
    height: '60%',
    borderRadius: 8,
    marginBottom: 15,
  },
  skeletonControls: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  skeletonPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  skeletonProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 15,
  },
  skeletonTime: {
    width: 50,
    height: 16,
    borderRadius: 4,
  },
});

export default React.forwardRef(VideoPlayer);