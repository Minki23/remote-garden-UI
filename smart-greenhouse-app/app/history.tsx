import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl, 
  Platform, 
  DrawerLayoutAndroid,
  Pressable,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sidebar } from './components/Sidebar';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

interface Garden {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface Device {
  id: number;
  garden_id: number;
  mac: string;
  type: string;
  created_at: string;
  updated_at: string;
}

interface Reading {
  id: number;
  device_id: number;
  timestamp: string;
  value: any;
  created_at: string;
}

interface DeviceWithReadings {
  device: Device;
  readings: Reading[];
  isLoading: boolean;
  error?: string;
}

type FilterPeriod = 'all' | 'today' | 'week' | 'month';
type SortOrder = 'newest' | 'oldest';

const History = () => {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [selectedGarden, setSelectedGarden] = useState<Garden | null>(null);
  const [devicesWithReadings, setDevicesWithReadings] = useState<DeviceWithReadings[]>([]);
  const [isLoadingGardens, setIsLoadingGardens] = useState(true);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  useEffect(() => {
    fetchGardens();
  }, []);

  useEffect(() => {
    if (selectedGarden) {
      fetchDevicesAndReadings(selectedGarden.id);
    }
  }, [selectedGarden]);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const wsUrl = `ws://${process.env.EXPO_PUBLIC_BACKEND_URL}/ws/wsinit?Authorization=Bearer ${token}`;
        console.log('Connecting to WebSocket:', wsUrl);
        const socket = new WebSocket(wsUrl);
        setWs(socket);
        
        socket.onopen = () => {
          console.log('WebSocket connected');
          if (selectedGarden) {
            socket.send(JSON.stringify({
              type: 'subscribe',
              garden_id: selectedGarden.id
            }));
          }
        };
        
        socket.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            console.log('WebSocket message received:', data);
            
            switch (data.type || data.event) {
              case 'new_reading':
              case 'reading_update':
                if (data.reading || data.data) {
                  handleNewReading(data.reading || data.data);
                }
                break;
              case 'device_update':
                if (data.device) {
                  handleDeviceUpdate(data.device);
                }
                break;
              case 'garden_update':
                if (data.garden) {
                  handleGardenUpdate(data.garden);
                }
                break;
              default:
                console.log('Unknown message type:', data.type || data.event);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('WebSocket connection error');
        };
        
        socket.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          setTimeout(() => {
            if (!ws || ws.readyState === WebSocket.CLOSED) {
              console.log('Attempting to reconnect WebSocket...');
              fetchGardens();
            }
          }, 5000);
        };
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
      }
    })();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [selectedGarden]);

  const handleNewReading = (newReading: any) => {
    if (!newReading) {
      console.warn('No reading data received');
      return;
    }

    const reading = {
      id: newReading.id || Date.now(),
      device_id: newReading.device_id || newReading.deviceId || newReading.device?.id,
      timestamp: newReading.timestamp || newReading.created_at || new Date().toISOString(),
      value: newReading.value || newReading.data || newReading,
      created_at: newReading.created_at || newReading.timestamp || new Date().toISOString()
    };

    if (!reading.device_id) {
      console.warn('Invalid reading received - no device_id:', newReading);
      return;
    }

    console.log('Processing new reading for device:', reading.device_id, reading);
    
    setDevicesWithReadings(prevDevices => 
      prevDevices.map(deviceWithReadings => {
        if (deviceWithReadings.device.id === reading.device_id) {
          const existingReading = deviceWithReadings.readings.find(r => r.id === reading.id);
          if (existingReading) {
            console.log('Reading already exists, skipping duplicate');
            return deviceWithReadings;
          }

          const updatedReadings = [reading, ...deviceWithReadings.readings]
            .sort((a, b) => new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime())
            .slice(0, 1000);
          
          console.log(`Updated readings for device ${reading.device_id}, total count:`, updatedReadings.length);
          
          return {
            ...deviceWithReadings,
            readings: updatedReadings
          };
        }
        return deviceWithReadings;
      })
    );
  };

  const handleDeviceUpdate = (deviceUpdate: any) => {
    console.log('Device update received:', deviceUpdate);
    setDevicesWithReadings(prevDevices => 
      prevDevices.map(deviceWithReadings => {
        if (deviceWithReadings.device.id === deviceUpdate.id) {
          return {
            ...deviceWithReadings,
            device: { ...deviceWithReadings.device, ...deviceUpdate }
          };
        }
        return deviceWithReadings;
      })
    );
  };

  const handleGardenUpdate = (gardenUpdate: any) => {
    console.log('Garden update received:', gardenUpdate);
    setGardens(prevGardens => 
      prevGardens.map(garden => 
        garden.id === gardenUpdate.id ? { ...garden, ...gardenUpdate } : garden
      )
    );
  };

  const fetchGardens = async () => {
    try {
      setIsLoadingGardens(true);
      setError(null);
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await fetch(`http://${process.env.EXPO_PUBLIC_BACKEND_URL}/api/gardens/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch gardens: ${response.status}`);
      }

      const gardensData = await response.json();
      setGardens(gardensData);
      
      if (gardensData.length > 0 && !selectedGarden) {
        setSelectedGarden(gardensData[0]);
      }
    } catch (err) {
      console.error('Error fetching gardens:', err);
      setError('Failed to load gardens');
    } finally {
      setIsLoadingGardens(false);
    }
  };

  const fetchDevicesAndReadings = async (gardenId: number) => {
    try {
      setIsLoadingDevices(true);
      setError(null);
      const token = await AsyncStorage.getItem('access_token');
      
      const devicesResponse = await fetch(`http://${process.env.EXPO_PUBLIC_BACKEND_URL}/api/devices/${gardenId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!devicesResponse.ok) {
        throw new Error(`Failed to fetch devices: ${devicesResponse.status}`);
      }

      const devices: Device[] = await devicesResponse.json();
      
      const devicesWithLoadingState: DeviceWithReadings[] = devices.map(device => ({
        device,
        readings: [],
        isLoading: true
      }));
      
      setDevicesWithReadings(devicesWithLoadingState);

      const updatedDevices = await Promise.all(
        devices.map(async (device) => {
          try {
            const readingsResponse = await fetch(`http://${process.env.EXPO_PUBLIC_BACKEND_URL}/api/readings/device/${device.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (!readingsResponse.ok) {
              throw new Error(`Failed to fetch readings for device ${device.id}`);
            }

            const readings: Reading[] = await readingsResponse.json();
            
            return {
              device,
              readings: readings.sort((a, b) => new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime()),
              isLoading: false
            };
          } catch (err) {
            console.error(`Error fetching readings for device ${device.id}:`, err);
            return {
              device,
              readings: [],
              isLoading: false,
              error: `Failed to load readings`
            };
          }
        })
      );

      setDevicesWithReadings(updatedDevices);
    } catch (err) {
      console.error('Error fetching devices and readings:', err);
      setError('Failed to load device data');
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGardens();
    if (selectedGarden) {
      await fetchDevicesAndReadings(selectedGarden.id);
    }
    setRefreshing(false);
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SOIL_SENSOR':
        return 'seedling';
      case 'LIGHT':
        return 'lightbulb';
      case 'TEMPERATURE_SENSOR':
        return 'thermometer-half';
      case 'HUMIDITY_SENSOR':
        return 'tint';
      case 'CAMERA':
        return 'camera';
      default:
        return 'microchip';
    }
  };

  const getDeviceDisplayName = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SOIL_SENSOR':
        return 'Soil Sensor';
      case 'LIGHT':
        return 'Light Control';
      case 'TEMPERATURE_SENSOR':
        return 'Temperature Sensor';
      case 'HUMIDITY_SENSOR':
        return 'Humidity Sensor';
      case 'CAMERA':
        return 'Camera';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatReadingData = (data: any, deviceType: string) => {
    if (!data) return 'No data';
    
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return data;
      }
    }

    if (typeof data === 'object') {
      return Object.entries(data).map(([key, value]) => (
        `${key}: ${value}`
      )).join('\n');
    }

    return String(data);
  };

  const getFilteredReadings = (readings: Reading[]): Reading[] => {
    let filtered = [...readings];
    
    if (filterPeriod !== 'all') {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (filterPeriod) {
        case 'today':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        default:
          cutoffDate = new Date(0);
      }
      
      filtered = filtered.filter(reading => 
        new Date(reading.timestamp || reading.created_at) >= cutoffDate
      );
    }
    
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp || a.created_at).getTime();
      const dateB = new Date(b.timestamp || b.created_at).getTime();
      
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return filtered;
  };

  const calculateReadingStatistics = (readings: Reading[]) => {
    if (readings.length === 0) {
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        average: 0,
        latest: null,
        trend: 'stable'
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayReadings = readings.filter(r => 
      new Date(r.timestamp || r.created_at) >= today
    );

    const weekReadings = readings.filter(r => 
      new Date(r.timestamp || r.created_at) >= weekAgo
    );

    const numericValues = readings
      .map(r => {
        try {
          const data = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
          if (typeof data === 'number') return data;
          if (typeof data === 'object' && data !== null) {
            const values = Object.values(data).filter(v => typeof v === 'number');
            return values.length > 0 ? values[0] as number : null;
          }
          return null;
        } catch {
          return null;
        }
      })
      .filter(v => v !== null) as number[];

    const average = numericValues.length > 0 
      ? numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length 
      : 0;

    let trend = 'stable';
    if (numericValues.length >= 6) {
      const recent = numericValues.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
      const previous = numericValues.slice(3, 6).reduce((sum, val) => sum + val, 0) / 3;
      const change = ((recent - previous) / previous) * 100;
      
      if (change > 5) trend = 'increasing';
      else if (change < -5) trend = 'decreasing';
    }

    return {
      total: readings.length,
      today: todayReadings.length,
      thisWeek: weekReadings.length,
      average: Math.round(average * 100) / 100,
      latest: readings[0] || null,
      trend
    };
  };

  const renderStatistics = (deviceWithReadings: DeviceWithReadings) => {
    const stats = calculateReadingStatistics(deviceWithReadings.readings);
    const filteredReadings = getFilteredReadings(deviceWithReadings.readings);
    const filteredStats = calculateReadingStatistics(filteredReadings);
    
    return (
      <View style={styles.statisticsContainer}>
        <Text style={styles.statisticsTitle}>Statistics</Text>
        
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <MaterialIcons name="analytics" size={16} color="#007BFF" />
            <Text style={styles.statValue}>
              {filterPeriod === 'all' ? stats.total : filteredStats.total}
            </Text>
            <Text style={styles.statLabel}>
              {filterPeriod === 'all' ? 'Total' : 'Filtered'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialIcons name="today" size={16} color="#28A745" />
            <Text style={styles.statValue}>{stats.today}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <MaterialIcons name="date-range" size={16} color="#FFA726" />
            <Text style={styles.statValue}>{stats.thisWeek}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialIcons 
              name={stats.trend === 'increasing' ? 'trending-up' : 
                    stats.trend === 'decreasing' ? 'trending-down' : 'trending-flat'} 
              size={16} 
              color={stats.trend === 'increasing' ? '#28A745' : 
                     stats.trend === 'decreasing' ? '#DC3545' : '#6C757D'} 
            />
            <Text style={styles.statValue}>
              {stats.average > 0 ? stats.average : '-'}
            </Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
        </View>

        {stats.latest && (
          <View style={styles.latestReading}>
            <Text style={styles.latestLabel}>Latest:</Text>
            <Text style={styles.latestValue}>
              {formatTimestamp(stats.latest.timestamp || stats.latest.created_at)}
            </Text>
          </View>
        )}

        {filterPeriod !== 'all' && (
          <View style={styles.filterStatus}>
            <MaterialIcons name="filter-list" size={12} color="#FFA726" />
            <Text style={styles.filterStatusText}>
              Showing {filterPeriod} data
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderFilterPanel = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Filter Readings</Text>
      
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Time Period</Text>
        <View style={styles.filterOptionsRow}>
          {[
            { label: 'All', value: 'all' as FilterPeriod },
            { label: 'Today', value: 'today' as FilterPeriod },
            { label: 'Week', value: 'week' as FilterPeriod },
            { label: 'Month', value: 'month' as FilterPeriod }
          ].map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.filterOption,
                filterPeriod === option.value && styles.filterOptionSelected
              ]}
              onPress={() => setFilterPeriod(option.value)}
            >
              <Text style={[
                styles.filterOptionText,
                filterPeriod === option.value && styles.filterOptionTextSelected
              ]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterSectionTitle}>Sort Order</Text>
        <View style={styles.filterOptionsRow}>
          {[
            { label: 'Newest', value: 'newest' as SortOrder, icon: 'arrow-downward' },
            { label: 'Oldest', value: 'oldest' as SortOrder, icon: 'arrow-upward' }
          ].map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.filterOption,
                sortOrder === option.value && styles.filterOptionSelected
              ]}
              onPress={() => setSortOrder(option.value)}
            >
              <MaterialIcons 
                name={option.icon as any} 
                size={14} 
                color={sortOrder === option.value ? '#fff' : '#007BFF'} 
              />
              <Text style={[
                styles.filterOptionText,
                sortOrder === option.value && styles.filterOptionTextSelected
              ]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  const renderReading = ({ item: reading }: { item: Reading }) => (
    <View style={styles.readingCard}>
      <View style={styles.readingHeader}>
        <MaterialIcons name="schedule" size={16} color="#666" />
        <Text style={styles.readingTimestamp}>
          {formatTimestamp(reading.timestamp || reading.created_at)}
        </Text>
      </View>
      <View style={styles.readingData}>
        <Text style={styles.readingDataText}>
          {formatReadingData(reading.value, '')}
        </Text>
      </View>
    </View>
  );

  const renderDevice = ({ item: deviceWithReadings }: { item: DeviceWithReadings }) => (
    <View style={styles.deviceCard}>
      <View style={styles.deviceHeader}>
        <FontAwesome5 
          name={getDeviceIcon(deviceWithReadings.device.type)} 
          size={20} 
          color="#007BFF" 
        />
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>
            {getDeviceDisplayName(deviceWithReadings.device.type)}
          </Text>
          <Text style={styles.deviceMac}>MAC: {deviceWithReadings.device.mac}</Text>
          <Text style={styles.deviceDate}>
            Added: {formatTimestamp(deviceWithReadings.device.created_at)}
          </Text>
        </View>
        <View style={styles.readingsCount}>
          <Text style={styles.readingsCountText}>
            {deviceWithReadings.readings.length}
          </Text>
          <Text style={styles.readingsCountLabel}>readings</Text>
        </View>
      </View>

      {deviceWithReadings.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007BFF" />
          <Text style={styles.loadingText}>Loading readings...</Text>
        </View>
      ) : deviceWithReadings.error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={20} color="#FF4D4F" />
          <Text style={styles.errorText}>{deviceWithReadings.error}</Text>
        </View>
      ) : deviceWithReadings.readings.length === 0 ? (
        <View style={styles.noDataContainer}>
          <MaterialIcons name="info" size={20} color="#FFA726" />
          <Text style={styles.noDataText}>No readings available</Text>
        </View>
      ) : (
        <View style={styles.readingsAndStatsContainer}>
          <View style={styles.leftColumn}>
            {renderStatistics(deviceWithReadings)}
            {renderFilterPanel()}
          </View>
          
          <View style={styles.readingsContainer}>
            <Text style={styles.readingsHeader}>
              {(() => {
                const filteredReadings = getFilteredReadings(deviceWithReadings.readings);
                const periodText = filterPeriod === 'all' ? 'All' : 
                                 filterPeriod === 'today' ? 'Today\'s' :
                                 filterPeriod === 'week' ? 'This Week\'s' :
                                 'This Month\'s';
                return `${periodText} Readings (${filteredReadings.length})`;
              })()}
            </Text>
            <ScrollView 
              style={styles.readingsScrollContainer}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              <FlatList
                data={getFilteredReadings(deviceWithReadings.readings)}
                renderItem={renderReading}
                keyExtractor={(reading) => reading.id.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.noDataContainer}>
                    <MaterialIcons name="filter-list" size={20} color="#FFA726" />
                    <Text style={styles.noDataText}>
                      No readings match the current filter
                    </Text>
                  </View>
                }
              />
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );

  const content = (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      <Text style={styles.description}>
        View historical data from your greenhouse devices
      </Text>

      <View style={styles.gardenSection}>
        <Text style={styles.sectionTitle}>Gardens</Text>
        {isLoadingGardens ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={styles.loadingText}>Loading gardens...</Text>
          </View>
        ) : gardens.length === 0 ? (
          <View style={styles.noDataContainer}>
            <MaterialIcons name="info" size={24} color="#FFA726" />
            <Text style={styles.noDataText}>No gardens found</Text>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.gardenList}
          >
            {gardens.map((garden) => (
              <Pressable
                key={garden.id}
                style={[
                  styles.gardenCard,
                  selectedGarden?.id === garden.id && styles.gardenCardSelected
                ]}
                onPress={() => setSelectedGarden(garden)}
              >
                <MaterialIcons 
                  name="eco" 
                  size={24} 
                  color={selectedGarden?.id === garden.id ? '#fff' : '#007BFF'} 
                />
                <Text style={[
                  styles.gardenCardText,
                  selectedGarden?.id === garden.id && styles.gardenCardTextSelected
                ]}>
                  {garden.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {selectedGarden && (
        <View style={styles.devicesSection}>
          <Text style={styles.sectionTitle}>
            Devices in {selectedGarden.name}
          </Text>
          
          {isLoadingDevices ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007BFF" />
              <Text style={styles.loadingText}>Loading devices...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error" size={24} color="#FF4D4F" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : devicesWithReadings.length === 0 ? (
            <View style={styles.noDataContainer}>
              <MaterialIcons name="info" size={24} color="#FFA726" />
              <Text style={styles.noDataText}>No devices found in this garden</Text>
            </View>
          ) : (
            <FlatList
              data={devicesWithReadings}
              renderItem={renderDevice}
              keyExtractor={(item) => item.device.id.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      )}
    </View>
  );

  if (Platform.OS === 'android') {
    return (
      <DrawerLayoutAndroid
        drawerWidth={300}
        renderNavigationView={() => (
          <ScrollView>
            <Sidebar />
          </ScrollView>
        )}
      >
        {content}
      </DrawerLayoutAndroid>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <Sidebar />
      <ScrollView style={{ flex: 1 }} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        {content}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  
  gardenSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  gardenList: {
    maxHeight: 80,
  },
  gardenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minWidth: 140,
  },
  gardenCardSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  gardenCardText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  gardenCardTextSelected: {
    color: '#fff',
  },
  
  devicesSection: {
    flex: 1,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  deviceMac: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  deviceDate: {
    fontSize: 12,
    color: '#666',
  },
  readingsCount: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  readingsCountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  readingsCountLabel: {
    fontSize: 12,
    color: '#666',
  },
  
  readingsAndStatsContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    marginTop: 8,
    gap: 16,
    minHeight: Platform.OS === 'web' ? 300 : 'auto',
  },
  
  leftColumn: {
    flex: Platform.OS === 'web' ? 1 : undefined,
    flexDirection: 'column',
    gap: 16,
  },
  
  topControlsRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 16,
  },
  
  readingsContainer: {
    flex: Platform.OS === 'web' ? 2 : 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: Platform.OS === 'web' ? 300 : 200,
  },
  readingsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  readingsScrollContainer: {
    maxHeight: 380,
    flex: 1,
  },
  readingCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#007BFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  readingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  readingTimestamp: {
    marginLeft: 6,
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  readingData: {
    paddingLeft: 4,
  },
  readingDataText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  statisticsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statisticsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  latestReading: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  latestLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  latestValue: {
    fontSize: 10,
    color: '#007BFF',
    marginTop: 2,
    textAlign: 'center',
  },
  filterStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  filterStatusText: {
    fontSize: 10,
    color: '#FFA726',
    marginLeft: 4,
    fontStyle: 'italic',
  },

  filterContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007BFF',
    backgroundColor: '#F8F9FA',
    minWidth: 60,
    justifyContent: 'center',
  },
  filterOptionSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  filterOptionText: {
    fontSize: 11,
    color: '#007BFF',
    fontWeight: '500',
    marginLeft: 3,
  },
  filterOptionTextSelected: {
    color: '#fff',
  },

  moreReadingsText: {
    fontSize: 12,
    color: '#007BFF',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFF2F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCCC7',
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FF4D4F',
  },
  noDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFBE6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE58F',
  },
  noDataText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#AD6800',
  },
});

export default History;