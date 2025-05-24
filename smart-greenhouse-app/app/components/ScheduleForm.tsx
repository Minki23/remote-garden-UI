import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const ScheduleForm = () => {
  const [task, setTask] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = () => {
    // Handle form submission logic here
    console.log(`Task: ${task}, Time: ${time}`);
    // Reset form fields
    setTask('');
    setTime('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Task</Text>
      <TextInput
        style={styles.input}
        value={task}
        onChangeText={setTask}
        placeholder="Enter task"
      />
      <Text style={styles.label}>Time</Text>
      <TextInput
        style={styles.input}
        value={time}
        onChangeText={setTime}
        placeholder="Enter time"
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});

export default ScheduleForm;