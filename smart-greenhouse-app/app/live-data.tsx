import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, DrawerLayoutAndroid, Platform } from 'react-native';
import { Sidebar } from './components/Sidebar';
import CameraFeed from './components/dashboard/CameraFeed';
import TemperatureChart from './components/dashboard/TemperatureChart';
import HumidityChart from './components/dashboard/HumidityChart';
import LiveDataActions from './components/live-data/LiveDataActions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LiveData = () => {
  const isWeb = Platform.OS !== 'android';
  const chartWidth = 0.6 * Dimensions.get('window').width;
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [Temperature, setTemperature] = useState<number>(0);
  const [Humidity, setHumidity] = useState<number>(0);
  const [LightLevel, setLightLevel] = useState<number>(0);
  const [temp_trend, setTempTrend] = useState<string>("stable");
  const [humidity_trend, setHumidityTrend] = useState<string>("stable");
  const [light_trend, setLightTrend] = useState<string>("stable");
  const [SystemStatus, setSystemStatus] = useState<string>("Good");
  const [tempChartData, setTempChartData] = useState<any[]>([]);
  const [humidityChartData, setHumidityChartData] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('access_token');
      const wsUrl = `ws://${process.env.EXPO_PUBLIC_BACKEND_URL}/ws/wsinit?Authorization=Bearer ${token}`;
      console.log('Connecting to WebSocket:', wsUrl);
      const socket = new WebSocket(wsUrl);
      setWs(socket);
      socket.onopen = () => console.log('WebSocket connected');
      socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log('WebSocket message received:', data);
        if (data.event === 'new_reading') {
          if (data.device_type == "TEMPERATURE") {
            if (data.value > Temperature) {
              setTempTrend("Trend: up");
            } else if (data.value < Temperature) {
              setTempTrend("Trend: down");
            } else {
              setTempTrend("Trend: stable");
            }
            setTemperature(data.value);
            setTempChartData(prev => {
              const now = new Date();
              const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const updated = [...prev, { timestamp, value: data.value }];
              return updated.length > 10 ? updated.slice(updated.length - 10) : updated;
            });
          }
          if (data.device_type == "SOIL_SENSOR") {
            if (data.value > Humidity) {
              setHumidityTrend("Trend: up");
            } else if (data.value < Humidity) {
              setHumidityTrend("Trend: down");
            } else {
              setHumidityTrend("Trend: stable");
            }
            setHumidity(data.value);
            setHumidityChartData(prev => {
              const now = new Date();
              const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const updated = [...prev, { timestamp, value: data.value }];
              return updated.length > 10 ? updated.slice(updated.length - 10) : updated;
            });
          }
          if (data.device_type == "LIGHT") {
            if (data.value > LightLevel) {
              setLightTrend("Trend: up");
            } else if (data.value < LightLevel) {
              setLightTrend("Trend: down");
            } else {
              setLightTrend("Trend: stable");
            }
            setLightLevel(data.value);
          }
        }
      };
      socket.onclose = () => console.log('WebSocket closed');
      socket.onerror = (e) => console.error('WebSocket error', e);
    })();
  }, []);

  if (Platform.OS === 'android') {
    return (
      <DrawerLayoutAndroid
        renderNavigationView={() => (
          <ScrollView contentContainerStyle={styles.drawerContent}>
            <Sidebar />
          </ScrollView>
        )}
        drawerWidth={300}
        drawerPosition="left"
        keyboardDismissMode="on-drag"
        drawerLockMode="unlocked"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.title}>Live Data</Text>
          <View style={styles.row}>
            <LiveDataActions />
          </View>

          <View style={styles.section}>
            <CameraFeed />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Temperature Trend</Text>
            <TemperatureChart chartWidth={chartWidth} tempChartData={tempChartData} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Humidity Trend</Text>
            <HumidityChart chartWidth={chartWidth} humidityChartData={humidityChartData} />
          </View>
        </ScrollView>
      </DrawerLayoutAndroid>
    );
  }

  return (
    <View style={styles.containerWithSidebar}>
      <Sidebar />
      <ScrollView contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.title}>Live Data</Text>
        <View style={styles.row}>
          <View style={styles.actionsColumn}>
            <LiveDataActions />
          </View>
            <CameraFeed />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temperature Trend</Text>
          <TemperatureChart chartWidth={chartWidth} tempChartData={tempChartData} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Humidity Trend</Text>
          <HumidityChart chartWidth={chartWidth} humidityChartData={humidityChartData} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWithSidebar: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerContent: {
    flex: 3,
    paddingTop: 50,
    backgroundColor: '#f8f8f8',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 20,
  },
  metricsColumn: {
    flex: 1,
  },
  actionsColumn: {
    width: '30%',
    justifyContent: 'flex-start',
  },
  section: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007BFF',
  },
});

export default LiveData;