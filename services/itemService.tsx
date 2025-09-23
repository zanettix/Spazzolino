import { Item } from '@/models/item';
import { supabase } from '@/utils/supabase';

export class ItemService {

  static async getCatalog(): Promise<{ data: Item[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .order('category, name');

      if (error) {
        console.error('Errore nel recupero catalogo:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Errore generico catalogo:', err);
      return { data: null, error: 'Errore di connessione' };
    }
  }

  static async getCatalogByCategory(category: Item['category']): Promise<{ data: Item[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .eq('category', category)
        .order('name');

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { data: null, error: 'Errore di connessione' };
    }
  }

    static async searchCatalog(query: string): Promise<{ data: Item[] | null; error: string | null }> {
    try {
        // Sintassi corretta per Supabase: usa .ilike. invece di .ilike.%
        const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .or(`name.ilike.*${query}*,description.ilike.*${query}*`)
        .order('name');

        if (error) {
        return { data: null, error: error.message };
        }

        return { data: data || [], error: null };
    } catch (err) {
        return { data: null, error: 'Errore di connessione' };
    }
    }

  static async searchUserItem(query: string, userId?: string): Promise<{ data: any[] | null; error: string | null }> {
  try {
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

    // Se viene fornito un userId specifico, filtra per quello, altrimenti usa l'utente autenticato
    if (userId) {
      supabaseQuery = supabaseQuery.eq('owner', userId);
    }

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

  } catch (err) {
    console.error('Errore generico nella ricerca user_items:', err);
    return { data: null, error: 'Errore di connessione' };
  }
}


}