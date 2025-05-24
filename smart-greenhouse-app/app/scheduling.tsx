import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Scheduling = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scheduling Tasks</Text>
      <Text style={styles.description}>
        Manage your greenhouse tasks such as watering and lighting schedules here.
      </Text>
      {/* Additional scheduling functionality will be implemented here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Scheduling;