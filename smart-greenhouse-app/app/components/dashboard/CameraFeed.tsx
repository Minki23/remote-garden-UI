import React from 'react';
import { View, Text, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CameraFeed = () => {
  return (
    Platform.OS === 'web' ? (
      <View style={{
        height: 300,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 8,
        width: '100%',
      }}>
        <MaterialIcons name="videocam" size={100} color="#e0e0e0" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#555' }}>Camera feed placeholder</Text>
      </View>
    ) : (
      <View style={{
        height: 300,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        paddingBottom: 10,
        borderColor: '#ddd',
        width: '100%',
      }}>
        <MaterialIcons name="videocam" size={100} color="#e0e0e0" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#555' }}>Camera feed placeholder</Text>
      </View>
    )
  );
};

export default CameraFeed;
