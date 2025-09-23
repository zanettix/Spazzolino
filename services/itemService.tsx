import { Item } from '@/models/item';
import { supabase } from '@/utils/supabase';

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

    // Trasforma i dati per una struttura più pulita
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

  static async activateItem(itemName: string, durationDays?: number): Promise<{ success: boolean; error: string | null }> {
      const { error } = await supabase
        .from('user_items')
        .insert({
          name: itemName,
          duration_days: durationDays,
          // owner viene settato automaticamente da auth.uid() nel database
        });

      if (error) {
        console.error('Errore nell\'attivazione oggetto:', error);
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
  }

  static async deactivateItem(itemName: string): Promise<{ success: boolean; error: string | null }> {
      const { error } = await supabase
        .from('user_items')
        .delete()
        .eq('name', itemName);
        // owner viene filtrato automaticamente tramite RLS di Supabase

      if (error) {
        console.error('Errore nella disattivazione oggetto:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
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
  
}