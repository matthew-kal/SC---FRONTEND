import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import Icon from 'react-native-vector-icons/Ionicons';

const AssortedPlayer = ({ route, navigation }) => {
  const { videoUrl, videoTitle, videoDescription } = route.params;
  const [confettiVisible, setConfettiVisible] = useState(false);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#AA336A', '#FFFFFF']}
        style={styles.gradient}
        start={[0, 0]}
        end={[1, 1]}
      >
        <Text style={styles.title}>{videoTitle}</Text>

        <Video
          source={{ uri: videoUrl }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
          shouldPlay
        />

        <View style={styles.textContainer}> 
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.vidText}>
            {videoDescription}
            </Text>
          </ScrollView>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('AssortedCategories')} style={styles.button}>
          <Icon name={"checkmark-outline"} style={styles.icon} size={25} color="#AA336A" />
        </TouchableOpacity>

        {confettiVisible && (
          <View style={styles.confettiContainer}>
            <ConfettiCannon
              count={200}
              origin={{ x: 0, y: 0 }}
              colors={['#AA336A', '#FFFFFF']}
              fadeOut
            />
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '80%',
    height: '30%',
    borderColor: 'white',
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 10,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  title: {
    fontFamily: 'Cairo',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    textAlign: 'center',
  },
  textContainer: {
    width: '90%', 
    height: 230,
    marginTop: 10,
  },
  vidText: {
    fontFamily: 'Cairo',
    textAlign: 'center',
    color: 'white',
    fontSize: 19,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    marginTop: 30,
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: 'white',
    borderColor: '#AA336A',
    borderRadius: 100,
    borderWidth: 2,
  },
  buttonText: {
    color: '#AA336A',
    fontWeight: 'bold',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});

export default AssortedPlayer;