import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Alert, Platform } from 'react-native';
import { ItemService } from './itemService';
import { NotificationService } from './notificationService';

const LOCATION_TASK_NAME = 'background-location-task';
const CHECK_RADIUS = 100;
const LOCATION_TRACKING_KEY = 'locationTrackingEnabled';

export interface NearbyPlace {
  id: string;
  name: string;
  type: 'supermarket' | 'pharmacy';
  lat: number;
  lng: number;
  distance: number;
}

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    return;
  }

  const locations = (data as any)?.locations;
  if (!locations || locations.length === 0) return;

  const location = locations[0];
  const { coords } = location;

  try {
    const canNotify = await NotificationService.canSendLocationNotificationToday();
    if (!canNotify) return;

    const expiringItems = await ItemService.getExpiringItems();
    if (expiringItems.length === 0) return;

    const nearbyPlaces = await LocationService.getNearbyStores(
      coords.latitude,
      coords.longitude
    );

    if (nearbyPlaces.length > 0) {
      const closestPlace = nearbyPlaces[0];
      await NotificationService.sendLocationNotification(
        closestPlace,
        expiringItems
      );
    }
  } catch (taskError) {
  }
});

export class LocationService {
  
  static async isTrackingEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(LOCATION_TRACKING_KEY);
    return enabled === 'true';
  }

  private static async setTrackingEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(LOCATION_TRACKING_KEY, enabled.toString());
  }

  static async initializeBackgroundTracking(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      Alert.alert(
        'Permesso Richiesto',
        'Per ricevere notifiche quando sei vicino a negozi, abilita la posizione nelle impostazioni.',
        [{ text: 'OK' }]
      );
      return false;
    }

    const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();

    if (backgroundStatus !== 'granted') {
      const { status: newBackgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (newBackgroundStatus !== 'granted') {
        Alert.alert(
          'Permesso Background Necessario',
          'Per funzionare correttamente, questa funzione richiede l\'accesso alla posizione "Sempre".\n\nVai in Impostazioni > Privacy > Localizzazione > Spazzolino e seleziona "Sempre".',
          [
            { text: 'Annulla', style: 'cancel' },
            { 
              text: 'Apri Impostazioni', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Location.enableNetworkProviderAsync();
                }
              }
            }
          ]
        );
        return false;
      }
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 1800000,
      distanceInterval: 100,
      foregroundService: {
        notificationTitle: 'Spazzolino',
        notificationBody: 'Monitoraggio promemoria attivo',
      },
      showsBackgroundLocationIndicator: true,
    });

    await this.setTrackingEnabled(true);
    return true;
  }

  static async checkAndPromptForAlwaysPermission(): Promise<void> {
    const { status } = await Location.getBackgroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Migliora l\'Esperienza',
        'Per ricevere notifiche anche quando l\'app è chiusa, abilita "Consenti sempre" nelle impostazioni di localizzazione.',
        [
          { text: 'Più tardi', style: 'cancel' },
          { 
            text: 'Vai a Impostazioni',
            onPress: async () => {
              await Location.requestBackgroundPermissionsAsync();
            }
          }
        ]
      );
    }
  }

  static async stopBackgroundTracking(): Promise<void> {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
    await this.setTrackingEnabled(false);
  }

  static async getNearbyStores(lat: number, lng: number): Promise<NearbyPlace[]> {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      return [];
    }

    const types = ['supermarket', 'pharmacy'];
    const allPlaces: NearbyPlace[] = [];

    for (const type of types) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${CHECK_RADIUS}&type=${type}&key=${apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const places = data.results.map((place: any) => ({
            id: place.place_id,
            name: place.name,
            type: type as 'supermarket' | 'pharmacy',
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            distance: this.calculateDistance(
              lat, lng,
              place.geometry.location.lat,
              place.geometry.location.lng
            ),
          }));
          
          allPlaces.push(...places);
        }
      } catch (error) {
        continue;
      }
    }

    return allPlaces
      .filter(p => p.distance <= CHECK_RADIUS)
      .sort((a, b) => a.distance - b.distance);
  }

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}