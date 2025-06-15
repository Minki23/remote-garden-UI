import React, { use, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';

const LiveDataActions = () => {

const [lightSystem, setLightSystem] = React.useState(false);
const [growHeater, setGrowHeater] = React.useState(0.5);
const [roofOpen, setRoof] = React.useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}>Light System</Text>
        <Text style={styles.actionDescription}>Manually toggle the light system.</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => {
          setLightSystem(!lightSystem);
          if (!lightSystem) {
            fetch('http://localhost:3000/api/devices/1/light/off', {
              method: 'POST'
            }).catch(console.error);
          }
          else {
            fetch('http://localhost:3000/api/devices/1/light/on', {
              method: 'POST'
            }).catch(console.error);
          }
        }}>
          {lightSystem ? (
            <MaterialIcons name="pause" size={24} color="#007BFF" />
          ) : (
            <MaterialIcons name="play-arrow" size={24} color="#007BFF" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}>Heating</Text>
        <Text style={styles.actionDescription}>Adjust the intensity of the heating system.</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="#007BFF"
          maximumTrackTintColor="#ddd"
          onSlidingComplete={(value) => {
            setGrowHeater(Number(value.toFixed(2)));
            fetch('http://localhost:3000/api/devices/1/heater/increase', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ amount: value }),
            }).catch(console.error);
          }}
          value={growHeater}
        />
        <Text style={styles.sliderValue}>Level: {growHeater * 100}%</Text>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}>Ventilation Fan</Text>
        <Text style={styles.actionDescription}>Control the greenhouse roof.</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => {
            setRoof(!roofOpen);
            if (!roofOpen) {
              fetch('http://localhost:3000/api/devices/1/roof/open', {
                method: 'POST'
              }).catch(console.error);
            } else {
              fetch('http://localhost:3000/api/devices/1/roof/close', {
                method: 'POST'
              }).catch(console.error);
            }
          }}>
            {roofOpen ? (
              <MaterialIcons name="pause" size={24} color="#007BFF" />
            ) : (
              <MaterialIcons name="play-arrow" size={24} color="#007BFF" />
            )}
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
