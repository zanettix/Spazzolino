import { useNotifications } from '@/hooks/useNotifications';
import { ItemService } from '@/services/itemService';
import { StatsService } from '@/services/statsService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

interface RenewItemBtnProps {
  itemName: string;
  currentDuration?: number;
  disabled?: boolean;
}

const RenewItemBtn: React.FC<RenewItemBtnProps> = ({
  itemName,
  currentDuration,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { hasPermissions } = useNotifications();
  const router = useRouter();

  const handleRenewPress = () => {
    Alert.alert(
      "Oggetto scaduto",
      `${itemName} è scaduto. Cosa vuoi fare?`,
      [
        {
          text: "Elimina",
          style: "destructive",
          onPress: handleDelete
        },
        {
          text: "Annulla",
          style: "cancel"
        },
        {
          text: "Rinnova",
          onPress: handleRenew
        }
      ]
    );
  };

  const handleRenew = async () => {
    setIsLoading(true);
    
    try {
      const { data: userItems } = await ItemService.getUserItems();
      const currentItem = userItems?.find(i => i.name === itemName);
      
      if (currentItem?.id) {
        await StatsService.recordHeatmapCompletion(currentItem.id);
        await StatsService.incrementReplacementCount(itemName);
      }

      await ItemService.deactivateItem(itemName);
      
      const { success, error, item } = await ItemService.activateItem(itemName, currentDuration);
      
      if (success && item) {
        Alert.alert(
          'Rinnovo completato',
          `${itemName} è stato rinnovato!\n\nRiceverai notifiche:\n• 7 giorni prima della scadenza\n• Il giorno della sostituzione\n\nNuova scadenza: ${new Date(item.expired_at).toLocaleDateString('it-IT')}`,
          [{ 
            text: 'OK',
            onPress: () => router.back()
          }]
        );
      } else {
        Alert.alert(
          'Errore durante il rinnovo',
          error || 'Si è verificato un errore imprevisto. Riprova.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Errore',
        'Si è verificato un errore imprevisto durante il rinnovo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      const { data: userItems } = await ItemService.getUserItems();
      const currentItem = userItems?.find(i => i.name === itemName);
      
      if (currentItem?.id) {
        await StatsService.recordHeatmapCompletion(currentItem.id);
      }

      const { success, error } = await ItemService.deactivateItem(itemName);
      
      if (success) {
        Alert.alert(
          'Oggetto eliminato',
          `${itemName} è stato rimosso dai tuoi oggetti attivi.`,
          [{ 
            text: 'OK',
            onPress: () => router.back()
          }]
        );
      } else {
        Alert.alert(
          'Errore durante l\'eliminazione',
          error || 'Si è verificato un errore durante l\'eliminazione.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Errore',
        'Si è verificato un errore imprevisto durante l\'eliminazione.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity
        className={`bg-warning py-4 rounded-2xl shadow-sm ${disabled || isLoading ? 'opacity-50' : 'opacity-100'}`}
        onPress={handleRenewPress}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-center">
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="refresh" size={24} color="white" />
          )}
          <Text className="text-white font-inter-semibold text-lg ml-3">
            {isLoading ? "Elaborazione..." : "Oggetto scaduto"}
          </Text>
        </View>
      </TouchableOpacity>

      <View className="mt-2 flex-row items-center justify-center">
        <Ionicons name="alert-circle" size={16} color="#f59e0b" />
        <Text className="ml-2 text-sm font-inter-medium text-warning">
          Questo oggetto ha superato la data di scadenza
        </Text>
      </View>
    </View>
  );
};

export default RenewItemBtn;