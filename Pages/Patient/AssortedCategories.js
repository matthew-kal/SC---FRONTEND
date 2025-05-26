import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Logo from '../../Images/Logo.png';
import { useFetchWithAuth } from '../../Components/FetchWithAuth';

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
  const { fetchWithAuth } = useFetchWithAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {width} = Dimensions.get("window") 

useEffect(() => {
  fetchCategories();
}, [])

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth('/users/categories/', { method: 'GET' });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setCategories(
        data.categories.map(item => ({
          id: item.id,
          name: item.category,
          icon: item.icon,
        }))
      );
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message || 'Unknown error occurred');
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
          <Text style={styles.errorMessage}>Error fetching data: {error}</Text>
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