import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const gardens = [
  { id: '1', name: 'Vegetable Garden' },
  { id: '2', name: 'Flower Garden' },
  { id: '3', name: 'Herb Garden' },
];

const GardenList = () => {
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.name}</Text>
    </View>
  );

  return (
    <FlatList
      data={gardens}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
  },
});

export default GardenList;