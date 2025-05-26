import React, { useEffect, useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Graph from '../../Components/Graph.js';
import Logo from '../../Images/Logo.png';
import { PatientContext } from '../../Components/PatientContext';
import { useFetchWithAuth } from '../../Components/FetchWithAuth.js';

const Dashboard = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [graphKey, setGraphKey] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [taskModuleData, setTaskModuleData] = useState([]);
  const [quote, setQuote] = useState(''); 
  const { refresh, setRefresh, date, setDate } = useContext(PatientContext);
  const {width} = Dimensions.get("window")
  const { getJSON, fetchWithAuth } = useFetchWithAuth();
  const w = 295;
  const h = 70;
  const logoWidth = width < 400 ? w * 0.85 : w;
  const logoHeight = width < 400 ? h * 0.85 : h;     
  
  const fetchDashboardData = async () => {
    try {
      const { generalVideos, tasks, quote, weekData } = await getJSON('/users/dashboard/');

      setDashboardData(generalVideos || []);
      setTaskModuleData(tasks || []);
      setQuote(quote?.quote);
      setWeeklyData([
        { x: 'M', y: weekData.mon || 0 },
        { x: 'T', y: weekData.tues || 0 },
        { x: 'W', y: weekData.wed || 0 },
        { x: 'Th', y: weekData.thur || 0 },
        { x: 'F', y: weekData.fri || 0 },
        { x: 'S', y: weekData.sat || 0 },
        { x: 'Su', y: weekData.sun || 0 },
      ]);
      setDailyData([weekData.week || 0, weekData.all_time || 0]);

    } catch (error) {
      console.error('Fetch error:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
      setGraphKey(k => k + 1);
    }
  };


useFocusEffect(
  useCallback(() => {
    const today = new Date().getDate();
    const needRefresh = refresh || date !== today;
    if (needRefresh) {
       fetchDashboardData();
       if (refresh) setRefresh(false);
       if (date !== today) setDate(today);
     }

  }, [refresh, date])   
);

  const handleNavigate = (videoUrl, videoTitle, videoId, videoDescription, isCompleted, mediaType) => {
    setIsNavigating(true);
    console.log(isCompleted)
    setTimeout(() => {
      navigation.navigate('DashPlayer', { videoUrl, videoTitle, videoId, videoDescription, isCompleted, mediaType });
      setIsNavigating(false);
    }, 500);
  };

  const handleTask = useCallback(async (taskId) => {
    try {
      const response = await fetchWithAuth(`/users/tasks/update-completion/${taskId}/`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setTaskModuleData((prevData) =>
        prevData.map((task) =>
          task.id === taskId ? { ...task, isCompleted: true } : task
        )
      );

    } catch (error) {
      console.error('Fetch error:', error);
    }
  }, [fetchWithAuth]);

  if (loading || isNavigating) {
    return (
      <View style={styles.container}>
        
        <LinearGradient
          colors={['#AA336A', '#FFFFFF']}
          style={styles.gradient}
          start={[0, 0]}
          end={[1, 1]}
        >
          <Image source={Logo} style={[styles.logo, {width: logoWidth, height: logoHeight}]} />
          <ActivityIndicator size="large" color="white" />
        </LinearGradient>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load dashboard data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#AA336A', '#FFFFFF']} style={styles.gradient}>
        <View style={styles.main}>
          <Image source={Logo} style={[styles.logo, {width: logoWidth, height: logoHeight}]} />
          <ScrollView  showsVerticalScrollIndicator={false}>
            {(dashboardData.length > 0 ||  taskModuleData.length > 0) ? (
              <View style={[styles.videoScroll, { height: width >= 450 ? 280 : 240 }]}>
                <Text style={styles.title}>Today's Modules</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>

                {taskModuleData.length > 0 && 
                  taskModuleData.map((task) => (
                    <TouchableOpacity
                      key={task.id}
                      onPress={async () => {
                        if(!task.isCompleted) {
                        await handleTask(task.id); 
                        }
                      }}
                      style={[styles.inner, task.isCompleted ? styles.innerSuccess : styles.innerError]}
                    >
                      <Text style={styles.moduleTitle}>{task.name}</Text>
                      <Text style={styles.moduleDesc}>{task.description}</Text>
                      <View style={styles.icons}>
                        <Icon
                          name={task.isCompleted ? 'checkmark-circle-outline' : task.icon}
                          size={30}
                          color={task.isCompleted ? '#4CAF50' : '#D9534F'}
                        />
                      </View>
                    </TouchableOpacity>
                  ))
                }

                {dashboardData.length > 0 &&
                  dashboardData.map((item) => (
                    <TouchableOpacity
                      onPress={() => handleNavigate(item.url, item.title, item.id, item.description, item.isCompleted, item.media_type)}
                      key={item.id}
                      style={[styles.inner, item.isCompleted ? styles.innerSuccess : styles.innerError]}
                    >
                      <Text style={styles.moduleTitle}>{item.title}</Text>
                      <View style={styles.icons}>
                        <Icon
                          name={item.isCompleted ? "checkmark-circle-outline" : item.icon}
                          size={30}
                          color={item.isCompleted ? '#4CAF50' : '#D9534F'}
                        />
                      </View>
                    </TouchableOpacity>
                  ))
                }


                </ScrollView>
              </View>
            ) : (
              <Text style={styles.noDataText}>No data available</Text>
            )}

            <Text style={styles.title}>Your Journey</Text>
            <View style={[styles.graph, { width: width >= 450 ? '60%' : '90%' }]}>
              <Graph weeklyData={weeklyData} dailyData={dailyData} key={graphKey} />
            </View>
                <Text style={[styles.title, {marginTop: 60}]}>Today's Quote</Text>
                <View style={[styles.quote, { width: width >= 450 ? '60%' : '90%' }]}>
                  <Text style={styles.quoteText}>
                    {quote || 'Recovery is not a race. You don’t have to feel guilty if it takes longer than you thought it would.'}
                  </Text>
                </View>

            <View style={{ height: 130 }}>
              <Text style={{ color: 'transparent' }}> ... </Text>
            </View>
          </ScrollView>
        </View>
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
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    marginTop: 80,
    marginBottom: 20,
  },
  quote: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#AA336A',
    padding: 10,
    backgroundColor: 'white',
    width: '100%',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center'
  },
  quoteText: {
    fontFamily: 'Cairo',
    fontSize: 18,
    textAlign: 'center',
  },
  videoScroll: {
    width: '100%',
  },
  moduleTitle: {
    fontWeight: '400',
    fontFamily: 'Cairo',
    fontSize: 19,
  },
  moduleDesc: {
    fontWeight: '400',
    fontFamily: 'Cairo',
    fontStyle: 'italic',
    fontSize: 17,
    marginBottom: 5
  },
  inner: {
    width: 180,
    height: 120,
    flexDirection: 'column',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#AA336A',
    margin: 5,
  },
  icons: {
    flexDirection: 'row',
  },
  innerSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  innerError: {
    backgroundColor: '#FDECEA',
    borderColor: '#D9534F',
  },
  title: {
    fontFamily: 'Cairo',
    fontSize: 35,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 30,
  },
  graph: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#AA336A',
    backgroundColor: 'white',
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 5,
  },
  icon: {
    marginTop: 5,
    marginHorizontal: 2,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  noDataText: {
    fontSize: 18,
    color: 'gray',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#AA336A',
  },
});

export default Dashboard;