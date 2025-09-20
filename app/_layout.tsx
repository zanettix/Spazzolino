// app/_layout.tsx
import { Stack } from "expo-router";
import { AuthProvider } from '../contexts/authContext';
import './globals.css';

export default function RootLayout() {
  return (
    <AuthProvider>
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