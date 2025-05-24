import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, DrawerLayoutAndroid, Platform } from 'react-native';
import { Sidebar } from './components/Sidebar';
import CameraFeed from './components/dashboard/CameraFeed';
import TemperatureChart from './components/dashboard/TemperatureChart';
import HumidityChart from './components/dashboard/HumidityChart';
import LiveDataActions from './components/live-data/LiveDataActions';

const LiveData = () => {
  const isWeb = Platform.OS !== 'android';
  const chartWidth = 0.6 * Dimensions.get('window').width;

  if (Platform.OS === 'android' && !isWeb) {
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
            <Text style={styles.sectionTitle}>2-Hour Temperature Trend</Text>
            <TemperatureChart chartWidth={chartWidth} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2-Hour Humidity Trend</Text>
            <HumidityChart chartWidth={chartWidth} />
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
          <Text style={styles.sectionTitle}>2-Hour Temperature Trend</Text>
          <TemperatureChart chartWidth={chartWidth} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2-Hour Humidity Trend</Text>
          <HumidityChart chartWidth={chartWidth} />
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
    justifyContent: 'space-between',
    gap: 20,
  },
  metricsColumn: {
    flex: 1,
  },
  actionsColumn: {
    width: '30%',
    justifyContent: 'center',
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