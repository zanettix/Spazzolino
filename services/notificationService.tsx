import * as Notifications from 'expo-notifications';
import { Item } from '../models/item';


export class NotificationService {
  
  static async initializeNotifications(): Promise<boolean> {

    try {
        await Notifications.setNotificationChannelAsync('spazzolino-expiry', {
          name: 'Scadenze Spazzolino',
          description: 'Notifiche per oggetti scaduti',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#ef4444',
          sound: 'default',
          enableLights: true,
          enableVibrate: true,
        });

      const permissionGranted = await this.requestPermissions();
      return permissionGranted;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return true;
    } catch (error) {
      console.error('Errore nella richiesta permessi:', error);
      return false;
    }
  }

  static async scheduleNotificationsForItem(item: Item): Promise<boolean> {
    try {

      await this.cancelNotificationsForItem(item.name, item.owner);

      const expiredDate = new Date(item.expired_at);
      const now = new Date();

      if (expiredDate <= now) {
        console.warn(`Oggetto ${item.name} già scaduto, nessuna notifica programmata`);
        return false;
      }

      const reminderDate = new Date(expiredDate);
      reminderDate.setDate(reminderDate.getDate() - 7);

      let notificationsScheduled = 0;

      if (reminderDate > now) {
        const reminderIdentifier = `reminder_${item.name}_${item.owner}`;
        
        // notifica anticipata 7 giorni prima
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
            categoryIdentifier: 'REMINDER_CATEGORY',
            sound: 'default',
          },
          trigger: {
            date: reminderDate,
            channelId: 'spazzolino-reminders',
          },
          identifier: reminderIdentifier,
        });

        notificationsScheduled++;
      }

      const expiryIdentifier = `expiry_${item.name}_${item.owner}`;
      
      // notifica il giorno della scadenza
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
          categoryIdentifier: 'EXPIRY_CATEGORY',
          sound: 'default',
        },
        trigger: {
          date: expiredDate,
          channelId: 'spazzolino-expiry',
        },
        identifier: expiryIdentifier,
      });

      notificationsScheduled++;

      return notificationsScheduled > 0;

    } catch (error) {
      console.error(`Errore nella programmazione notifiche per ${item.name}:`, error);
      return false;
    }
  }

  static async cancelNotificationsForItem(itemName: string, owner?: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

      const notificationsToCancel = scheduledNotifications.filter(notification => {
        const identifier = notification.identifier;
        
        // Se owner è specificato, cerca notifiche specifiche per questo utente
        if (owner) {
          return identifier.includes(`_${itemName}_${owner}`);
        }
        
        // Altrimenti cancella tutte le notifiche per questo oggetto
        return identifier.includes(`_${itemName}_`);
      });

      for (const notification of notificationsToCancel) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        console.log(`🗑️ Notifica cancellata: ${notification.identifier}`);
      }

      if (notificationsToCancel.length === 0) {
        console.log(`Nessuna notifica trovata per ${itemName}`);
      }

    } catch (error) {
      console.error('Errore nella cancellazione notifiche:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🗑️ Tutte le notifiche cancellate');
    } catch (error) {
      console.error('Errore nella cancellazione di tutte le notifiche:', error);
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Errore nel recupero notifiche programmate:', error);
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
      console.error('Errore nel recupero notifiche utente:', error);
      return [];
    }
  }

  static async scheduleNotificationsForAllItems(items: Item[]): Promise<{ success: number; failed: number }> {
    console.log(`🔄 Programmazione notifiche per ${items.length} oggetti`);
    
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

    console.log(`✅ Notifiche programmate: ${success} successi, ${failed} fallimenti`);
    return { success, failed };
  }
}