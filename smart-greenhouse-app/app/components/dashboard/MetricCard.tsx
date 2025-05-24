import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend }) => {
  const trendColor = trend.includes('up')
    ? 'green'
    : trend.includes('down')
    ? 'red'
    : 'gray';

  return (
    <View style={styles.card}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={[styles.metricTrend, { color: trendColor }]}>{trend}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    width: Platform.OS === 'web' ? '100%' : '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  metricTrend: {
    fontSize: 14,
  },
});

export default MetricCard;
