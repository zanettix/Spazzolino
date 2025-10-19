import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export default function LogoutBtn() {
  const { signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Sei sicuro di voler uscire dal tuo account?",
      [
        {
          text: "Annulla",
          style: "cancel"
        },
        {
          text: "Esci",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert(
                "Errore",
                "Si è verificato un errore durante il logout. Riprova."
              );
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      className="bg-white border border-red-200 rounded-xl py-4 shadow-sm"
      onPress={handleLogout}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-center">
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text className="text-red-500 font-semibold text-lg ml-2">
          Esci dall'account
        </Text>
      </View>
    </TouchableOpacity>
  );
}