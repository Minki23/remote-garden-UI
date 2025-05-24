import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DataCardProps {
  title: string;
  value: string | number;
}

const DataCard: React.FC<DataCardProps> = ({ title, value }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 24,
    color: '#333',
  },
});

export default DataCard;