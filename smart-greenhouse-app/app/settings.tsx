import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const Settings = () => {
  const handleSave = () => {
    // Logic to save settings
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      {/* Add settings options here */}
      <Button title="Save Settings" onPress={handleSave} />
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
    marginBottom: 20,
  },
});

export default Settings;