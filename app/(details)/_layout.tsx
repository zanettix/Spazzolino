import { Stack } from 'expo-router';

export default function DetailsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="[item]" 
        options={{ 
          headerShown: false,
          presentation: 'modal' // Presenta come modal per una migliore UX
        }} 
      />
    </Stack>
  );
}