import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, Button, Modal, TextInput, Pressable, Platform, ScrollView, DrawerLayoutAndroid } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sidebar } from './components/Sidebar';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const API_BASE = 'http://localhost:3000/api/schedules';

const Scheduling = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [action, setAction] = useState<string>('START_WATERING');
  const [scheduleTime, setScheduleTime] = useState<Date>(new Date());
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadSchedules = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/1`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      console.log('Schedules:', data);
      setSchedules(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadSchedules(); }, []);

  const toggleSchedule = async (id: string) => {
    const token = await AsyncStorage.getItem('access_token');
    await fetch(`${API_BASE}/${id}/toggle/`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    loadSchedules();
  };

  const deleteSchedule = async (id: string) => {
    const token = await AsyncStorage.getItem('access_token');
    await fetch(`${API_BASE}/${id}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    loadSchedules();
  };

  const humanizeCron = (date: Date) => {
    const h = `${date.getHours()}`.padStart(2, '0');
    const m = `${date.getMinutes()}`.padStart(2, '0');
    return `Every day at ${h}:${m}`;
  };

  const addSchedule = async () => {
    const token = await AsyncStorage.getItem('access_token');
    const h = scheduleTime.getHours();
    const m = scheduleTime.getMinutes();
    const daysString = selectedDays.length === 7 ? '*' : selectedDays.join(',');
    const cronExpression = `${m} ${h} * * ${daysString}`;
    const payload = { action, cron: cronExpression };
    await fetch(`${API_BASE}/1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    setModalVisible(false);
    setAction('START_WATERING');
    setScheduleTime(new Date());
    setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
    loadSchedules();
  };

  const updateSchedule = async (id: string, cronExpression: string) => {
    const token = await AsyncStorage.getItem('access_token');
    await fetch(`${API_BASE}/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ cron: cronExpression }),
    });
    loadSchedules();
  };

  const handleSubmit = async () => {
    const h = scheduleTime.getHours();
    const m = scheduleTime.getMinutes();
    const daysString = selectedDays.length === 7 ? '*' : selectedDays.join(',');
    const cronExpression = `${m} ${h} * * ${daysString}`;
    if (editingId) {
      await updateSchedule(editingId, cronExpression);
    } else {
      await addSchedule();
    }
    setModalVisible(false);
    setEditingId(null);
    setAction('START_WATERING');
    setScheduleTime(new Date());
    setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
    loadSchedules();
  };

  const handleEdit = (item: any) => {
    let cronString = '';
    if (typeof item.cron === 'string') {
      cronString = item.cron;
    } else if (item.cron && typeof item.cron === 'object') {
      const { minute = 0, hour = 0, day_of_week = '*' } = item.cron;
      cronString = `${minute} ${hour} * * ${day_of_week}`;
    } else {
      cronString = '0 9 * * *';
    }

    const cronParts = cronString.split(' ');
    const minute = cronParts[0] || '0';
    const hour = cronParts[1] || '9';
    const dayOfWeek = cronParts[4] || '*';

    const date = new Date();
    date.setHours(Number(hour), Number(minute), 0, 0);
    setScheduleTime(date);
    setAction(item.args?.[1] || item.action || 'START_WATERING');
    
    if (dayOfWeek === '*') {
      setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
    } else {
      try {
        const days = dayOfWeek.split(',').map((d: string) => Number(d.trim())).filter(d => !isNaN(d));
        setSelectedDays(days.length > 0 ? days : [1, 2, 3, 4, 5, 6, 0]);
      } catch (e) {
        setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
      }
    }
    
    setEditingId(item.task_id);
    setModalVisible(true);
  };

  const renderCron = (cron: any) => {
    let cronString = '';
    let minute = 0, hour = 0, dayOfWeek = '*';
    
    if (typeof cron === 'string') {
      const parts = cron.split(' ');
      minute = Number(parts[0]) || 0;
      hour = Number(parts[1]) || 0;
      dayOfWeek = parts[4] || '*';
    } else if (cron && typeof cron === 'object') {
      minute = cron.minute || 0;
      hour = cron.hour || 0;
      dayOfWeek = cron.day_of_week || '*';
    }
    
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    
    if (dayOfWeek === '*') {
      return `Every day at ${timeStr}`;
    }
    
    const dayNumbers = dayOfWeek.split(',').map(d => Number(d.trim())).filter(d => !isNaN(d));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    if (dayNumbers.length === 5 && dayNumbers.every(d => [1,2,3,4,5].includes(d))) {
      return `Weekdays at ${timeStr}`;
    }
    if (dayNumbers.length === 2 && dayNumbers.every(d => [0,6].includes(d))) {
      return `Weekends at ${timeStr}`;
    }
    if (dayNumbers.length === 7 || (dayNumbers.includes(0) && dayNumbers.includes(1) && dayNumbers.includes(2) && dayNumbers.includes(3) && dayNumbers.includes(4) && dayNumbers.includes(5) && dayNumbers.includes(6))) {
      return `Every day at ${timeStr}`;
    }
    
    const selectedDays = dayNumbers.map(d => dayNames[d]).join(', ');
    return `${selectedDays} at ${timeStr}`;
  };

  const getActionDisplayName = (action: string) => {
    const actionNames: { [key: string]: string } = {
      'START_WATERING': '💧 Water Plants',
      'TURN_ON': '💡 Turn On Lights',
      'TURN_OFF': '🌙 Turn Off Lights',
      'OPEN_ROOF': '🔓 Open Roof',
      'CLOSE_ROOF': '🔒 Close Roof',
      'INCREASE_TEMPERATURE': '🔥 Heat Up',
      'DECREASE_TEMPERATURE': '❄️ Cool Down'
    };
    return actionNames[action] || action;
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card} key={item.task_id}>
      <View style={styles.cardHeader}>
        <MaterialIcons name="event-note" size={24} color="#007BFF" />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{getActionDisplayName(item.args?.[1] || item.action || 'Unknown Action')}</Text>
          <Text style={styles.cardSubtitle}>{renderCron(item.cron)}</Text>
        </View>
        <Switch value={item.enabled} onValueChange={() => toggleSchedule(item.task_id)} />
          <Pressable onPress={() => handleEdit(item)} style={styles.cardAction}>
          <FontAwesome name="edit" size={18} color="#007BFF" />
          <Text style={styles.cardActionText}>Edit</Text>
        </Pressable>
        <Pressable onPress={() => deleteSchedule(item.task_id)} style={styles.cardAction}>
          <FontAwesome name="trash" size={18} color="#FF4D4F" />
          <Text style={styles.cardActionText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  const content = (
    <View style={styles.container}>
      <Text style={styles.title}>Scheduling</Text>
      <Text style={styles.description}>Configure schedules for optimal plant growth.</Text>
      <Button title="Add New Schedule" onPress={() => setModalVisible(true)} />
      <FlatList
        data={schedules}
        renderItem={renderItem}
        keyExtractor={i => i.task_id}
        style={styles.list}
      />

      <Modal visible={modalVisible} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Schedule' : 'Create New Schedule'}
              </Text>
            
            <View style={styles.cardsContainer}>
              
              <View style={styles.selectionCard}>
                <Text style={styles.cardLabel}>Action</Text>
                <ScrollView 
                  style={styles.actionScrollContainer}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {[
                    { label: 'Water Plants', value: 'START_WATERING', icon: 'opacity' },
                    { label: 'Turn On Lights', value: 'TURN_ON', icon: 'lightbulb-outline' },
                    { label: 'Turn Off Lights', value: 'TURN_OFF', icon: 'lightbulb' },
                    { label: 'Open Roof', value: 'OPEN_ROOF', icon: 'keyboard-arrow-up' },
                    { label: 'Close Roof', value: 'CLOSE_ROOF', icon: 'keyboard-arrow-down' },
                    { label: 'Heat Up', value: 'INCREASE_TEMPERATURE', icon: 'keyboard-arrow-up' },
                    { label: 'Cool Down', value: 'DECREASE_TEMPERATURE', icon: 'keyboard-arrow-down' }
                  ].map((item) => (
                    <Pressable
                      key={item.value}
                      style={[
                        styles.cardOption,
                        action === item.value && styles.cardOptionSelected
                      ]}
                      onPress={() => setAction(item.value)}
                    >
                      <MaterialIcons 
                        name={item.icon as any} 
                        size={18} 
                        color={action === item.value ? '#fff' : '#007BFF'} 
                      />
                      <Text style={[
                        styles.cardOptionText,
                        action === item.value && styles.cardOptionTextSelected
                      ]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                
                <View style={styles.selectedDisplay}>
                  <Text style={styles.selectedLabel}>Selected:</Text>
                  <Text style={styles.selectedValue}>
                    {getActionDisplayName(action).replace(/[^\w\s]/gi, '').trim()}
                  </Text>
                </View>
              </View>

              <View style={styles.selectionCard}>
                <Text style={styles.cardLabel}>Time</Text>
                <View style={styles.timePickerContainer}>
                  <View style={styles.timePickerColumn}>
                    <Text style={styles.timePickerTitle}>Hour</Text>
                    <ScrollView 
                      style={styles.timeScrollContainer}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={32}
                      decelerationRate="fast"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <Pressable
                          key={i}
                          style={[
                            styles.timePickerItem,
                            scheduleTime.getHours() === i && styles.timePickerItemSelected
                          ]}
                          onPress={() => {
                            const d = new Date(scheduleTime);
                            d.setHours(i);
                            setScheduleTime(d);
                          }}
                        >
                          <Text style={[
                            styles.timePickerItemText,
                            scheduleTime.getHours() === i && styles.timePickerItemTextSelected
                          ]}>
                            {String(i).padStart(2, '0')}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.timeSeparator}>
                    <Text style={styles.timeSeparatorText}>:</Text>
                  </View>

                  <View style={styles.timePickerColumn}>
                    <Text style={styles.timePickerTitle}>Min</Text>
                    <ScrollView 
                      style={styles.timeScrollContainer}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={32}
                      decelerationRate="fast"
                    >
                      {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                        <Pressable
                          key={minute}
                          style={[
                            styles.timePickerItem,
                            scheduleTime.getMinutes() === minute && styles.timePickerItemSelected
                          ]}
                          onPress={() => {
                            const d = new Date(scheduleTime);
                            d.setMinutes(minute);
                            setScheduleTime(d);
                          }}
                        >
                          <Text style={[
                            styles.timePickerItemText,
                            scheduleTime.getMinutes() === minute && styles.timePickerItemTextSelected
                          ]}>
                            {String(minute).padStart(2, '0')}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </View>
                
                <View style={styles.selectedDisplay}>
                  <MaterialIcons name="schedule" size={16} color="#007BFF" />
                  <Text style={styles.selectedValue}>
                    {String(scheduleTime.getHours()).padStart(2, '0')}:
                    {String(scheduleTime.getMinutes()).padStart(2, '0')}
                  </Text>
                </View>
              </View>

              <View style={styles.selectionCard}>
                <Text style={styles.cardLabel}>Days</Text>
                <View style={styles.weekdayContainer}>
                  {[
                    { label: 'Mon', value: 1 },
                    { label: 'Tue', value: 2 },
                    { label: 'Wed', value: 3 },
                    { label: 'Thu', value: 4 },
                    { label: 'Fri', value: 5 },
                    { label: 'Sat', value: 6 },
                    { label: 'Sun', value: 0 }
                  ].map((day) => (
                    <Pressable
                      key={day.value}
                      style={[
                        styles.weekdayButton,
                        selectedDays.includes(day.value) && styles.weekdayButtonSelected
                      ]}
                      onPress={() => {
                        if (selectedDays.includes(day.value)) {
                          setSelectedDays(selectedDays.filter(d => d !== day.value));
                        } else {
                          setSelectedDays([...selectedDays, day.value]);
                        }
                      }}
                    >
                      <Text style={[
                        styles.weekdayButtonText,
                        selectedDays.includes(day.value) && styles.weekdayButtonTextSelected
                      ]}>
                        {day.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.quickSelectContainer}>
                  <Pressable
                    style={styles.quickSelectButton}
                    onPress={() => setSelectedDays([1, 2, 3, 4, 5])}
                  >
                    <Text style={styles.quickSelectText}>Weekdays</Text>
                  </Pressable>
                  <Pressable
                    style={styles.quickSelectButton}
                    onPress={() => setSelectedDays([6, 0])}
                  >
                    <Text style={styles.quickSelectText}>Weekend</Text>
                  </Pressable>
                  <Pressable
                    style={styles.quickSelectButton}
                    onPress={() => setSelectedDays([1, 2, 3, 4, 5, 6, 0])}
                  >
                    <Text style={styles.quickSelectText}>Every Day</Text>
                  </Pressable>
                </View>
                
                <View style={styles.selectedDisplay}>
                  <MaterialIcons name="event" size={16} color="#007BFF" />
                  <Text style={styles.selectedValue}>
                    {selectedDays.length === 7 ? 'Every day' : 
                     selectedDays.length === 5 && selectedDays.every(d => [1,2,3,4,5].includes(d)) ? 'Weekdays' :
                     selectedDays.length === 2 && selectedDays.every(d => [6,0].includes(d)) ? 'Weekends' :
                     `${selectedDays.length} day${selectedDays.length !== 1 ? 's' : ''}`}
                  </Text>
                </View>
              </View>
            </View>
              <View style={styles.modalActions}>
                <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.confirmButton} onPress={handleSubmit}>
                  <Text style={styles.confirmButtonText}>
                    {editingId ? 'Update' : 'Create'} Schedule
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );

  if (Platform.OS === 'android') {
    return (
      <DrawerLayoutAndroid
        drawerWidth={300}
        renderNavigationView={() => <ScrollView><Sidebar/></ScrollView>}
      >{content}</DrawerLayoutAndroid>
    );
  }
  return <View style={{flex:1, flexDirection:'row'}}><Sidebar/><ScrollView style={{flex:1}}>{content}</ScrollView></View>;
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  description: { 
    fontSize: 16, 
    color: '#666', 
    marginBottom: 16 
  },
  list: { 
    marginTop: 16 
  },

  card: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 16, 
    marginBottom: 12, 
    flexDirection: 'column' 
  },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    gap: 12 
  },
  cardInfo: { 
    flex: 1, 
    marginLeft: 12 
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 6 
  },
  cardSubtitle: { 
    fontSize: 16, 
    color: '#666' 
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: 16, 
    gap: 20 
  },
  cardAction: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    borderRadius: 6, 
    backgroundColor: '#F8F9FA' 
  },
  cardActionText: { 
    marginLeft: 8, 
    fontSize: 14, 
    fontWeight: '500' 
  },

  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '95%',
    maxWidth: 500,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    alignSelf: 'center',
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 16, 
    textAlign: 'center', 
    color: '#333' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 4, 
    padding: 8, 
    marginBottom: 16 
  },
  modalActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 16, 
    gap: 12 
  },
  timeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 4,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: { 
    fontSize: 18, 
    color: '#007BFF' 
  },
  
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  customPickerContainer: {
    marginBottom: 20,
    minHeight: 80,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    paddingVertical: 6,
  },
  customPickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 6,
    marginHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  customPickerOptionSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  customPickerOptionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  customPickerOptionTextSelected: {
    color: '#fff',
  },
  
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timePickerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#007BFF',
  },
  timeScrollContainer: {
    maxHeight: 120,
    width: '100%',
  },
  timePickerItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timePickerItemSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  timePickerItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  timePickerItemTextSelected: {
    color: '#fff',
  },
  timeSeparator: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  timeSeparatorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  
  selectedTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    marginBottom: 12,
  },
  selectedTimeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007BFF',
    marginLeft: 6,
  },
  selectedDaysText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  
  confirmButton: {
    flex: 1,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  
  weekdayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  weekdayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekdayButtonSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  weekdayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  weekdayButtonTextSelected: {
    color: '#fff',
  },
  
  quickSelectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  quickSelectButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickSelectText: {
    fontSize: 12,
    color: '#007BFF',
    fontWeight: '500',
  },

  cardsContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 16,
    marginBottom: 20,
    flexWrap: Platform.OS === 'web' ? 'wrap' : 'nowrap',
  },
  selectionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: Platform.OS === 'web' ? 1 : undefined,
    minWidth: Platform.OS === 'web' ? 150 : undefined,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardOptionSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  cardOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  cardOptionTextSelected: {
    color: '#fff',
  },
  actionScrollContainer: {
    maxHeight: 200,
    marginBottom: 12,
  },
  selectedDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginTop: 8,
  },
  selectedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  selectedValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
    marginLeft: 4,
  },
});

export default Scheduling;