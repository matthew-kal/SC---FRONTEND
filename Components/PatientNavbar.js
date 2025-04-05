import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';


const PatientNavbar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const handleNavigation = (screen) => {
    if (route.name !== screen) {
      navigation.navigate(screen);
    }
  };

  


  return (
    <View style={styles.navbar}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleNavigation('Dashboard')}
      >
         <Icon name="home-outline" style={{marginBottom: 10}} size={25} color="#AA336A" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleNavigation('AssortedCategories')}
      >
         <Icon name="play-outline" style={{marginBottom: 10}} size={25} color="#AA336A" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleNavigation('PatientSettings')}
      >
        <Icon name="settings-outline" style={{marginBottom: 10}} size={25} color="#AA336A" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 3,
    borderColor: '#AA336A',
    height: 80,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PatientNavbar;