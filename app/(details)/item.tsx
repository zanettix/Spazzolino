// app/(details)/item.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import AuthWrapper from '../../components/authWrapper';

export default function ItemScreen() {
  const { itemName, itemId } = useLocalSearchParams();
  const router = useRouter();

  const handleAddToReminders = () => {
    // Qui implementerai la logica per aggiungere l'item ai promemoria
    console.log('Aggiungendo item:', itemName);
    // Torna indietro dopo l'aggiunta
    router.back();
  };

  return (
    <AuthWrapper 
      requireAuth={true}
      fallbackMessage={`Accedi per aggiungere "${itemName}" ai tuoi promemoria`}
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
            Aggiungi Oggetto
          </Text>
          
          <View className="w-10" />
        </View>

        {/* Content */}
        <View className="flex-1 p-6">
          <View className="bg-white rounded-xl p-6 mb-6">
            <Text className="text-2xl font-inter-bold text-neutral-900 mb-2">
              {itemName}
            </Text>
            
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
          
          <View className="bg-primary-50 rounded-xl p-4">
            <Text className="text-primary-700 font-inter-medium mb-2">
              💡 Come funziona
            </Text>
            <Text className="text-primary-600 font-inter text-sm">
              Riceverai notifiche intelligenti basate su studi scientifici 
              per mantenere la tua salute e igiene al top.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </AuthWrapper>
  );
}