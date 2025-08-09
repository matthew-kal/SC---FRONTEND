import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

const PatientDetailsSkeleton = ({ containerStyle }) => {
    return (
        <View style={containerStyle}>
            <ShimmerPlaceHolder LinearGradient={LinearGradient} style={{ width: '80%', height: 20, borderRadius: 4, marginBottom: 10 }} />
            <ShimmerPlaceHolder LinearGradient={LinearGradient} style={{ width: '80%', height: 20, borderRadius: 4, marginBottom: 10 }} />
            <ShimmerPlaceHolder LinearGradient={LinearGradient} style={{ width: '40%', height: 20, borderRadius: 4 }} />
        </View>
    );
};

export default PatientDetailsSkeleton;



