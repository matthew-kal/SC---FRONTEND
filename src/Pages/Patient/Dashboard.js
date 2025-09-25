import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import Graph from '../../Components/Cards/Graph.js';
import Logo from '../../../assets/Logo.png'; 
import { PatientContext } from '../../Components/Services/PatientContext';
import { useFetchWithAuth } from '../../Components/Services/FetchWithAuth.js';
import ModuleCard from '../../Components/Cards/ModuleCard.js';
import QuoteCard from '../../Components/Cards/QuoteCard.js';
import ModuleSkeleton from '../../Components/Skeletons/ModuleSkeleton.js';
import GraphSkeleton from '../../Components/Skeletons/GraphSkeleton.js';
import QuoteSkeleton from '../../Components/Skeletons/QuoteSkeleton.js';

const Dashboard = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphKey, setGraphKey] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [taskModuleData, setTaskModuleData] = useState([]);
  const [quote, setQuote] = useState('');
  const { refresh, setRefresh, date, setDate } = useContext(PatientContext);
  const { width } = Dimensions.get("window");
  const { getJSON, fetchWithAuth } = useFetchWithAuth();
  
  // Animation references
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const titleOpacities = useRef([
    new Animated.Value(0), // Today's Modules
    new Animated.Value(0), // Your Journey  
    new Animated.Value(0), // Today's Quote
  ]).current;
  const sectionOpacities = useRef([
    new Animated.Value(0), // Modules section
    new Animated.Value(0), // Graph section
    new Animated.Value(0), // Quote section
  ]).current;
  const moduleAnimations = useRef([]).current;
  
  const fetchDashboardData = async () => {
    try {
      const { generalVideos, tasks, quote, weekData } = await getJSON('/users/dashboard/');
      setDashboardData(generalVideos || []);
      setTaskModuleData(tasks || []);
      setQuote(quote?.quote_text);
      setWeeklyData([
        { x: 'M', y: weekData.mon || 0 }, { x: 'T', y: weekData.tues || 0 },
        { x: 'W', y: weekData.wed || 0 }, { x: 'Th', y: weekData.thur || 0 },
        { x: 'F', y: weekData.fri || 0 }, { x: 'S', y: weekData.sat || 0 },
        { x: 'Su', y: weekData.sun || 0 },
      ]);
      setDailyData([weekData.week || 0, weekData.all_time || 0]);
      
      // Initialize module animations
      const totalModules = (tasks?.length || 0) + (generalVideos?.length || 0);
      moduleAnimations.length = 0; // Clear previous animations
      for (let i = 0; i < totalModules; i++) {
        moduleAnimations.push(new Animated.Value(0));
      }
      
    } catch (error) {
      console.error('Fetch error:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
      setGraphKey(k => k + 1);
      // Trigger entrance animations after data loads
      if (!error) {
        startEntranceAnimations();
      }
    }
  };

  const startEntranceAnimations = () => {
    // Logo entrance with bounce
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered section animations
    const sectionAnimations = sectionOpacities.map((opacity, index) =>
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay: 300 + (index * 200), // 300ms, 500ms, 700ms delays
        useNativeDriver: true,
      })
    );

    const titleAnimations = titleOpacities.map((opacity, index) =>
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay: 200 + (index * 200), // 200ms, 400ms, 600ms delays
        useNativeDriver: true,
      })
    );

    // Module cards slide in from right
    const moduleSlideAnimations = moduleAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 800 + (index * 150), // Start after sections, 150ms stagger
        useNativeDriver: true,
      })
    );

    Animated.parallel([
      ...sectionAnimations,
      ...titleAnimations,
      ...moduleSlideAnimations,
    ]).start();
  };

  useFocusEffect(
    useCallback(() => {
      const today = new Date().getDate();
      
      // Reset all animations when screen comes into focus
      logoOpacity.setValue(0);
      logoScale.setValue(0.8);
      titleOpacities.forEach(anim => anim.setValue(0));
      sectionOpacities.forEach(anim => anim.setValue(0));
      moduleAnimations.forEach(anim => anim.setValue(0));
      
      if (refresh || date !== today) {
        setLoading(true);
        setError(null);
        fetchDashboardData().then(() => {
          if (refresh) setRefresh(false);
          if (date !== today) setDate(today);
        });
      } else {
        // If data is already fresh, just run animations
        startEntranceAnimations();
      }
      
      // Cleanup function
      return () => {
        console.log('[Dashboard] Screen losing focus, resetting animations');
        logoOpacity.setValue(0);
        logoScale.setValue(0.8);
        titleOpacities.forEach(anim => anim.setValue(0));
        sectionOpacities.forEach(anim => anim.setValue(0));
        moduleAnimations.forEach(anim => anim.setValue(0));
      };
    }, [refresh, date])
  );

  const handleNavigate = (item) => {
    navigation.navigate('MediaPlayer', {
      mode: 'dashboard',
      videoId: item.id, 
      videoTitle: item.title,
      videoDescription: item.description, 
      isCompleted: item.isCompleted, 
      mediaType: item.media_type,
    });
  };

  const handleTask = useCallback(async (taskId) => {
    try {
      const response = await fetchWithAuth(`/users/tasks/update-completion/${taskId}/`, { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      setTaskModuleData(prevData => prevData.map(task => 
        task.id === taskId ? { ...task, isCompleted: true } : task
      ));
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }, [fetchWithAuth]);

  // Animated wrapper component for module cards
  const AnimatedModuleCard = ({ item, onPress, isTask, animationValue, index }) => {
    return (
      <Animated.View
        style={{
          opacity: animationValue,
          transform: [
            {
              translateX: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0], // Slide in from right
              }),
            },
            {
              scale: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1], // Slight scale animation
              }),
            },
          ],
        }}
      >
        <ModuleCard item={item} onPress={onPress} isTask={isTask} />
      </Animated.View>
    );
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load dashboard data.</Text>
      </View>
    );
  }

  const w = 295, h = 70;
  const logoWidth = width < 400 ? w * 0.85 : w;
  const logoHeight = width < 400 ? h * 0.85 : h;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#AA336A', '#FFFFFF']} style={styles.gradient}>
        <View style={styles.main}>
          {/* Animated Logo */}
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            }}
          >
            <Image source={Logo} style={[styles.logo, { width: logoWidth, height: logoHeight }]} />
          </Animated.View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            
            {/* Today's Modules Section */}
            <Animated.View 
              style={[
                styles.videoScroll, 
                { 
                  height: width >= 450 ? 280 : 240,
                  opacity: sectionOpacities[0],
                  transform: [
                    {
                      translateY: sectionOpacities[0].interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                }
              ]}
            >
              <Animated.Text 
                style={[
                  styles.title,
                  {
                    opacity: titleOpacities[0],
                    transform: [
                      {
                        translateY: titleOpacities[0].interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        }),
                      },
                    ],
                  }
                ]}
              >
                Today's Modules
              </Animated.Text>
              
              {loading ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <ModuleSkeleton /><ModuleSkeleton />
                </ScrollView>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {taskModuleData.map((task, index) => (
                    <AnimatedModuleCard 
                      key={`task-${task.id}`} 
                      item={task} 
                      onPress={() => handleTask(task.id)} 
                      isTask={true}
                      animationValue={moduleAnimations[index] || new Animated.Value(1)}
                      index={index}
                    />
                  ))}
                  {dashboardData.map((item, index) => (
                    <AnimatedModuleCard 
                      key={`module-${item.id}`} 
                      item={item} 
                      onPress={() => handleNavigate(item)}
                      animationValue={moduleAnimations[taskModuleData.length + index] || new Animated.Value(1)}
                      index={taskModuleData.length + index}
                    />
                  ))}
                </ScrollView>
              )}
            </Animated.View>

            {/* Your Journey Section */}
            <Animated.Text 
              style={[
                styles.title,
                {
                  opacity: titleOpacities[1],
                  transform: [
                    {
                      translateY: titleOpacities[1].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                }
              ]}
            >
              Your Journey
            </Animated.Text>
            
            <Animated.View
              style={{
                opacity: sectionOpacities[1],
                transform: [
                  {
                    translateY: sectionOpacities[1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                  {
                    scale: sectionOpacities[1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              }}
            >
              {loading ? (
                <GraphSkeleton containerStyle={[styles.cardContainer, { width: width >= 450 ? '60%' : '90%' }]} />
              ) : (
                <Graph
                  containerStyle={[styles.cardContainer, { width: width >= 450 ? '60%' : '90%' }]}
                  weeklyData={weeklyData}
                  dailyData={dailyData}
                  key={graphKey}
                />
              )}
            </Animated.View>

            {/* Today's Quote Section */}
            <Animated.Text 
              style={[
                styles.title, 
                { 
                  marginTop: 60,
                  opacity: titleOpacities[2],
                  transform: [
                    {
                      translateY: titleOpacities[2].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                }
              ]}
            >
              Today's Quote
            </Animated.Text>
            
            <Animated.View
              style={{
                opacity: sectionOpacities[2],
                transform: [
                  {
                    translateY: sectionOpacities[2].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                  {
                    scale: sectionOpacities[2].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              }}
            >
              {loading ? <QuoteSkeleton /> : <QuoteCard text={quote} />}
            </Animated.View>

            <View style={{ height: 130 }} />
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    gradient: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
    main: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
    logo: { marginTop: 80, marginBottom: 20 },
    videoScroll: { width: '100%' },
    title: { fontFamily: 'Cairo', fontSize: 35, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 10, marginTop: 30 },
    cardContainer: { height: 250, justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#AA336A', backgroundColor: 'white', alignItems: 'center', alignSelf: 'center', marginVertical: 5 },
    errorText: { fontSize: 18, color: 'red' },
    noDataText: { fontSize: 18, color: 'gray' },
});

export default Dashboard;