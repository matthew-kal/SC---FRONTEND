import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const AssortedSkeleton = ({ showIcon = false }) => (
  <View style={styles.buttonContainer}>
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
  </View>
);

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