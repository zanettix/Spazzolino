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
    const { data, error } = await supabase
      .from('user_items')
      .select(`
        name,
        duration_days,
        created_at,
        expired_at,
        owner,
        catalog!user_items_name_fkey (
          category,
          description,
          link,
          icon,
          icon_family
        )
      `)
      .or(`name.ilike.%${query}%,catalog.description.ilike.%${query}%,catalog.category.ilike.%${query}%`)
      .order('name');

    if (error) {
      return { data: null, error: error.message };
    }

    return { 
      data: data?.map(item => ({
        name: item.name,
        duration_days: item.duration_days,
        created_at: item.created_at,
        expired_at: item.expired_at,
        owner: item.owner,
        category: item.catalog[0].category,
        description: item.catalog[0].description,
        link: item.catalog[0].link,
        icon: item.catalog[0].icon,
        icon_family: item.catalog[0].icon_family
      })) || [], 
      error: null 
    };
  }

  static async activateItem(itemName: string, durationDays?: number): Promise<{ success: boolean; error: string | null; item?: Item }> {
    try {
      const { data, error } = await supabase
        .from('user_items')
        .insert({
          name: itemName,
          duration_days: durationDays,
        })
        .select(`
          *,
          catalog!user_items_name_fkey (
            category,
            description,
            link,
            icon,
            icon_family
          )
        `)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        error: null, 
        item: {
          name: data.name,
          category: data.catalog.category,
          description: data.catalog.description,
          link: data.catalog.link,
          icon: data.catalog.icon,
          icon_family: data.catalog.icon_family,
          created_at: data.created_at,
          duration_days: data.duration_days,
          expired_at: data.expired_at,
          owner: data.owner
        }
      };
    } catch (error) {
      return { success: false, error: 'Errore imprevisto durante l\'attivazione' };
    }
  }

  static async deactivateItem(itemName: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await NotificationService.cancelNotificationsForItem(itemName);

      const { error } = await supabase
        .from('user_items')
        .delete()
        .eq('name', itemName);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Errore imprevisto durante la disattivazione' };
    }
  }

  static async updateItemDuration(itemName: string, newDurationDays: number): Promise<{ success: boolean; error: string | null; item?: Item }> {
    try {
      await NotificationService.cancelNotificationsForItem(itemName);

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
            icon,
            icon_family
          )
        `)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        error: null, 
        item: {
          name: data.name,
          category: data.catalog.category,
          description: data.catalog.description,
          link: data.catalog.link,
          icon: data.catalog.icon,
          icon_family: data.catalog.icon_family,
          created_at: data.created_at,
          duration_days: data.duration_days,
          expired_at: data.expired_at,
          owner: data.owner
        }
      };
    } catch (error) {
      return { success: false, error: 'Errore imprevisto durante l\'aggiornamento' };
    }
  }

  static async isItemActivated(itemName: string): Promise<{ activated: boolean; error: string | null }> { 
        const { data, error } = await supabase
          .from('user_items')
          .select('name')
          .eq('name', itemName);

        if (error) {
          return { activated: false, error: error.message };
        }
        
        return { activated: data && data.length > 0, error: null };
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
            icon,
            icon_family
          )
        `)
        .order('expired_at', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      return { 
        data: data.map(item => ({
          name: item.name,
          category: item.catalog.category,
          description: item.catalog.description,
          link: item.catalog.link,
          icon: item.catalog.icon,
          icon_family: item.catalog.icon_family,
          created_at: item.created_at,
          duration_days: item.duration_days,
          expired_at: item.expired_at,
          owner: item.owner
        })), 
        error: null 
      };
    } catch (error) {
      return { data: null, error: 'Errore imprevisto nel recupero oggetti utente' };
    }
  }
}