import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';

const LiveDataActions = () => {
  return (
    <View style={styles.container}>
      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}>Watering System</Text>
        <Text style={styles.actionDescription}>Manually toggle the watering system.</Text>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="play-arrow" size={24} color="#007BFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}>Grow Lights</Text>
        <Text style={styles.actionDescription}>Adjust the intensity of the grow lights.</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          minimumTrackTintColor="#007BFF"
          maximumTrackTintColor="#ddd"
        />
        <Text style={styles.sliderValue}>Level: 50%</Text>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}>Ventilation Fan</Text>
        <Text style={styles.actionDescription}>Control the greenhouse ventilation fan.</Text>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="play-arrow" size={24} color="#007BFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCard: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actionDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  actionButton: {
    alignSelf: 'flex-end',
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 50,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
});

export default LiveDataActions;
