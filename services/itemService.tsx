import { Item } from '@/models/item';
import { supabase } from '@/utils/supabase';
import { NotificationService } from './notificationService';

export class ItemService {

  static async getCatalog(): Promise<{ data: Item[] | null; error: string | null }> {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .order('category, name');

      if (error) {
        console.error('Errore nel recupero catalogo:', error);
        return { data: null, error: error.message };
      }
      return { data: data || [], error: null };
  }

  static async getCatalogByCategory(category: Item['category']): Promise<{ data: Item[] | null; error: string | null }> {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .eq('category', category)
        .order('name');

      if (error) {
        return { data: null, error: error.message };
      }
      return { data: data || [], error: null };
  }

  static async searchCatalog(query: string): Promise<{ data: Item[] | null; error: string | null }> {
        const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .or(`name.ilike.*${query}*,description.ilike.*${query}*`)
        .order('name');

        if (error) {
        return { data: null, error: error.message };
        }
        return { data: data || [], error: null };
    }

  static async searchUserItem(query: string, userId?: string): Promise<{ data: any[] | null; error: string | null }> {
    let supabaseQuery = supabase
      .from('user_items')
      .select(`
        name,
        duration_days,
        catalog!user_items_name_fkey (
          category,
          description,
          link,
          icon
        )
      `);

    const { data, error } = await supabaseQuery
      .or(`name.ilike.%${query}%,catalog.description.ilike.%${query}%,catalog.category.ilike.%${query}%`)
      .order('name');

    if (error) {
      console.error('Errore nella ricerca user_items:', error);
      return { data: null, error: error.message };
    }

    const transformedData = data?.map(item => ({
      name: item.name,
      duration_days: item.duration_days,
      category: item.catalog?.[0]?.category,
      description: item.catalog?.[0]?.description,
      link: item.catalog?.[0]?.link,
      icon: item.catalog?.[0]?.icon
    })) || [];
    return { data: transformedData, error: null };
  }

  static async activateItem(itemName: string, durationDays?: number): Promise<{ success: boolean; error: string | null; item?: Item }> {
    try {
      console.log(`🔄 Attivazione oggetto: ${itemName}`);

      // Prima inserisci l'oggetto nel database
      const { data, error } = await supabase
        .from('user_items')
        .insert({
          name: itemName,
          duration_days: durationDays,
          // owner viene settato automaticamente da auth.uid() nel database
        })
        .select(`
          *,
          catalog!user_items_name_fkey (
            category,
            description,
            link,
            icon
          )
        `)
        .single();

      if (error) {
        console.error('Errore nell\'attivazione oggetto:', error);
        return { success: false, error: error.message };
      }

      // Trasforma i dati per creare l'oggetto Item completo
      const item: Item = {
        name: data.name,
        category: data.catalog.category,
        description: data.catalog.description,
        link: data.catalog.link,
        icon: data.catalog.icon,
        created_at: data.created_at,
        duration_days: data.duration_days,
        expired_at: data.expired_at,
        owner: data.owner
      };

      console.log(`✅ Oggetto ${itemName} attivato nel database`);

      // Programma le notifiche per questo oggetto
      const notificationsScheduled = await NotificationService.scheduleNotificationsForItem(item);
      
      if (notificationsScheduled) {
        console.log(`🔔 Notifiche programmate per ${itemName}`);
      } else {
        console.warn(`⚠️ Impossibile programmare notifiche per ${itemName}`);
      }

      return { success: true, error: null, item };

    } catch (error) {
      console.error('Errore imprevisto nell\'attivazione:', error);
      return { success: false, error: 'Errore imprevisto durante l\'attivazione' };
    }
  }

