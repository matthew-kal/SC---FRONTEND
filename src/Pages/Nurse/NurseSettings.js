import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PrivacyPolicy from '../../Components/Cards/PrivacyPolicy';
import Logout from '../../Components/Services/Logout';

const NurseSettings = () => {
  

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#AA336A', '#FFFFFF']}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.gradient}
      >
        <Text style={styles.title}>Settings</Text>
        <Logout/>
        <PrivacyPolicy/> 
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
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  title: {
fontFamily: 'Cairo',
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 60,
  },
});

export default NurseSettings;