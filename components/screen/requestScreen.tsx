import { useAuth } from '@/hooks/useAuth';
import { RequestService } from '@/services/requestService';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface RequestItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RequestItemModal({ visible, onClose, onSuccess }: RequestItemModalProps) {
  const { user } = useAuth();
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!itemName.trim()) {
      Alert.alert('Errore', 'Inserisci il nome dell\'oggetto');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Errore', 'Inserisci una descrizione');
      return;
    }

    if (description.trim().length < 20) {
      Alert.alert('Errore', 'La descrizione deve contenere almeno 20 caratteri');
      return;
    }

    if (!user) {
      Alert.alert('Errore', 'Devi essere autenticato per inviare una richiesta');
      return;
    }

    setLoading(true);

    const requestData = {
      item: itemName,
      content: description
    };

    const result = await RequestService.createRequest(requestData, user.id);

    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Richiesta inviata!',
        'Grazie per il tuo suggerimento. Valuteremo la tua proposta e, se approvata, l\'oggetto verrà aggiunto al catalogo.',
        [
          {
            text: 'OK',
            onPress: () => {
              setItemName('');
              setDescription('');
              onClose();
              onSuccess?.();
            }
          }
        ]
      );
    } else {
      Alert.alert('Errore', result.error || 'Impossibile inviare la richiesta');
    }
  };

  const handleClose = () => {
    setItemName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ maxHeight: '75%' }}
        >
          <View className="bg-white rounded-t-3xl" style={{ minHeight: 400 }}>
            <View className="p-4 border-b border-neutral-200">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-neutral-900">
                  Suggerisci oggetto
                </Text>
                <TouchableOpacity
                  onPress={handleClose}
                  className="w-7 h-7 rounded-full bg-neutral-100 items-center justify-center"
                  disabled={loading}
                >
                  <Text className="text-neutral-600 text-lg font-semibold">×</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView 
              className="p-4"
              style={{ maxHeight: 350 }}
              showsVerticalScrollIndicator={false}
            >
              <View className="mb-4">
                <Text className="text-xs font-semibold text-neutral-700 mb-1.5">
                  Nome oggetto *
                </Text>
                <TextInput
                  className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-900"
                  placeholder="es. Filtro macchina caffè"
                  placeholderTextColor="#a3a3a3"
                  value={itemName}
                  onChangeText={setItemName}
                  maxLength={50}
                  editable={!loading}
                />
                <Text className="text-xs text-neutral-500 mt-1">
                  {itemName.length}/50 caratteri
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-xs font-semibold text-neutral-700 mb-1.5">
                  Descrizione *
                </Text>
                <TextInput
                  className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-900"
                  style={{ height: 100 }}
                  placeholder="Spiega perché questo oggetto dovrebbe essere sostituito periodicamente e con quale frequenza."
                  placeholderTextColor="#a3a3a3"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  maxLength={500}
                  editable={!loading}
                />
                <Text className="text-xs text-neutral-500 mt-1">
                  {description.length}/500 caratteri (minimo 20)
                </Text>
              </View>

              <View className="bg-primary-50 p-3 rounded-lg mb-4">
                <View className="flex-row items-start">
                  <Text className="text-primary-600 mr-2 text-sm">💡</Text>
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-primary-800 mb-0.5">
                      Suggerimento
                    </Text>
                    <Text className="text-xs text-primary-700 leading-4">
                      Più dettagli fornisci, maggiori sono le probabilità di approvazione. 
                      Indica la frequenza consigliata e, se possibile, cita fonti affidabili.
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View className="p-4 border-t border-neutral-200">
              <TouchableOpacity
                className={`rounded-lg py-3 items-center ${
                  loading || !itemName.trim() || description.trim().length < 20
                    ? 'bg-neutral-300'
                    : 'bg-primary-500'
                }`}
                onPress={handleSubmit}
                disabled={loading || !itemName.trim() || description.trim().length < 20}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-sm">
                    Invia
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}