  static async deactivateItem(itemName: string): Promise<{ success: boolean; error: string | null }> {
    try {
      console.log(`🔄 Disattivazione oggetto: ${itemName}`);

      // Prima cancella le notifiche
      await NotificationService.cancelNotificationsForItem(itemName);
      console.log(`🗑️ Notifiche cancellate per ${itemName}`);

      // Poi rimuovi dal database
      const { error } = await supabase
        .from('user_items')
        .delete()
        .eq('name', itemName);
        // owner viene filtrato automaticamente tramite RLS di Supabase

      if (error) {
        console.error('Errore nella disattivazione oggetto:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Oggetto ${itemName} disattivato`);
      return { success: true, error: null };

    } catch (error) {
      console.error('Errore imprevisto nella disattivazione:', error);
      return { success: false, error: 'Errore imprevisto durante la disattivazione' };
    }
  }

  static async updateItemDuration(itemName: string, newDurationDays: number): Promise<{ success: boolean; error: string | null; item?: Item }> {
    try {
      console.log(`🔄 Aggiornamento durata per ${itemName}: ${newDurationDays} giorni`);

      // Prima cancella le notifiche esistenti
      await NotificationService.cancelNotificationsForItem(itemName);
      console.log(`🗑️ Notifiche esistenti cancellate per ${itemName}`);

      // Aggiorna la durata nel database (il trigger ricalcolerà expired_at)
      const { data, error } = await supabase
        .from('user_items')
        .update({ duration_days: newDurationDays })
        .eq('name', itemName)
        .select(`
          *,
          catalog!user_items_name_fkey (
            category,
            description,
            link,
            icon
          )
        `)
        .single();

      if (error) {
        console.error('Errore nell\'aggiornamento durata:', error);
        return { success: false, error: error.message };
      }

      // Trasforma i dati per creare l'oggetto Item completo
      const updatedItem: Item = {
        name: data.name,
        category: data.catalog.category,
        description: data.catalog.description,
        link: data.catalog.link,
        icon: data.catalog.icon,
        created_at: data.created_at,
        duration_days: data.duration_days,
        expired_at: data.expired_at,
        owner: data.owner
      };

      console.log(`✅ Durata aggiornata per ${itemName}`);

      // Riprogramma le notifiche con la nuova data
      const notificationsScheduled = await NotificationService.scheduleNotificationsForItem(updatedItem);
      
      if (notificationsScheduled) {
        console.log(`🔔 Notifiche riprogrammate per ${itemName}`);
      } else {
        console.warn(`⚠️ Impossibile riprogrammare notifiche per ${itemName}`);
      }

      return { success: true, error: null, item: updatedItem };

    } catch (error) {
      console.error('Errore imprevisto nell\'aggiornamento:', error);
      return { success: false, error: 'Errore imprevisto durante l\'aggiornamento' };
    }
  }

  static async isItemActivated(itemName: string): Promise<{ activated: boolean; error: string | null }> { 
        const { data, error } = await supabase
          .from('user_items')
          .select('name')
          .eq('name', itemName);

        if (error) {
          console.error('Errore nel controllo attivazione:', error);
          return { activated: false, error: error.message };
        }
        const isActivated = data && data.length > 0;
        
        return { activated: isActivated, error: null };
  }

  static async getUserItems(): Promise<{ data: Item[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_items')
        .select(`
          *,
          catalog!user_items_name_fkey (
            category,
            description,
            link,
            icon
          )
        `)
        .order('expired_at', { ascending: true });

      if (error) {
        console.error('Errore nel recupero oggetti utente:', error);
        return { data: null, error: error.message };
      }

      // Trasforma i dati per la struttura Item
      const items: Item[] = data.map(item => ({
        name: item.name,
        category: item.catalog.category,
        description: item.catalog.description,
        link: item.catalog.link,
        icon: item.catalog.icon,
        created_at: item.created_at,
        duration_days: item.duration_days,
        expired_at: item.expired_at,
        owner: item.owner
      }));

      return { data: items, error: null };

    } catch (error) {
      console.error('Errore imprevisto nel recupero oggetti utente:', error);
      return { data: null, error: 'Errore imprevisto nel recupero oggetti utente' };
    }
  }

  // Funzione per sincronizzare le notifiche con gli oggetti attivi
  static async syncNotifications(): Promise<{ success: boolean; synchronized: number; error: string | null }> {
    try {
      console.log('🔄 Sincronizzazione notifiche con oggetti attivi...');

      // Recupera tutti gli oggetti attivi dell'utente
      const { data: userItems, error } = await this.getUserItems();
      
      if (error || !userItems) {
        return { success: false, synchronized: 0, error: error || 'Nessun oggetto trovato' };
      }

      // Riprogramma le notifiche per tutti gli oggetti
      const result = await NotificationService.scheduleNotificationsForAllItems(userItems);
      
      console.log(`✅ Sincronizzazione completata: ${result.success} oggetti sincronizzati`);
      
      return { 
        success: true, 
        synchronized: result.success, 
        error: result.failed > 0 ? `${result.failed} oggetti non sincronizzati` : null 
      };

    } catch (error) {
      console.error('Errore nella sincronizzazione notifiche:', error);
      return { success: false, synchronized: 0, error: 'Errore imprevisto nella sincronizzazione' };
    }
  }
}