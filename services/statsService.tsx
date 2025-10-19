import { supabase } from '@/utils/supabase';

interface HeatmapData {
  date: string;
  count: number;
}

export class StatsService {
  
  static async recordHeatmapCompletion(itemId: string): Promise<{ success: boolean; error: string | null; data?: HeatmapData[] }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return { success: false, error: 'Utente non autenticato' };
      }

      const { data: userItem, error: userItemError } = await supabase
        .from('user_items')
        .select('name')
        .eq('id', itemId)
        .single();

      if (userItemError || !userItem) {
        return { success: false, error: 'Elemento non trovato' };
      }

      const { error } = await supabase
        .from('heatmap_calendar')
        .insert({
          item: userItem.name,
          user: user.id,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      const createdAt = user.created_at;
      const userStartDate = createdAt ? new Date(createdAt) : new Date();
      const { data: updatedData } = await this.getHeatmapData(userStartDate);

      return { success: true, error: null, data: updatedData || [] };
    } catch (error) {
      return { success: false, error: 'Errore imprevisto durante la registrazione nel calendario' };
    }
  }

  private static formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static async getHeatmapData(startDate: Date): Promise<{ data: HeatmapData[] | null; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return { data: null, error: 'Utente non autenticato' };
      }

      const { data, error } = await supabase
        .from('heatmap_calendar')
        .select('completed_at')
        .eq('user', user.id)
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      const groupedData: { [key: string]: number } = {};
      
      data?.forEach((entry) => {
        const completedDate = new Date(entry.completed_at);
        const dateStr = this.formatDateLocal(completedDate);
        groupedData[dateStr] = (groupedData[dateStr] || 0) + 1;
      });

      const heatmapArray = Object.entries(groupedData).map(([date, count]) => ({
        date,
        count,
      }));

      return { data: heatmapArray, error: null };
    } catch (error) {
      return { data: null, error: 'Errore imprevisto nel recupero dati heatmap' };
    }
  }

  static async getTopReplacedItems(limit: number = 5): Promise<{ 
  data: Array<{
    name: string;
    times: number;
    category: string;
    icon: string;
    icon_family: string;
  }> | null; 
  error: string | null 
}> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: 'Utente non autenticato' };
    }

    const { data, error } = await supabase
      .from('how_many_times')
      .select(`
        name,
        times,
        catalog!how_many_times_name_fkey (
          category,
          icon,
          icon_family
        )
      `)
      .eq('user', user.id)
      .order('times', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    const formattedData = data?.map(item => ({
      name: item.name,
      times: item.times,
      category: (item.catalog as any)?.[0]?.category || '',
      icon: (item.catalog as any)?.[0]?.icon || '',
      icon_family: (item.catalog as any)?.[0]?.icon_family || ''
    })) || [];

    return { data: formattedData, error: null };
  } catch (error) {
    return { data: null, error: 'Errore nel recupero degli oggetti più sostituiti' };
  }
}

static async incrementReplacementCount(itemName: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Utente non autenticato' };
    }

    const { data: existing } = await supabase
      .from('how_many_times')
      .select('times')
      .eq('user', user.id)
      .eq('name', itemName)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('how_many_times')
        .update({ times: existing.times + 1 })
        .eq('user', user.id)
        .eq('name', itemName);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from('how_many_times')
        .insert({
          user: user.id,
          name: itemName,
          times: 1
        });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: 'Errore nell\'incremento del contatore' };
  }
}
}