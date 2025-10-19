import { LocationService } from '@/services/locationService';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider } from '../contexts/authContext';
import './globals.css';

export default function RootLayout() {
  
  useEffect(() => {
    const initializeLocationTracking = async () => {
      await LocationService.initializeBackgroundTracking();
    };

    initializeLocationTracking();
  }, []);

  return (
    <AuthProvider>
      
      <StatusBar style="auto" />
      
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="(details)" 
          options={{ headerShown: false }}
        />
      </Stack>
    </AuthProvider>
  );
}