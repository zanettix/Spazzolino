import { Item } from '@/models/item';
import { ItemService } from '@/services/itemService';
import { useEffect, useState } from 'react';

interface UseUserItemsReturn {
  userItems: Item[];
  loading: boolean;
  error: string | null;
  refreshUserItems: () => Promise<void>;
}

export function useUserItems(): UseUserItemsReturn {
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await ItemService.getUserItems();
      
      if (fetchError) {
        setError(fetchError);
        return;
      }
      
      setUserItems(data || []);
    } catch (err) {
      setError('Errore nel caricamento degli oggetti attivi');
    } finally {
      setLoading(false);
    }
  };

  const refreshUserItems = async () => {
    await loadUserItems();
  };

  useEffect(() => {
    loadUserItems();
  }, []);

  return {
    userItems,
    loading,
    error,
    refreshUserItems
  };
}