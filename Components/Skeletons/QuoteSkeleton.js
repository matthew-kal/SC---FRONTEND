import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const QuoteSkeleton = () => {
    const { width } = Dimensions.get("window");
    return (
        <View style={[styles.quote, { width: width >= 450 ? '60%' : '90%' }]}>
            <ShimmerPlaceHolder LinearGradient={LinearGradient} style={{ width: '90%', height: 18, borderRadius: 5, marginBottom: 8 }} />
            <ShimmerPlaceHolder LinearGradient={LinearGradient} style={{ width: '70%', height: 18, borderRadius: 5 }} />
        </View>
    );
};

const styles = StyleSheet.create({
    quote: { borderRadius: 10, borderWidth: 2, borderColor: '#EAEAEA', backgroundColor: '#F5F5F5', padding: 10, alignItems: 'center', alignSelf: 'center' },
});

export default QuoteSkeleton;