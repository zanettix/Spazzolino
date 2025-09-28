import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/authContext';
import './globals.css';

export default function RootLayout() {
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