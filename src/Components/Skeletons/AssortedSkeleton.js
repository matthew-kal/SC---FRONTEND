import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const AssortedSkeleton = ({ showIcon = false, delay = 0, fadeOut = false }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (fadeOut) {
      // Fade out when content is ready
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, delay);
      
      return () => clearTimeout(timer);
    } else {
      // Fade in when appearing
      fadeAnim.setValue(0);
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [fadeOut, delay, fadeAnim]);

  return (
    <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
      <View style={styles.button}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.textPlaceholder}
        />
        {showIcon && (
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={styles.iconPlaceholder}
          />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: 270, // Matches AssortedModules and AssortedSubcategories
    alignSelf: 'center',
    marginBottom: 10,
  },
  button: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#EAEAEA', 
    backgroundColor: '#F5F5F5', 
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textPlaceholder: {
    width: '70%',
    height: 24,
    borderRadius: 4,
  },
  iconPlaceholder: {
    width: 25,
    height: 25,
    borderRadius: 4,
  },
});

export default AssortedSkeleton;