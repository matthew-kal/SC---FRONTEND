import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFetchWithAuth } from '../../Components/Services/FetchWithAuth';
import CacheManager from '../../Components/Services/CacheManager';
import AssortedSkeleton from '../../Components/Skeletons/AssortedSkeleton';

const Module = ({ title, handlePress, animatedValue, delay = 0 }) => {
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
          <Text style={styles.title}>{title}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AssortedModules = () => {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const route = useRoute();
  const { categoryId, subcategoryId, subcategory } = route.params;
  const {width} = Dimensions.get("window") 
  const { fetchWithAuth } = useFetchWithAuth();
  
  // Animation refs
  const animatedValues = useRef([]);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const backButtonOpacity = useRef(new Animated.Value(0)).current;

  // Use useFocusEffect to ensure clean state transitions
  useFocusEffect(
    useCallback(() => {
      // Reset loading state when screen comes into focus
      setLoading(true);
      setError('');
      
      // Reset all animations
      headerOpacity.setValue(0);
      backButtonOpacity.setValue(0);
      animatedValues.current = [];
      
      // Animate header and back button in
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(backButtonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Fetch modules data
      fetchModules();
      
      // Cleanup function: clear state when leaving the screen
      return () => {
        console.log('[AssortedModules] Screen losing focus, clearing state for clean transitions');
        setVideos([]);
        setLoading(true);
        setError('');
        
        // Reset animations for next visit
        headerOpacity.setValue(0);
        backButtonOpacity.setValue(0);
        animatedValues.current.forEach(animValue => animValue.setValue(0));
      };
    }, [fetchModules, categoryId, subcategoryId, headerOpacity, backButtonOpacity])
  );

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError('');
    const cacheKey = `assorted_modules_${categoryId}_${subcategoryId}`;

    try {
      if (await CacheManager.isCacheStale()) {
        await CacheManager.bustAndResetCache();
      }

      const cachedData = await CacheManager.get(cacheKey);
      if (cachedData) {
        setVideos(cachedData);
        // Initialize animations for cached data
        initializeAnimations(cachedData.length);
      } else {
        const res = await fetchWithAuth(`/users/${categoryId}/${subcategoryId}/modules-list/`);
        if (!res.ok) throw new Error(await res.text() || 'Failed to fetch modules');
        const data = await res.json();
        const freshData = (data.videos || []).map(video => ({
          id: video.id ?? video.url, title: video.title, url: video.url,
          description: video.description, media_type: video.media_type
        }));
        setVideos(freshData);
        await CacheManager.set(cacheKey, freshData);
        // Initialize animations for fresh data
        initializeAnimations(freshData.length);
      }
    } catch (err) {
      setError(err.message);
      console.error('Fetch modules error:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, subcategoryId, fetchWithAuth]);

  // Initialize animation values for each module
  const initializeAnimations = useCallback((count) => {
    animatedValues.current = Array(count).fill(0).map(() => new Animated.Value(0));
  }, []);

  const handleNavigate = (videoId, videoTitle, videoDescription, mediaType) => {
    navigation.navigate('MediaPlayer', { mode: 'library', videoId, videoTitle, videoDescription, mediaType });
  };

  const handleReturn = () => {
    navigation.navigate('AssortedCategories');
  };



  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#AA336A', '#FFFFFF']}
        style={styles.gradient}
        start={[0, 0]}
        end={[1, 1]}
      >

        <View style={[styles.top, {marginTop: width > 450 ? 50 : 75}]}>
        <TouchableOpacity onPress={handleReturn} style={styles.backbutton}>
          <Icon name={"return-up-back-outline"} style={styles.icon} size={27} color="#AA336A" />
        </TouchableOpacity>
        </View>

        <Text style={styles.header}>{subcategory}</Text>

        {error ? (
          <Text style={styles.errorMessage}>Error fetching videos: {error}</Text>
        ) : (
          <FlatList
            data={videos}
            keyExtractor={(item) => (item.id || item.url).toString()}
            renderItem={({ item, index }) => (
              <Module
                title={item.title}
                animatedValue={animatedValues.current[index] || new Animated.Value(0)}
                delay={index * 100} // Stagger animations by 100ms
                handlePress={() => handleNavigate(item.id, item.title, item.description, item.media_type)}
              />
            )}
            contentContainerStyle={styles.scroll}
            ListHeaderComponent={
              loading ? (
                <>
                  <AssortedSkeleton delay={0} />
                  <AssortedSkeleton delay={100} />
                  <AssortedSkeleton delay={200} />
                  <AssortedSkeleton delay={300} />
                </>
              ) : null
            }
            ListEmptyComponent={
              !loading ? (
                error ? (
                  <Text style={styles.errorMessage}>Error fetching videos: {error}</Text>
                ) : (
                  <Text style={styles.errorMessage}>No modules available</Text>
                )
              ) : null
            }
            showsVerticalScrollIndicator={false}
          />
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
    marginTop: 40,
  },
  miniLogo: {
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
    height: '75%',
  },
});

export default AssortedModules;