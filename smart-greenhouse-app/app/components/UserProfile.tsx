import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const UserProfile = () => {
  const handleEditProfile = () => {
    // Logic to edit user profile
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      <Text style={styles.label}>Name: John Doe</Text>
      <Text style={styles.label}>Email: john.doe@example.com</Text>
      <Button title="Edit Profile" onPress={handleEditProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginVertical: 5,
  },
});

export default UserProfile;