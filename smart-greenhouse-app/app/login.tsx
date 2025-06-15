declare global {
  interface Window {
    google: any;
  }
}
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, useWindowDimensions, Alert, Platform, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import * as AuthSession from 'expo-auth-session';
import {
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export default function Login() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const router = useRouter();

  interface CredentialResponse {
    credential: string;
  }

  interface LoginResponse {
    access_token: string;
  }

  async function handleCredentialResponse(response: CredentialResponse): Promise<void> {
      const idToken = response.credential;
      AsyncStorage.setItem('access_token', idToken);
      try {
        const res = await fetch('http://localhost:3000/api/auth/login/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: idToken }),
        });

        const responseText = await res.text();

        if (res.ok) {
          const data: LoginResponse = JSON.parse(responseText);
          await AsyncStorage.setItem('access_token', data.access_token);
          Alert.alert('Login Successful', 'You have been logged in successfully!');
          router.push('/dashboard');
        } else {
          Alert.alert('Login Failed', 'An error occurred during login. Please check the server response.');
        }
      } catch (error) {
        console.error('Login error:', error);
        Alert.alert('Error', 'An error occurred while logging in. Please try again.');
      }
    }

  const redirectUri = AuthSession.makeRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: '12068635644-6qnjc47pg2944ohf1uo3osgjtgbbljuk.apps.googleusercontent.com',
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: 'id_token',
      usePKCE: false // Explicitly disable PKCE to avoid sending code_challenge_method
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success' && response.params?.id_token) {
      const idToken = response.params.id_token;
      console.log('Google ID Token:', idToken);
      (async () => {
        const res = await fetch('http://localhost:3000/api/auth/login/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: idToken }),
        });

        const responseText = await res.text();

        if (res.ok) {
          const data = JSON.parse(responseText);
          await AsyncStorage.setItem('access_token', data.access_token);
          Alert.alert('Login Successful', 'You have been logged in successfully!');
          router.push('/dashboard');
        } else {
          Alert.alert('Login Failed', 'Server rejected the login attempt.');
        }
      })();
    }
  }, [response]);

  const handleMobileLogin = () => {
    router.push('/dashboard');
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: '12068635644-6qnjc47pg2944ohf1uo3osgjtgbbljuk.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { theme: 'outline', size: 'large', style: styles.ssoButton }
        );
      };
      document.body.appendChild(script);

      const googleButtonContainer = document.getElementById('google-signin-button');
      if (googleButtonContainer) {
        googleButtonContainer.style.display = 'flex';
        googleButtonContainer.style.justifyContent = 'center';
        googleButtonContainer.style.alignItems = 'center';
        googleButtonContainer.style.padding = '10px';
        googleButtonContainer.style.borderRadius = '5px';
        googleButtonContainer.style.marginBottom = '10px';
        googleButtonContainer.style.width = '90%';
      }
    }
  }, []);

  return (
    <View style={[styles.container, !isLargeScreen && styles.backgroundImageContainer]}>
      {(!isLargeScreen && (
        <ImageBackground
          source={require('../assets/images/icon.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      ))}

      <View style={[styles.leftPane, isLargeScreen && styles.leftPaneLarge]}>
        {!isLargeScreen && (
          <ImageBackground
            source={require('../assets/images/icon.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.whiteContainer}>
          <Text style={styles.title}>Smart Greenhouse</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
          <Text style={styles.description}>Welcome back!</Text>

          {Platform.OS === 'web' ? (
            <div id="google-signin-button" style={{ marginBottom: 10, width: '90%' }}></div>
          ) : (
           <TouchableOpacity onPress={handleMobileLogin} style={styles.ssoButton}>
             <GoogleSigninButton
               style={{ width: '100%', height: 48 }}
               size={GoogleSigninButton.Size.Wide}
               color={GoogleSigninButton.Color.Light}
               onPress={() => {
                 promptAsync();
               }}
             />
           </TouchableOpacity>

          )}
        </View>
      </View>

      {isLargeScreen && (
        <ImageBackground
          source={require('../assets/images/icon.png')}
          style={styles.rightPane}
          resizeMode="cover"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backgroundImageContainer: {
    flexDirection: 'column',
  },
  leftPane: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  leftPaneLarge: {
    flex: 1,
  },
  rightPane: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
    borderRadius: 20,
  },
  whiteContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
  },
  ssoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '90%',
    justifyContent: 'center',
    borderWidth: 1,
  },
  ssoText: {
    marginLeft: 10,
    fontSize: 14,
  },
  icon: {
    marginRight: 10,
  },
});