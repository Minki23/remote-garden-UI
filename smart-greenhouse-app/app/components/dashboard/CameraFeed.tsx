import React from 'react';
import { View, Text, Platform, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CameraFeed = () => {
  return (
    Platform.OS === 'web' ? (
      <View style={{
        height: '80%',
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: '2%',
        width: '72%',
        maxWidth: 600,
        overflow: 'hidden',
      }}>
        <Image
          source={{ uri: 'http://localhost:3000/live/video' }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
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
       <Image
          source={{ uri: 'http://localhost:3000/live/video' }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </View>
    )
  );
};

export default CameraFeed;
