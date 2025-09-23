import { ItemService } from '@/services/itemService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

interface ActivateItemBtnProps {
  itemName: string;
  customDuration?: number; // Durata personalizzata (opzionale)
  onSuccess?: () => void; // Callback dopo attivazione successful
  onError?: (error: string) => void; // Callback per gestire errori
  disabled?: boolean;
}

const ActivateItemBtn: React.FC<ActivateItemBtnProps> = ({
  itemName,
  customDuration,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Controlla se l'oggetto è già attivato al mount del componente
  useEffect(() => {
    checkItemStatus();
  }, [itemName]);

  const checkItemStatus = async () => {
    setCheckingStatus(true);
    try {
      const { activated, error } = await ItemService.isItemActivated(itemName);
      if (error) {
        console.warn('Errore controllo stato:', error);
      } else {
        setIsActivated(activated);
      }
    } catch (err) {
      console.warn('Errore generico controllo stato:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleAddToReminders = async () => {
    if (isActivated) {
      // Se già attivato, chiedi conferma per disattivare
      Alert.alert(
        "Oggetto già attivato",
        "Vuoi disattivare i promemoria per questo oggetto?",
        [
          { text: "Annulla", style: "cancel" },
          { text: "Disattiva", style: "destructive", onPress: handleDeactivate }
        ]
      );
      return;
    }

    // Attiva l'oggetto
    setIsLoading(true);
    try {
      const result = await ItemService.activateItem(itemName, customDuration);
      
      if (result.success) {
        setIsActivated(true);
        onSuccess?.();
        
        Alert.alert(
          "✅ Attivato!",
          "Promemoria attivato con successo. Riceverai notifiche quando sarà ora di sostituire questo oggetto.",
          [{ text: "OK" }]
        );
      } else {
        const errorMessage = result.error || 'Errore sconosciuto';
        onError?.(errorMessage);
        
        // Gestione errori specifici con messaggi user-friendly
        let userMessage = errorMessage;
        if (errorMessage.includes('già attivato')) {
          userMessage = "Hai già attivato questo oggetto!";
        } else if (errorMessage.includes('non trovato')) {
          userMessage = "Oggetto non disponibile.";
        }
        
        Alert.alert("❌ Errore", userMessage, [{ text: "OK" }]);
      }
    } catch (err) {
      const errorMsg = 'Errore di connessione. Riprova più tardi.';
      onError?.(errorMsg);
      Alert.alert("❌ Errore", errorMsg, [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setIsLoading(true);
    try {
      const result = await ItemService.deactivateItem(itemName);
      
      if (result.success) {
        setIsActivated(false);
        Alert.alert("✅ Disattivato", "Promemoria disattivato con successo.", [{ text: "OK" }]);
      } else {
        Alert.alert("❌ Errore", result.error || 'Errore nella disattivazione', [{ text: "OK" }]);
      }
    } catch (err) {
      Alert.alert("❌ Errore", 'Errore di connessione. Riprova più tardi.', [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Determina il testo e l'icona del bottone
  const getButtonContent = () => {
    if (checkingStatus) {
      return {
        text: "Controllo...",
        icon: "hourglass" as const,
        showLoader: false
      };
    }
    
    if (isActivated) {
      return {
        text: isLoading ? "Disattivando..." : "Attivato",
        icon: "checkmark-circle" as const,
        showLoader: isLoading
      };
    }
    
    return {
      text: isLoading ? "Attivando..." : "Attiva Promemoria",
      icon: "notifications" as const,
      showLoader: isLoading
    };
  };

  const buttonContent = getButtonContent();
  const isButtonDisabled = disabled || isLoading || checkingStatus;

  return (
    <TouchableOpacity
      className={`bg-primary-500 py-4 rounded-2xl shadow-sm ${isButtonDisabled ? 'opacity-50' : 'opacity-100'}`}
      onPress={handleAddToReminders}
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
  );
};

export default ActivateItemBtn;