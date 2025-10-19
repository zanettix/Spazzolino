import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Item } from '../models/item';
import { NearbyPlace } from './locationService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  
  private static LAST_LOCATION_NOTIFICATION_KEY = 'lastLocationNotification';

  static async initializeNotifications(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    try {
      const permissionGranted = await this.requestPermissions();
      return permissionGranted;
    } catch (error) {
      return false;
    }
  }

  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    } catch (error) {
      return false;
    }
  }

  static async scheduleNotificationsForItem(item: Item): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    try {
      await this.cancelNotificationsForItem(item.name, item.owner);

      const expiredDate = new Date(item.expired_at);
      const now = new Date();

      if (expiredDate <= now) {
        return false;
      }

      const reminderDate = new Date(expiredDate);
      reminderDate.setDate(reminderDate.getDate() - 7);

      let notificationsScheduled = 0;

      if (reminderDate > now) {
        const reminderIdentifier = `reminder_${item.name}_${item.owner}`;
        const secondsUntilReminder = Math.floor((reminderDate.getTime() - now.getTime()) / 1000);
        
        if (secondsUntilReminder > 0) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Promemoria: ${item.name}`,
              body: `Tra una settimana dovresti sostituire il tuo ${item.name.toLowerCase()}. Preparati!`,
              data: {
                itemName: item.name,
                type: 'reminder',
                daysUntilExpiry: 7,
                owner: item.owner
              },
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: secondsUntilReminder,
              repeats: false,
            },
            identifier: reminderIdentifier,
          });

          notificationsScheduled++;
        }
      }

      const expiryIdentifier = `expiry_${item.name}_${item.owner}`;
      const secondsUntilExpiry = Math.floor((expiredDate.getTime() - now.getTime()) / 1000);
      
      if (secondsUntilExpiry > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `È tempo di sostituire: ${item.name}`,
            body: `Oggi è il giorno ideale per sostituire il tuo ${item.name.toLowerCase()}. La tua salute ti ringrazierà!`,
            data: {
              itemName: item.name,
              type: 'expiry',
              daysUntilExpiry: 0,
              owner: item.owner
            },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: secondsUntilExpiry,
            repeats: false,
          },
          identifier: expiryIdentifier,
        });

        notificationsScheduled++;
      }

      return notificationsScheduled > 0;

    } catch (error) {
      return false;
    }
  }

  static async cancelNotificationsForItem(itemName: string, owner?: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

      const notificationsToCancel = scheduledNotifications.filter(notification => {
        const identifier = notification.identifier;
        
        if (owner) {
          return identifier.includes(`_${itemName}_${owner}`);
        }
        
        return identifier.includes(`_${itemName}_`);
      });

      for (const notification of notificationsToCancel) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

    } catch (error) {
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      return [];
    }
  }

  static async getScheduledNotificationsForUser(owner: string): Promise<Notifications.NotificationRequest[]> {
    try {
      const allNotifications = await this.getScheduledNotifications();
      return allNotifications.filter(notification => 
        notification.identifier.includes(`_${owner}`)
      );
    } catch (error) {
      return [];
    }
  }

  static async scheduleNotificationsForAllItems(items: Item[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const item of items) {
      const scheduled = await this.scheduleNotificationsForItem(item);
      if (scheduled) {
        success++;
      } else {
        failed++;
      }
    }
    return { success, failed };
  }

  static async syncNotifications(userItems: Item[]): Promise<{ success: boolean; synchronized: number; error: string | null }> {
    try {
      if (!userItems || userItems.length === 0) {
        return { success: false, synchronized: 0, error: 'Nessun oggetto trovato' };
      }

      const scheduledNotifications = await this.getScheduledNotifications();
      const validItemNames = new Set(userItems.map(item => item.name));
      
      for (const notification of scheduledNotifications) {
        const parts = notification.identifier.split('_');
        
        if (parts.length >= 3) {
          const itemName = parts.slice(1, -1).join('_');
          
          if (!validItemNames.has(itemName)) {
            await this.cancelNotificationsForItem(itemName);
          }
        }
      }

      const result = await this.scheduleNotificationsForAllItems(userItems);
      
      return { 
        success: true, 
        synchronized: result.success, 
        error: result.failed > 0 ? `${result.failed} oggetti non sincronizzati` : null 
      };
    } catch (error) {
      return { success: false, synchronized: 0, error: 'Errore imprevisto nella sincronizzazione' };
    }
  }

  static async canSendLocationNotificationToday(): Promise<boolean> {
    try {
      const lastNotification = await AsyncStorage.getItem(this.LAST_LOCATION_NOTIFICATION_KEY);
      
      if (!lastNotification) return true;

      const lastDate = new Date(lastNotification);
      const today = new Date();
      
      lastDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      return lastDate.getTime() !== today.getTime();
    } catch (error) {
      return true;
    }
  }

  static async sendLocationNotification(
    place: NearbyPlace,
    expiringItems: Item[]
  ): Promise<boolean> {
    try {
      const itemsList = expiringItems
        .slice(0, 3)
        .map(item => item.name)
        .join(', ');

      const moreItems = expiringItems.length > 3 ? ` e altri ${expiringItems.length - 3}` : '';

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Sei vicino a ${place.name}`,
          body: `Hai ${expiringItems.length} oggetti in scadenza: ${itemsList}${moreItems}`,
          data: { 
            type: 'location',
            placeId: place.id,
            placeName: place.name,
            placeType: place.type,
            itemCount: expiringItems.length
          },
          sound: true,
        },
        trigger: null,
      });

      await AsyncStorage.setItem(
        this.LAST_LOCATION_NOTIFICATION_KEY,
        new Date().toISOString()
      );

      return true;
    } catch (error) {
      return false;
    }
  }
}