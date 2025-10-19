import { LocationService } from '@/services/locationService';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AuthProvider } from '../contexts/authContext';
import './globals.css';

export default function RootLayout() {
  const [hasCheckedPermissions, setHasCheckedPermissions] = useState(false);
  
  useEffect(() => {
    const initializeLocationTracking = async () => {
      const success = await LocationService.initializeBackgroundTracking();
      
      if (success) {
        setTimeout(() => {
          LocationService.checkAndPromptForAlwaysPermission();
        }, 5000);
      }
      
      setHasCheckedPermissions(true);
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