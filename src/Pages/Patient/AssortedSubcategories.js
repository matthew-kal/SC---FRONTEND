import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFetchWithAuth } from '../../Components/Services/FetchWithAuth';
import AssortedSkeleton from '../../Components/Skeletons/AssortedSkeleton';
import CacheManager from '../../Components/Services/CacheManager';

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
  const { width } = Dimensions.get("window");
  const { fetchWithAuth } = useFetchWithAuth();

  useFocusEffect(
    useCallback(() => {
      fetchSubcategories();
    }, [fetchSubcategories])
  );

  const fetchSubcategories = useCallback(async () => {
    setLoading(true);
    setError('');
    const cacheKey = `assorted_subcategories_${categoryId}`;

    try {
      if (await CacheManager.isCacheStale()) {
        await CacheManager.bustAndResetCache();
      }

      const cachedData = await CacheManager.get(cacheKey);
      if (cachedData) {
        setSubcategories(cachedData);
      } else {
        const res = await fetchWithAuth(`/users/${categoryId}/subcategories/`);
        if (!res.ok) throw new Error(await res.text() || 'Failed to fetch subcategories');
        const data = await res.json();
        const freshData = (data.subcategories || []).map(item => ({
          subcategoryId: item.id, name: item.subcategory,
        }));
        setSubcategories(freshData);
        await CacheManager.set(cacheKey, freshData);
      }
    } catch (err) {
      setError(err.message);
      console.error('Fetch subcategories error:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, fetchWithAuth]);

  const handleSubcategoryPress = (subcategoryId, subcategory) => {
    // Don't bother setting loading since navigation will unmount
    navigation.navigate('AssortedModules', { categoryId, subcategoryId, subcategory });
  };

  const handleReturn = () => {
    // Don't bother setting loading since navigation will unmount
    navigation.navigate('AssortedCategories');
  };



  return (
    <View style={styles.container}>
      <LinearGradient colors={['#AA336A', '#FFFFFF']} style={styles.gradient} start={[0, 0]} end={[1, 1]}>
        <View style={[styles.top, {marginTop: width > 450 ? 50 : 75}]}>
          <TouchableOpacity onPress={handleReturn} style={styles.backbutton}>
            <Icon name={"return-up-back-outline"} style={styles.icon} size={27} color="#AA336A" />
          </TouchableOpacity>

        </View>

        <Text style={[styles.header]}>{categoryName}</Text>

        <FlatList
          data={subcategories}
          keyExtractor={(item) => item.subcategoryId.toString()}
          renderItem={({ item }) => (
            <SubCategory
              text={item.name}
              handlePress={() => handleSubcategoryPress(item.subcategoryId, item.name)}
            />
          )}
          contentContainerStyle={styles.scroll}
          ListHeaderComponent={
            loading && (
              <>
                <AssortedSkeleton />
                <AssortedSkeleton />
                <AssortedSkeleton />
                <AssortedSkeleton />
              </>
            )
          }
          ListEmptyComponent={
            !loading ? (
              error ? (
                <Text style={styles.errorMessage}>Error fetching data: {error}</Text>
              ) : (
                <Text style={styles.errorMessage}>No subcategories available</Text>
              )
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
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