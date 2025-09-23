// app/(details)/item.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthWrapper from '../../components/authForm';

export default function ItemScreen() {
  const { name, } = useLocalSearchParams();
  const router = useRouter();

  const handleAddToReminders = () => {
    // Qui implementerai la logica per aggiungere l'item ai promemoria
    console.log('Aggiungendo item:', name);
    // Torna indietro dopo l'aggiunta
    router.back();
  };

  return (
    <AuthWrapper 
      requireAuth={true}
      showCancelButton={true} // Mostra il bottone annulla
      onCancel={() => router.back()} // Torna indietro se annullato
    >
      <SafeAreaView className="flex-1 bg-neutral-50">
        {/* Header con back button */}
        <View className="flex-row items-center justify-between p-4 bg-white border-b border-neutral-200">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#525252" />
          </TouchableOpacity>
          
          <Text className="text-lg font-inter-semibold text-neutral-900">
            {name}
          </Text>
          
          <View className="w-10" />
        </View>

        {/* Content */}
        <View className="flex-1 p-6">
          <View className="bg-white rounded-xl p-6 mb-6">
            
            <Text className="text-neutral-600 font-inter mb-6">
              Stai per aggiungere questo oggetto ai tuoi promemoria personali. 
              Riceverai notifiche quando sarà il momento di sostituirlo.
            </Text>
            
            <TouchableOpacity 
              className="bg-primary-500 py-4 rounded-xl mb-4"
              onPress={handleAddToReminders}
            >
              <Text className="text-white font-inter-semibold text-center text-lg">
                Aggiungi ai promemoria
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </AuthWrapper>
  );
}