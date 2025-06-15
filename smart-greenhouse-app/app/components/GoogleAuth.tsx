import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

GoogleSignin.configure({
  offlineAccess: true,
  webClientId: "12068635644-r52lripd5eorg4326s992i55ckb0ob2g.apps.googleusercontent.com",
});

const GoogleAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);



  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await GoogleSignin.hasPlayServices();
      const userInfo: any = await GoogleSignin.signIn();
      setUser(userInfo);
      
      const { accessToken, idToken } = await GoogleSignin.getTokens();
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
      
    } catch (error: any) {
      setError(error.message);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Sign in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available');
      } else {
        console.error('Sign-in error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
  };
};

export default GoogleAuth;