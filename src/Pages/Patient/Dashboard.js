import React, { useEffect, useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
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
      if (refresh || date !== today) {
        setLoading(true);
        setError(null);
        fetchDashboardData().then(() => {
          if (refresh) setRefresh(false);
          if (date !== today) setDate(today);
        });
      }
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
          <Image source={Logo} style={[styles.logo, { width: logoWidth, height: logoHeight }]} />
          <ScrollView showsVerticalScrollIndicator={false}>
            
            <View style={[styles.videoScroll, { height: width >= 450 ? 280 : 240 }]}>
              <Text style={styles.title}>Today's Modules</Text>
              {loading ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <ModuleSkeleton /><ModuleSkeleton />
                </ScrollView>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {taskModuleData.map((task) => (
                    <ModuleCard key={`task-${task.id}`} item={task} onPress={() => handleTask(task.id)} isTask={true} />
                  ))}
                  {dashboardData.map((item) => (
                    <ModuleCard key={`module-${item.id}`} item={item} onPress={() => handleNavigate(item)} />
                  ))}
                </ScrollView>
              )}
            </View>

            <Text style={styles.title}>Your Journey</Text>
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

            <Text style={[styles.title, { marginTop: 60 }]}>Today's Quote</Text>
            {loading ? <QuoteSkeleton /> : <QuoteCard text={quote} />}

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