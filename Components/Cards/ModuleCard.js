import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ModuleCard = ({ item, onPress, isTask = false }) => {
  const isCompleted = item.isCompleted;
  const iconName = isCompleted ? 'checkmark-circle-outline' : (item.icon || 'videocam-outline');
  const iconColor = isCompleted ? '#4CAF50' : '#D9534F';
  const containerStyle = isCompleted ? styles.innerSuccess : styles.innerError;

  return (
    <TouchableOpacity onPress={onPress} style={[styles.inner, containerStyle]} disabled={isTask && isCompleted}>
      <Text style={styles.moduleTitle}>{item.name || item.title}</Text>
      {isTask && <Text style={styles.moduleDesc}>{item.description}</Text>}
      <View style={styles.icons}>
        <Icon name={iconName} size={30} color={iconColor} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    moduleTitle: { fontWeight: '400', fontFamily: 'Cairo', fontSize: 19 },
    moduleDesc: { fontWeight: '400', fontFamily: 'Cairo', fontStyle: 'italic', fontSize: 17, marginBottom: 5 },
    inner: { width: 180, height: 120, flexDirection: 'column', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#AA336A', margin: 5 },
    icons: { flexDirection: 'row' },
    innerSuccess: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
    innerError: { backgroundColor: '#FDECEA', borderColor: '#D9534F' },
});

export default ModuleCard;