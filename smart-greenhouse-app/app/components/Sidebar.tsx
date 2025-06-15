import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';

export default function Sidebar({ closeDrawer }: { closeDrawer?: () => void }) {
  const router = useRouter();

  const navigate = (path: '/' | '/dashboard' | '/live-data' | '/scheduling' | '/notifications' | '/history' | '/settings') => {
    router.push(path);
    if (closeDrawer) closeDrawer();
  };

  return (
    <View style={styles.sidebarContent}>
      <Text style={styles.title}>My gardens</Text>
      <TouchableOpacity style={styles.linkContainer} onPress={() => navigate('/dashboard')}>
        <MaterialIcons name="dashboard" size={20} color="#007BFF" />
        <Text style={styles.link}>Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkContainer} onPress={() => navigate('/live-data')}>
        <MaterialIcons name="bar-chart" size={20} color="#007BFF" />
        <Text style={styles.link}>Live Data</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkContainer} onPress={() => navigate('/scheduling')}>
        <MaterialIcons name="schedule" size={20} color="#007BFF" />
        <Text style={styles.link}>Scheduling</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkContainer} onPress={() => navigate('/history')}>
        <MaterialIcons name="history" size={20} color="#007BFF" />
        <Text style={styles.link}>History</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkContainer} onPress={() => navigate('/settings')}>
        <MaterialIcons name="settings" size={20} color="#007BFF" />
        <Text style={styles.link}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export { Sidebar };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
    padding: 10,
  },
  drawerButton: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
  },
  drawerButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sidebarContent: {
    backgroundColor: '#ffffff',
    flex: 1,
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    maxWidth: 300,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  link: {
    fontSize: 18,
    marginVertical: 15,
    color: '#007BFF',
    fontWeight: '500',
  },
  linkPressed: {
    color: '#0056b3',
  },
  drawerContent: {
    position: 'absolute',
    top: 50,
    left: 0,
    backgroundColor: '#f8f8f8',
    padding: 20,
    zIndex: 999,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  statsContainer: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  statsText: {
    marginTop: 5,
    fontSize: 14,
    color: 'gray',
  },
});