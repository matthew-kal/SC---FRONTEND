import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Logo from '../../Images/Logo.png';
import miniLogo from '../../Images/mini_logo.png';
import { useFetchWithAuth } from '../../Components/FetchWithAuth';

const SubCategory = ({ text, handlePress }) => {
  return (
    <TouchableOpacity style={styles.buttonContainer} onPress={handlePress}>
      <View style={styles.button}>
        <Text style={styles.title}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const AssortedSubcategories = () => {
  const navigation = useNavigation();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const route = useRoute();
  const { categoryName, categoryId } = route.params;
  const scrollViewRef = useRef(null);
  const { width } = Dimensions.get("window");
  const { fetchWithAuth } = useFetchWithAuth();

  useFocusEffect(
    useCallback(() => {
      if (__DEV__) console.log(categoryId);
      fetchSubcategories();
    }, [categoryId])
  );

  const fetchSubcategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth(`/users/${categoryId}/subcategories/`);
      if (res.status === 204) {
        setSubcategories([]);
      } else if (!res.ok) {
        let errMsg = 'Unknown error';
        try {
          const data = await res.json();
          errMsg = data?.error || data?.message || JSON.stringify(data) || 'Unknown error';
        } catch(e) {}
        if (__DEV__) console.error('Fetch error:', errMsg);
        setError(errMsg);
      } else {
        const data = await res.json();
        setSubcategories(
          (data.subcategories || []).map(item => ({
            subcategoryId: item.id,
            name: item.subcategory,
          }))
        );
      }
    } catch (error) {
      if (__DEV__) console.error('Fetch error:', error);
      setError(error.message || 'Unknown error');
    } finally {
      setLoading(false);
      if (__DEV__) console.log(subcategories);
    }
  };

  const handleSubcategoryPress = (subcategoryId, subcategory) => {
    // Don't bother setting loading since navigation will unmount
    navigation.navigate('AssortedModules', { categoryId, subcategoryId, subcategory });
  };

  const handleReturn = () => {
    // Don't bother setting loading since navigation will unmount
    navigation.navigate('AssortedCategories');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#AA336A', '#FFFFFF']} style={styles.gradient} start={[0, 0]} end={[1, 1]}>
          <Image source={Logo} style={styles.logo} />
          <ActivityIndicator size="large" color="white" />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#AA336A', '#FFFFFF']} style={styles.gradient} start={[0, 0]} end={[1, 1]}>
        <View style={[styles.top, {marginTop: width > 450 ? 50 : 75}]}>
          <TouchableOpacity onPress={handleReturn} style={styles.backbutton}>
            <Icon name={"return-up-back-outline"} style={styles.icon} size={27} color="#AA336A" />
          </TouchableOpacity>

        </View>

        <Text style={[styles.header]}>{categoryName}</Text>

        {error ? (
          <Text style={styles.errorMessage}>Error fetching data: {error}</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} ref={scrollViewRef}>
            {subcategories.length > 0 ? (
              subcategories.map((subcategory) => (
                <SubCategory
                  key={subcategory.subcategoryId}
                  text={subcategory.name}
                  handlePress={() => handleSubcategoryPress(subcategory.subcategoryId, subcategory.name)}
                />
              ))
            ) : (
              <Text style={styles.errorMessage}>No subcategories available</Text>
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
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    width: '90%',
  },
  minilogo: {
    width: 60,
    height: 60,
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
    paddingTop: 20,  
  },
  header: {
    fontFamily: 'Cairo',
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  title: {
    fontFamily: 'Cairo',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  backbutton: {
    marginHorizontal: 10,
    padding: 10,
    margin: 5,
    backgroundColor: 'white',
    borderColor: '#AA336A',
    borderRadius: 100,
    borderWidth: 2,
  },
  buttonContainer: {
    width: 270,
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
    alignItems: 'center',
  },
  errorMessage: {
    fontFamily: 'Cairo',
    fontSize: 20,
    color: 'red',
  },
});

export default AssortedSubcategories;