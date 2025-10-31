import { useNotifications } from '@/hooks/useNotifications';
import { ItemService } from '@/services/itemService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

interface ActivateItemBtnProps {
  itemName: string;
  customDuration?: number;
  disabled?: boolean;
  onSuccess?: () => void | Promise<void>;
}

const ActivateItemBtn: React.FC<ActivateItemBtnProps> = ({
  itemName,
  customDuration,
  disabled = false,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  const { hasPermissions, requestPermissions, isInitialized } = useNotifications();

  useEffect(() => {
    checkItemStatus();
  }, [itemName]);

  const checkItemStatus = async () => {
    setCheckingStatus(true);
    const { activated, error } = await ItemService.isItemActivated(itemName);
    
    if (error) {
      Alert.alert('Errore', 'Impossibile verificare lo stato dell\'oggetto');
    } else {
      setIsActivated(activated);
    }
    setCheckingStatus(false);
  };

  const handleToggleActivation = async () => {
    if (isActivated) {
      Alert.alert(
        "Oggetto già attivato",
        "Vuoi disattivare i promemoria per questo oggetto? Non riceverai più notifiche per questo elemento.",
        [
          { text: "Annulla", style: "cancel" },
          { text: "Disattiva", style: "destructive", onPress: deactivateItem }
        ]
      );
    } else {
      await checkNotificationPermissionsAndActivate();
    }
  };

  const checkNotificationPermissionsAndActivate = async () => {
    if (!isInitialized) {
      Alert.alert(
        'Sistema non pronto',
        'Il sistema di notifiche non è ancora inizializzato. Riprova tra qualche secondo.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!hasPermissions) {
      Alert.alert(
        'Permessi notifiche richiesti',
        `Per attivare ${itemName} e ricevere promemoria quando è il momento di sostituirlo, è necessario abilitare le notifiche.\n\nVuoi abilitarle ora?`,
        [
          { 
            text: 'No, attiva senza notifiche', 
            style: 'cancel',
            onPress: () => {
              Alert.alert(
                'Attenzione',
                'Senza notifiche non riceverai promemoria per sostituire questo oggetto. Puoi sempre attivarle in seguito dalle impostazioni.',
                [
                  { text: 'Annulla', style: 'cancel' },
                  { text: 'Procedi comunque', onPress: activateItem }
                ]
              );
            }
          },
          {
            text: 'Sì, abilita notifiche',
            onPress: async () => {
              const granted = await requestPermissions();
              if (granted) {
                activateItem();
              } else {
                Alert.alert(
                  'Permessi negati',
                  'Non è possibile abilitare le notifiche. Puoi comunque attivare l\'oggetto, ma non riceverai promemoria.',
                  [
                    { text: 'Annulla', style: 'cancel' },
                    { text: 'Attiva senza notifiche', onPress: activateItem }
                  ]
                );
              }
            }
          }
        ]
      );
      return;
    }

    activateItem();
  };

  const activateItem = async () => {
    setIsLoading(true);
    
    try {
      const { success, error, item } = await ItemService.activateItem(itemName, customDuration);
      
      if (success && item) {
        setIsActivated(true);
        
        if (onSuccess) {
          await onSuccess();
        }
        
        Alert.alert(
          'Attivazione completata',
          `Riceverai notifiche:\n• 7 giorni prima della scadenza\n• Il giorno della sostituzione\n\nScadenza: ${new Date(item.expired_at).toLocaleDateString('it-IT')}`,
          [{ text: 'Perfetto!' }]
        );
      } else {
        Alert.alert(
          'Errore durante l\'attivazione',
          error || 'Si è verificato un errore imprevisto. Riprova.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Errore',
        'Si è verificato un errore imprevisto durante l\'attivazione.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateItem = async () => {
    setIsLoading(true);
    
    try {
      const { success, error } = await ItemService.deactivateItem(itemName);
      
      if (success) {
        setIsActivated(false);
        
        if (onSuccess) {
          await onSuccess();
        }
      }
      
    } catch (error) {
      Alert.alert(
        'Errore',
        'Si è verificato un errore imprevisto durante la disattivazione.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (checkingStatus) {
      return {
        text: "Controllo...",
        icon: "hourglass" as const,
        showLoader: false,
        bgColor: "bg-neutral-400"
      };
    }
    
    if (isActivated) {
      return {
        text: isLoading ? "Disattivando..." : "Attivato",
        icon: "checkmark-circle" as const,
        showLoader: isLoading,
        bgColor: "bg-success"
      };
    }
    
    return {
      text: isLoading ? "Attivando..." : "Attiva Promemoria",
      icon: "notifications" as const,
      showLoader: isLoading,
      bgColor: "bg-primary-500"
    };
  };

  const buttonContent = getButtonContent(); 
  const isButtonDisabled = disabled || isLoading || checkingStatus;

  return (
    <View>
      <TouchableOpacity
        className={`${buttonContent.bgColor} py-4 rounded-2xl shadow-sm ${isButtonDisabled ? 'opacity-50' : 'opacity-100'}`}
        onPress={handleToggleActivation}
        disabled={isButtonDisabled}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-center">
          {buttonContent.showLoader ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name={buttonContent.icon} size={24} color="white" />
          )}
          <Text className="text-white font-inter-semibold text-lg ml-3">
            {buttonContent.text}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ActivateItemBtn;