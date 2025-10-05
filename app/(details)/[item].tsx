import AuthWrapper from '@/components/authForm';
import ActivateItemBtn from '@/components/button/activateItemBtn';
import RenewItemBtn from '@/components/button/renewItemBtn';
import { ItemService } from '@/services/itemService';
import { renderIcon } from '@/utils/iconRenderer';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Item() {
  const { 
    item, 
    description, 
    category, 
    duration, 
    link, 
    icon,
    icon_family
  } = useLocalSearchParams();
  
  const router = useRouter();
  
  const [customDuration, setCustomDuration] = useState(duration?.toString() || '');
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    checkItemStatus();
  }, [item]);

  const checkItemStatus = async () => {
    setCheckingStatus(true);
    
    const { activated } = await ItemService.isItemActivated(item?.toString() || '');
    setIsActivated(activated);

    if (activated) {
      const { data: userItems } = await ItemService.getUserItems();
      const currentItem = userItems?.find(i => i.name === item);
      
      if (currentItem?.expired_at) {
        const now = new Date();
        const expiry = new Date(currentItem.expired_at);
        setIsExpired(expiry < now);
      }
    }
    
    setCheckingStatus(false);
  };

  const handleOpenLink = async () => {
    if (link && typeof link === 'string') {
      const supported = await Linking.canOpenURL(link);
      if (supported) {
        await Linking.openURL(link);
      } else {
        Alert.alert('Errore', 'Impossibile aprire il link');
      }
    }
  };

  const handleSaveDuration = () => {
    const numDuration = parseInt(customDuration);
    if (!numDuration || numDuration <= 0) {
      Alert.alert('Errore', 'Inserisci una durata valida (numero maggiore di 0)');
      return;
    }
    setIsEditingDuration(false);
  };

  const getFinalDuration = (): number | undefined => {
    const customNum = parseInt(customDuration);
    if (customNum && customNum > 0) {
      return customNum;
    }
    const defaultNum = parseInt(duration?.toString() || '0');
    return defaultNum > 0 ? defaultNum : undefined;
  };

  const canEditDuration = !isActivated;

  return (
    <AuthWrapper 
      requireAuth={true}
      showCancelButton={true}
      onCancel={() => router.back()}
    >
      <SafeAreaView className="flex-1 bg-neutral-50">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-neutral-200">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#525252" />
          </TouchableOpacity>
          
          <Text className="text-lg font-inter-semibold text-neutral-900 flex-1 text-center mr-10">
            {item}
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-sm">
            <View className="items-center mb-4">
              <View className="w-32 h-32 bg-primary-100 rounded-full items-center justify-center mb-4">
                {renderIcon({
                  family: icon_family?.toString() || null,
                  name: icon?.toString() || null,
                  size: 64,
                  color: '#3b82f6'
                })}
              </View>
            </View>

            <View className="flex-row items-center justify-center bg-primary-50 rounded-full px-4 py-2">
              <Text className="text-primary-600 font-inter-medium ml-2">
                {category?.toString() || ''}
              </Text>
            </View>
          </View>

          <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-sm">
            <Text className="text-neutral-600 font-inter-semibold mb-3 text-lg">
              Descrizione
            </Text>
            <Text className="text-neutral-700 font-inter leading-6">
              {description}
            </Text>
          </View>

          {link && (
            <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-sm">
              <Text className="text-neutral-600 font-inter-semibold mb-3 text-lg">
                Informazioni Aggiuntive
              </Text>
              <TouchableOpacity 
                onPress={handleOpenLink}
                className="flex-row items-center bg-blue-50 rounded-xl p-4"
              >
                <Ionicons name="link" size={20} color="#2563eb" />
                <Text className="text-primary-600 font-inter-medium ml-3 flex-1">
                  Apri link esterno
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#2563eb" />
              </TouchableOpacity>
            </View>
          )}

          <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-neutral-600 font-inter-semibold text-lg">
                Frequenza Sostituzione
              </Text>
              {canEditDuration && (
                <TouchableOpacity
                  onPress={isEditingDuration ? handleSaveDuration : () => setIsEditingDuration(true)}
                  className="bg-neutral-100 rounded-full px-3 py-1"
                >
                  <Text className="text-neutral-600 font-inter text-sm">
                    {isEditingDuration ? 'Salva' : 'Modifica'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View className="flex-row items-center">
              <Text className="text-neutral-700 font-inter">Ogni </Text>
              {isEditingDuration && canEditDuration ? (
                <TextInput
                  value={customDuration}
                  onChangeText={setCustomDuration}
                  keyboardType="numeric"
                  className="bg-neutral-100 rounded-lg px-3 py-2 font-inter-medium text-center mx-2 min-w-16"
                  placeholder={duration?.toString() || "30"}
                  autoFocus
                />
              ) : (
                <View className="bg-primary-100 rounded-lg px-3 py-2 mx-2">
                  <Text className="text-primary-600 font-inter-bold">
                    {customDuration || duration}
                  </Text>
                </View>
              )}
              <Text className="text-neutral-700 font-inter">
                {parseInt(customDuration || duration?.toString() || '1') === 1 ? 'giorno' : 'giorni'}
              </Text>
            </View>

            <View className="bg-warning/10 rounded-xl p-3 mt-4">
              <View className="flex-row">
                <Ionicons name="information-circle" size={16} color="#f59e0b" />
                <Text className="text-warning text-sm font-inter ml-2 flex-1">
                  {canEditDuration 
                    ? 'Raccomandazione basata su studi scientifici. Puoi personalizzare secondo le tue esigenze.'
                    : 'La frequenza non può essere modificata quando l\'oggetto è attivo. Disattiva l\'oggetto per modificare la durata.'}
                </Text>
              </View>
            </View>
          </View>

          <View className="mx-4 my-6">
            {!checkingStatus && isActivated && isExpired ? (
              <RenewItemBtn
                itemName={item?.toString() || ''}
                currentDuration={getFinalDuration()}
              />
            ) : (
              <ActivateItemBtn
                itemName={item?.toString() || ''}
                customDuration={getFinalDuration()}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </AuthWrapper>
  );
}