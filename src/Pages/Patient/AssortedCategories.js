import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions, RefreshControl, FlatList, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useFetchWithAuth } from '../../Components/Services/FetchWithAuth';
import AssortedSkeleton from '../../Components/Skeletons/AssortedSkeleton';
import CacheManager from '../../Components/Services/CacheManager';

const Category = ({ text, handlePress, icon, animatedValue, delay = 0 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [animatedValue, delay]);

  return (
    <Animated.View 
      style={[
        styles.buttonContainer,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={handlePress}>
        <View style={styles.button}>
          <Text style={styles.title}>{text}</Text>
          <Icon name={icon} style={{ marginTop: 10 }} size={25} color="#AA336A" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AssortedCategories = () => {
  const navigation = useNavigation();
  const { fetchWithAuth } = useFetchWithAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {width} = Dimensions.get("window") 
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Animation refs for each category item
  const animatedValues = useRef([]);
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // Use useFocusEffect to ensure clean state transitions
  useFocusEffect(
    useCallback(() => {
      // Reset loading state when screen comes into focus
      setLoading(true);
      setError(null);
      setIsRefreshing(false);
      
      // Reset all animations
      headerOpacity.setValue(0);
      animatedValues.current = [];
      
      // Animate header in
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
      
      // Fetch categories data
      fetchCategories();
      
      // Cleanup function: clear state when leaving the screen
      return () => {
        console.log('[AssortedCategories] Screen losing focus, clearing state for clean transitions');
        setCategories([]);
        setLoading(true);
        setError(null);
        setIsRefreshing(false);
        
        // Reset animations for next visit
        headerOpacity.setValue(0);
        animatedValues.current.forEach(animValue => animValue.setValue(0));
      };
    }, [fetchCategories, headerOpacity])
  );

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
        // Initialize animations for cached data
        initializeAnimations(cachedData.length);
      } else {
        const res = await fetchWithAuth('/users/categories/');
        if (!res.ok) throw new Error(await res.text() || 'Failed to fetch categories');
        const data = await res.json();
        const freshData = (data.categories || []).map(item => ({
          id: item.id, name: item.category, icon: item.icon,
        }));
        setCategories(freshData);
        await CacheManager.set(cacheKey, freshData);
        // Initialize animations for fresh data
        initializeAnimations(freshData.length);
      }
    } catch (err) {
      setError(err.message);
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  // Initialize animation values for each category
  const initializeAnimations = useCallback((count) => {
    animatedValues.current = Array(count).fill(0).map(() => new Animated.Value(0));
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#AA336A', '#FFFFFF']}
        style={styles.gradient}
        start={[0, 0]}
        end={[1, 1]}
      >
        <Animated.Text 
          style={[
            styles.header, 
            {
              marginTop: width > 450 ? 110 : 75,
              opacity: headerOpacity,
              transform: [
                {
                  translateY: headerOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            }
          ]}
        >
          General Modules
        </Animated.Text>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <Category
              text={item.name}
              icon={item.icon}
              animatedValue={animatedValues.current[index] || new Animated.Value(0)}
              delay={index * 100} // Stagger animations by 100ms
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
                <AssortedSkeleton showIcon={true} delay={0} />
                <AssortedSkeleton showIcon={true} delay={100} />
                <AssortedSkeleton showIcon={true} delay={200} />
                <AssortedSkeleton showIcon={true} delay={300} />
                <AssortedSkeleton showIcon={true} delay={400} />
                <AssortedSkeleton showIcon={true} delay={500} />  
                <AssortedSkeleton showIcon={true} delay={600} />
                <AssortedSkeleton showIcon={true} delay={700} />
                <AssortedSkeleton showIcon={true} delay={800} />
                <AssortedSkeleton showIcon={true} delay={900} />
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