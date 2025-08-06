// In Components/VideoPlayer.js
import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Video } from 'expo-video';
import Icon from 'react-native-vector-icons/Ionicons';

const VideoPlayer = ({ sourceUrl, onFinish, onPlaybackError }) => {
  const videoRef = React.useRef(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleStatusUpdate = (status) => {
    if (status.isLoaded && isLoading) {
      setIsLoading(false);
    }
    if (status.didJustFinish && onFinish) {
      onFinish();
    }
    if (status.error) {
      onPlaybackError(status.error);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={StyleSheet.absoluteFill}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
      <Video
        ref={videoRef}
        source={{ uri: sourceUrl }}
        style={styles.video}
        useNativeControls
        resizeMode="contain"
        shouldPlay
        onPlaybackStatusUpdate={handleStatusUpdate}
        onError={(err) => onPlaybackError(err.error)}
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
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

export default VideoPlayer;