import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Logo from '../../Images/Logo.png';
import {getSecureItem, saveSecureItem} from "../../Components/Memory"

const Category = ({ text, handlePress, icon }) => (
  <TouchableOpacity style={styles.buttonContainer} onPress={handlePress}>
    <View style={styles.button}>
      <Text style={styles.title}>{text}</Text>
      <Icon name={icon} style={{ marginTop: 10 }} size={25} color="#AA336A" />
    </View>
  </TouchableOpacity>
);

const AssortedCategories = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const {width, _ } = Dimensions.get("window") 

  {/*  OLD SYSTEM, CHANGE IF NEEDED
  useEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );
  */}

useEffect(() => {
  fetchCategories();
}, [])

  const fetchCategories = async () => {
    try {
      let token = await getSecureItem('accessPatient');
      if (!token) throw new Error('No access token found');

      let response = await fetch('http://127.0.0.1:8000/users/categories/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        const refreshToken = await getSecureItem('refreshPatient');
        if (!refreshToken) throw new Error('No refresh token found');

        const refreshResponse = await fetch('http://127.0.0.1:8000/users/token/refresh/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!refreshResponse.ok) throw new Error('Failed to refresh token');

        const refreshData = await refreshResponse.json();
        await saveSecureItem('accessPatient', refreshData.access);
        token = refreshData.access;

        response = await fetch('http://127.0.0.1:8000/users/categories/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setCategories(data.categories.map(item => ({ id: item.id, name: item.category, icon: item.icon })));
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
      <LinearGradient
      colors={['#AA336A', '#FFFFFF']}
      style={styles.gradient}
      start={[0, 0]}
      end={[1, 1]}
      >
      <Image source={Logo} style={styles.logo} />
      <ActivityIndicator size="large" color="white" />
      </LinearGradient>
    </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#AA336A', '#FFFFFF']}
        style={styles.gradient}
        start={[0, 0]}
        end={[1, 1]}
      >
        <Text style={[styles.header, {marginTop: width > 450 ? 110 : 75}]}>General Modules</Text>
        {loading ? (
          <Text style={styles.errorMessage}>Loading...</Text>
        ) : error ? (
          <Text style={styles.errorMessage}>Error fetching data </Text>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} >
            {categories.length > 0 ? (
              categories.map((category) => (
                <Category
                  key={category.id}
                  text={category.name}
                  icon={category.icon}
                  handlePress={() => navigation.navigate('AssortedSubcategories', { categoryName: category.name, categoryId: category.id })}
                />
              ))
            ) : (
              <Text style={styles.errorMessage}>No modules available</Text>
            )}
          </ScrollView>
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
  logo: {
    marginTop: 80,
    marginBottom: 20,
    width: 275,
    height: 65,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  scroll: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  header: {
    fontFamily: 'Cairo',
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Cairo',
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '70%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  button: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorMessage: {
    fontFamily: 'Cairo',
    fontSize: 20,
    color: 'red',
  },
});

export default AssortedCategories;