import { Request } from '@/models/request';
import { supabase } from '@/utils/supabase';

export class RequestService {
  
  static async createRequest(
    requestData: { item: string; content: string }, 
    userId: string
  ): Promise<{ success: boolean; error: string | null; data?: Request }> {
    try {
      const { data, error } = await supabase
        .from('request')
        .insert({
          item: requestData.item.trim(),
          content: requestData.content.trim(),
          user: userId
        })
        .select('*')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null, data };
    } catch (error) {
      return { 
        success: false, 
        error: 'Errore imprevisto durante l\'invio della richiesta' 
      };
    }
  }
}