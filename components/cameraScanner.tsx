import { GeminiService } from '@/services/geminiService';
import { ItemService } from '@/services/itemService';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export const CameraScanner: React.FC = () => {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleTakePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setAnalyzing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      if (!photo?.base64) {
        Alert.alert('Errore', 'Impossibile acquisire l\'immagine');
        setAnalyzing(false);
        return;
      }

      const analysis = await GeminiService.analyzeProductImage(photo.base64);

      if (!analysis.success || !analysis.productName) {
        Alert.alert(
          'Oggetto non riconosciuto',
          analysis.error || 'Non riesco a identificare questo oggetto. Prova con un\'altra foto o cerca manualmente.'
        );
        setAnalyzing(false);
        return;
      }

      const { data: catalogItems } = await ItemService.getCatalog();
      const matchedItem = catalogItems?.find(
        item => item.name.toLowerCase() === analysis.productName?.toLowerCase()
      );

      if (!matchedItem) {
        Alert.alert(
          'Oggetto non trovato',
          `Ho riconosciuto "${analysis.productName}" ma non è presente nel catalogo.`
        );
        setAnalyzing(false);
        return;
      }

      const { activated } = await ItemService.isItemActivated(matchedItem.name);

      if (activated) {
        Alert.alert(
          'Oggetto già attivo',
          `"${matchedItem.name}" è già attivo nella tua lista.`
        );
        setAnalyzing(false);
        return;
      }

      setModalVisible(false);
      setAnalyzing(false);

      router.push({
        pathname: '/[item]',
        params: {
          item: matchedItem.name,
          description: matchedItem.description,
          category: matchedItem.category,
          duration: matchedItem.duration_days,
          link: matchedItem.link,
          icon: matchedItem.icon,
          icon_family: matchedItem.icon_family,
        },
      });
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante l\'analisi');
      setAnalyzing(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setAnalyzing(true);

      const analysis = await GeminiService.analyzeProductImage(result.assets[0].base64);

      if (!analysis.success || !analysis.productName) {
        Alert.alert(
          'Oggetto non riconosciuto',
          analysis.error || 'Non riesco a identificare questo oggetto.'
        );
        setAnalyzing(false);
        return;
      }

      const { data: catalogItems } = await ItemService.getCatalog();
      const matchedItem = catalogItems?.find(
        item => item.name.toLowerCase() === analysis.productName?.toLowerCase()
      );

      if (!matchedItem) {
        Alert.alert(
          'Oggetto non trovato',
          `Ho riconosciuto "${analysis.productName}" ma non è presente nel catalogo.`
        );
        setAnalyzing(false);
        return;
      }

      const { activated } = await ItemService.isItemActivated(matchedItem.name);

      if (activated) {
        Alert.alert(
          'Oggetto già attivo',
          `"${matchedItem.name}" è già attivo nella tua lista.`
        );
        setAnalyzing(false);
        return;
      }

      setModalVisible(false);
      setAnalyzing(false);

      router.push({
        pathname: '/[item]',
        params: {
          item: matchedItem.name,
          description: matchedItem.description,
          category: matchedItem.category,
          duration: matchedItem.duration_days,
          link: matchedItem.link,
          icon: matchedItem.icon,
          icon_family: matchedItem.icon_family,
        },
      });
    }
  };

  const handleOpenCamera = async () => {
    if (!permission) {
      await requestPermission();
      return;
    }

    if (!permission.granted) {
      Alert.alert(
        'Permesso Fotocamera',
        'Per scansionare oggetti abbiamo bisogno di accedere alla fotocamera',
        [
          { text: 'Annulla', style: 'cancel' },
          { text: 'Concedi', onPress: requestPermission }
        ]
      );
      return;
    }

    setModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleOpenCamera}
        className="items-center justify-center py-2"
        activeOpacity={0.6}
      >
        <Ionicons name="camera-outline" size={28} color="#6b7280" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View className="flex-1 bg-black">
          {permission?.granted ? (
            <View className="flex-1">
              <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
              
              <View className="flex-1 justify-between">
                <View 
                  className="flex-row justify-between items-center px-6"
                  style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40 }}
                >
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="w-12 h-12 rounded-full bg-black/50 items-center justify-center"
                    disabled={analyzing}
                  >
                    <Ionicons name="close" size={28} color="#ffffff" />
                  </TouchableOpacity>
                  <Text className="text-white text-lg font-inter-semibold">
                    Scansiona Oggetto
                  </Text>
                  <View className="w-12" />
                </View>

                <View className="items-center mb-8">
                  <View className="border-4 border-white/50 w-64 h-64 rounded-3xl mb-6" />
                  <Text className="text-white text-center px-8 mb-8 font-inter">
                    Inquadra l'oggetto al centro del riquadro
                  </Text>

                  {analyzing ? (
                    <View className="items-center">
                      <ActivityIndicator size="large" color="#3b82f6" />
                      <Text className="text-white mt-4 font-inter">
                        Analisi in corso...
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-4">
                      <TouchableOpacity
                        onPress={handlePickImage}
                        className="w-16 h-16 rounded-full bg-white/20 items-center justify-center"
                      >
                        <Ionicons name="images-outline" size={28} color="#ffffff" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleTakePicture}
                        className="w-20 h-20 rounded-full bg-white items-center justify-center"
                      >
                        <View className="w-16 h-16 rounded-full bg-primary-500" />
                      </TouchableOpacity>

                      <View className="w-16" />
                    </View>
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View className="flex-1 bg-neutral-900 justify-center items-center px-6">
              <Ionicons name="camera-outline" size={80} color="#ffffff" />
              <Text className="text-white text-xl font-inter-semibold mt-6 text-center">
                Permesso Fotocamera Necessario
              </Text>
              <Text className="text-neutral-400 text-center mt-3 mb-8 font-inter">
                Per scansionare oggetti abbiamo bisogno di accedere alla fotocamera
              </Text>
              <TouchableOpacity
                onPress={requestPermission}
                className="bg-primary-500 px-8 py-4 rounded-3xl mb-4"
              >
                <Text className="text-white font-inter-semibold">Concedi Permesso</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="px-8 py-4"
              >
                <Text className="text-neutral-400 font-inter">Annulla</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};
