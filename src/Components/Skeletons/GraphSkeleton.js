import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const GraphSkeleton = ({ containerStyle }) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <ShimmerPlaceHolder LinearGradient={LinearGradient} style={styles.shimmer} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    shimmer: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
});

export default GraphSkeleton;