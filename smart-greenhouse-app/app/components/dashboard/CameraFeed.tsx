import React, { useState } from 'react';
import { View, Text, Platform, Image, ActivityIndicator, StyleSheet } from 'react-native';

const CameraFeed = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const handleLoadStart = () => {
    if (isFirstLoad) {
      setIsLoading(true);
    }
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    setIsFirstLoad(false);
  };
  return (
    <View style={styles.container}>
      {isLoading && isFirstLoad && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>
            Loading camera feed...
          </Text>
        </View>
      )}

      <Image
        source={{ uri: `http://${process.env.EXPO_PUBLIC_BACKEND_URL}/live/video` }}
        style={[styles.image, { opacity: (isLoading && isFirstLoad) ? 0 : 1 }]}
        resizeMode="contain"
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'web' ? '100%' as any : 300,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: Platform.OS === 'web' ? '2%' as any : 0,
    paddingBottom: Platform.OS === 'web' ? 0 : 10,
    width: '100%',
    maxHeight: Platform.OS === 'web' ? "80%" : 300,
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
    overflow: 'hidden',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    zIndex: 2,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default CameraFeed;
