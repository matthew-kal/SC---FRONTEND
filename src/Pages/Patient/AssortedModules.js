import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFetchWithAuth } from '../../Components/Services/FetchWithAuth';
import CacheManager from '../../Components/Services/CacheManager';
import AssortedSkeleton from '../../Components/Skeletons/AssortedSkeleton';

const Module = ({ title, handlePress }) => (
  <TouchableOpacity style={styles.buttonContainer} onPress={handlePress}>
    <View style={styles.button}>
      <Text style={styles.title}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const AssortedModules = () => {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const route = useRoute();
  const { categoryId, subcategoryId, subcategory } = route.params;
  const {width} = Dimensions.get("window") 
  const { fetchWithAuth } = useFetchWithAuth();

  useFocusEffect(
    useCallback(() => {
        fetchModules();
    }, [fetchModules])
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
      }
    } catch (err) {
      setError(err.message);
      console.error('Fetch modules error:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, subcategoryId, fetchWithAuth]);

  const handleNavigate = (videoUrl, videoTitle, videoDescription, mediaType) => {
    navigation.navigate('AssortedPlayer', { videoUrl, videoTitle, videoDescription, mediaType });
  };

  const handleReturn = () => {
    setLoading(true);
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
          <ScrollView contentContainerStyle={styles.scroll}>
            {loading ? (
              <>
                <AssortedSkeleton />
                <AssortedSkeleton />
                <AssortedSkeleton />
                <AssortedSkeleton />
              </>
            ) : videos.length > 0 ? (
              videos.map((video, index) => (
                <Module
                  key={video.id || video.url}
                  title={video.title}
                  handlePress={() => handleNavigate(video.url, video.title, video.description, video.media_type)}
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