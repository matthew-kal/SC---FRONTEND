import React, { useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Video } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import AudioPlayer from '../../Components/AudioPlayer';          // ← NEW

const AssortedPlayer = ({ route, navigation }) => {
  const { videoUrl, videoTitle, videoDescription, mediaType } = route.params;
  const videoRef = useRef(null);

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

          {mediaType === 'video' ? (
            <Video
              ref={videoRef}
              source={{ uri: videoUrl }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              shouldPlay
              onError={() =>
                Alert.alert('Video Error', 'Unable to load this video. Please try again later.')
              }
            />
          ) : (
            <AudioPlayer
              sourceUrl={videoUrl}
              iconColor="white"
              iconSize={60}
            />
          )}

          <View style={styles.textContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.vidText}>{videoDescription}</Text>
            </ScrollView>
          </View>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
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
});

export default AssortedPlayer;