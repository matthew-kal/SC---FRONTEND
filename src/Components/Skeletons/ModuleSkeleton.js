import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

const ModuleSkeleton = () => (
    <View style={styles.inner}>
        <ShimmerPlaceHolder LinearGradient={LinearGradient} style={{ width: '80%', height: 20, borderRadius: 5, marginBottom: 10 }} />
        <ShimmerPlaceHolder LinearGradient={LinearGradient} style={{ width: '60%', height: 16, borderRadius: 5 }} />
    </View>
);

const styles = StyleSheet.create({
    inner: { width: 180, height: 120, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#EAEAEA', backgroundColor: '#F5F5F5', margin: 5 },
});

export default ModuleSkeleton;