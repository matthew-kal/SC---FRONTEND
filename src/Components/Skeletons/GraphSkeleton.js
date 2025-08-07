import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const GraphSkeleton = () => {
    const { width } = Dimensions.get("window");
    return (
        <View style={[styles.graph, { width: width >= 450 ? '60%' : '90%' }]}>
            <ShimmerPlaceHolder LinearGradient={LinearGradient} style={{ width: '100%', height: 200, borderRadius: 10 }} />
        </View>
    );
};

const styles = StyleSheet.create({
    graph: { borderRadius: 10, backgroundColor: '#F5F5F5', alignItems: 'center', alignSelf: 'center', marginVertical: 5 },
});

export default GraphSkeleton;