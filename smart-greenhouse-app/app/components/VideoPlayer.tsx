import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const VideoPlayer = () => {
  return (
    <img src="http://localhost:3000/live/video" alt="Live Stream" style={styles.webview}/>
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