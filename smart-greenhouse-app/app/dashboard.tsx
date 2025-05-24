import React from "react";
import { View, Text, StyleSheet, useWindowDimensions, ScrollView, DrawerLayoutAndroid, Platform } from "react-native";
import { Sidebar } from "./components/Sidebar";
import TemperatureChart from './components/dashboard/TemperatureChart';
import HumidityChart from './components/dashboard/HumidityChart';
import CameraFeed from './components/dashboard/CameraFeed';
import { Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MetricCard from './components/dashboard/MetricCard';

const screenWidth = Dimensions.get('window').width;

export default function Dashboard() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const isWeb = Platform.OS !== 'android';

  const chartWidth = isWeb ? 0.7 * screenWidth : 0.8 * screenWidth;

  if (Platform.OS === "android" && !isLargeScreen) {
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
          <View style={styles.row}>
            <View style={styles.row}>
              <MetricCard title="Temperature" value="24°C" trend="Trend: stable" />
              <MetricCard title="Humidity" value="62% RH" trend="Trend: down" />
            </View>
            <View style={styles.row}>
              <MetricCard title="Light Level" value="5500 Lux" trend="Trend: up" />
              <MetricCard title="System Status" value="Good" trend="Battery: 98%" />
            </View>
            <View style={styles.section}>
              <CameraFeed />
            </View> 
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Temperature Trend (12h)</Text>
              <TemperatureChart chartWidth={chartWidth} />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Humidity Trend (12h)</Text>
              <HumidityChart chartWidth={chartWidth} />
            </View>
          </View>
        </ScrollView>
      </DrawerLayoutAndroid>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.containerWithSidebar}>
        <Sidebar />
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.row}>
            <View style={styles.metricColumn}>
              <MetricCard title="Temperature" value="24°C" trend="Trend: stable" />
              <MetricCard title="Humidity" value="62% RH" trend="Trend: down" />
              </View>
            <View style={styles.metricColumn}>
              <MetricCard title="Light Level" value="5500 Lux" trend="Trend: up" />
              <MetricCard title="System Status" value="Good" trend="Battery: 98%" />
            </View>
            <View style={styles.cameraColumn}>
              <Text style={styles.sectionTitle}><MaterialIcons name="camera-alt" size={20} color="#007BFF" /> Live Camera Feed</Text>
              <CameraFeed />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Temperature Trend (12h)</Text>
            <TemperatureChart chartWidth={chartWidth} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Humidity Trend (12h)</Text>
            <HumidityChart chartWidth={chartWidth} />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerWithSidebar: {
    flex: 1,
    flexDirection: "row",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    width: '100%',
  },
  sidebarContainer: {
    flex: 3,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  column: {
    flexDirection: "column",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: Platform.OS === 'web' ? '23%' : '48%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 5,
  },
  metricTrend: {
    fontSize: 14,
    color: "gray",
  },
  section: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#007BFF",
    flexDirection: "row",
    alignItems: "center",
  },
  cameraFeed: {
    height: 300,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    width: '100%',
  },
  cameraFeedText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  drawerContent: {
    flex: 3,
    paddingTop: 50,
    backgroundColor: '#f8f8f8',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  metricColumn: {
    flex: 1,
    marginRight: 10,
    alignContent: "flex-end",
    justifyContent: "flex-end",
  },
  cameraColumn: {
    flex: 1,
  },
});