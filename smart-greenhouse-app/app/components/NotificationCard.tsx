import React from 'react';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';

interface NotificationCardProps {
  title: string;
  message: string;
  timestamp: string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ title, message, timestamp }) => {
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <View style={[styles.card, { marginTop: statusBarHeight }]}> {/* Adjust margin for status bar */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    marginVertical: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
});

export default NotificationCard;