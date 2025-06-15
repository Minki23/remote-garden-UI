import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Switch, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Platform,
  DrawerLayoutAndroid
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Sidebar } from './components/Sidebar';

interface Preferences {
  send_notifications: boolean;
  enable_automation: boolean;
  use_fahrenheit: boolean;
}

interface WiFiConfig {
  ssid: string;
  password: string;
}

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [wifiConfig, setWifiConfig] = useState<WiFiConfig>({
    ssid: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const [preferences, setPreferences] = useState<Preferences>({
    send_notifications: true,
    enable_automation: true,
    use_fahrenheit: false
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://${process.env.EXPO_PUBLIC_BACKEND_URL}/api/gardens/1/preferences`);
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWiFiConfig = async () => {
    if (!wifiConfig.ssid.trim()) {
      Alert.alert('Error', 'Please enter a WiFi network name (SSID)');
      return;
    }
    if (!wifiConfig.password.trim()) {
      Alert.alert('Error', 'Please enter the WiFi password');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`http://${process.env.EXPO_PUBLIC_BACKEND_URL}/api/gardens/1/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wifiConfig),
      });

      if (response.ok) {
        Alert.alert('Success', 'WiFi configuration updated successfully!');
        setWifiConfig({ ssid: '', password: '' });
      } else {
        Alert.alert('Error', 'Failed to update WiFi configuration');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://${process.env.EXPO_PUBLIC_BACKEND_URL}/api/gardens/1/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        Alert.alert('Success', 'Preferences saved successfully!');
      } else {
        Alert.alert('Error', 'Failed to save preferences');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const SettingCard = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialIcons name={icon as any} size={24} color="#007BFF" />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardContent}>
        {children}
      </View>
    </View>
  );

  if (loading) {
    const loadingContent = (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading settings...</Text>
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
          {loadingContent}
        </DrawerLayoutAndroid>
      );
    }

    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Sidebar />
        <ScrollView style={{ flex: 1 }}>
          {loadingContent}
        </ScrollView>
      </View>
    );
  }

  const content = (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <MaterialIcons name="settings" size={32} color="#007BFF" />
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your smart greenhouse</Text>
      </View>

      {/* WiFi Configuration Card */}
      <SettingCard title="WiFi Configuration" icon="wifi">
        <Text style={styles.description}>
          Configure your greenhouse's WiFi connection to ensure reliable connectivity.
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Network Name (SSID)</Text>
          <TextInput
            style={styles.input}
            value={wifiConfig.ssid}
            onChangeText={(text) => setWifiConfig(prev => ({ ...prev, ssid: text }))}
            placeholder="Enter WiFi network name"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={wifiConfig.password}
              onChangeText={(text) => setWifiConfig(prev => ({ ...prev, password: text }))}
              placeholder="Enter WiFi password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons 
                name={showPassword ? "visibility-off" : "visibility"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveWiFiConfig}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialIcons name="wifi" size={20} color="white" />
              <Text style={styles.saveButtonText}>Update WiFi</Text>
            </>
          )}
        </TouchableOpacity>
      </SettingCard>

      <SettingCard title="Garden Preferences" icon="tune">
        <Text style={styles.description}>
          Customize how your smart greenhouse operates and communicates with you.
        </Text>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceLeft}>
            <MaterialIcons name="notifications" size={20} color="#007BFF" />
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Push Notifications</Text>
              <Text style={styles.preferenceSubtitle}>
                Receive alerts about your garden's status
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.send_notifications}
            onValueChange={(value) => setPreferences(prev => ({ ...prev, send_notifications: value }))}
            trackColor={{ false: '#ccc', true: '#007BFF' }}
            thumbColor={preferences.send_notifications ? '#fff' : '#fff'}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceLeft}>
            <MaterialIcons name="autorenew" size={20} color="#007BFF" />
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Automation</Text>
              <Text style={styles.preferenceSubtitle}>
                Allow automatic watering and climate control
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.enable_automation}
            onValueChange={(value) => setPreferences(prev => ({ ...prev, enable_automation: value }))}
            trackColor={{ false: '#ccc', true: '#007BFF' }}
            thumbColor={preferences.enable_automation ? '#fff' : '#fff'}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceLeft}>
            <MaterialIcons name="thermostat" size={20} color="#007BFF" />
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Temperature Unit</Text>
              <Text style={styles.preferenceSubtitle}>
                {preferences.use_fahrenheit ? 'Fahrenheit (°F)' : 'Celsius (°C)'}
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.use_fahrenheit}
            onValueChange={(value) => setPreferences(prev => ({ ...prev, use_fahrenheit: value }))}
            trackColor={{ false: '#ccc', true: '#007BFF' }}
            thumbColor={preferences.use_fahrenheit ? '#fff' : '#fff'}
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={savePreferences}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Preferences</Text>
            </>
          )}
        </TouchableOpacity>
      </SettingCard>

      <View style={styles.infoCard}>
        <MaterialIcons name="info" size={20} color="#2196F3" />
        <Text style={styles.infoText}>
          Changes to WiFi configuration will require your greenhouse device to restart. 
          Automation settings take effect immediately.
        </Text>
      </View>
    </ScrollView>
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
      <ScrollView style={{ flex: 1 }}>
        {content}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  cardContent: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  saveButton: {
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceText: {
    marginLeft: 12,
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  preferenceSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
    marginLeft: 12,
  },
});

export default Settings;