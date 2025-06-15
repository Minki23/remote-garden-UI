import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const VideoPlayer = () => {
  const backendUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}/live/video`;
  return (
    <img src={backendUrl} alt="Live Stream" style={styles.webview} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    backgroundColor: 'black',
    borderRadius: 10,
  },
});

export default VideoPlayer;