import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions, RefreshControl, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Logo from '../../Images/Logo.png';
import { useFetchWithAuth } from '../../Components/Services/FetchWithAuth';
import AssortedSkeleton from '../../Components/Skeletons/AssortedSkeleton';
import CacheManager from '../../Components/Services/CacheManager';

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
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const onRefresh = useCallback(async () => {
    console.log('[Refresh] User initiated pull-to-refresh.');
    setIsRefreshing(true);
    // Force a cache bust, then fetch fresh data
    await CacheManager.bustAndResetCache();
    await fetchCategories(); // fetchCategories will handle the rest
    setIsRefreshing(false);
  }, [fetchCategories]); 

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    const cacheKey = 'assorted_categories';

    try {
      if (await CacheManager.isCacheStale()) {
        await CacheManager.bustAndResetCache();
      }

      const cachedData = await CacheManager.get(cacheKey);
      if (cachedData) {
        setCategories(cachedData);
      } else {
        const res = await fetchWithAuth('/users/categories/');
        if (!res.ok) throw new Error(await res.text() || 'Failed to fetch categories');
        const data = await res.json();
        const freshData = (data.categories || []).map(item => ({
          id: item.id, name: item.category, icon: item.icon,
        }));
        setCategories(freshData);
        await CacheManager.set(cacheKey, freshData);
      }
    } catch (err) {
      setError(err.message);
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#AA336A', '#FFFFFF']}
        style={styles.gradient}
        start={[0, 0]}
        end={[1, 1]}
      >
        <Text style={[styles.header, {marginTop: width > 450 ? 110 : 75}]}>General Modules</Text>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Category
              text={item.name}
              icon={item.icon}
              handlePress={() => navigation.navigate('AssortedSubcategories', { categoryName: item.name, categoryId: item.id })}
            />
          )}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF" // Spinner color for iOS
            />
          }
          ListHeaderComponent={
            loading && categories.length === 0 ? (
              <>
                <AssortedSkeleton showIcon={true} />
                <AssortedSkeleton showIcon={true} />
                <AssortedSkeleton showIcon={true} />
                <AssortedSkeleton showIcon={true} />
              </>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              error ? (
                <Text style={styles.errorMessage}>Error fetching data: {error}</Text>
              ) : (
                <Text style={styles.errorMessage}>No modules available</Text>
              )
            ) : null
          }
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