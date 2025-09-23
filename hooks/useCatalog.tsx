import { Item } from '@/models/item';
import { ItemService } from '@/services/itemService';
import { useEffect, useState } from 'react';

interface UseCatalogReturn {
  catalog: Item[];
  loading: boolean;
  error: string | null;
  refreshCatalog: () => Promise<void>;
  searchCatalog: (query: string) => Promise<void>;
  filteredCatalog: Item[];
}

export function useCatalog(): UseCatalogReturn {
  const [catalog, setCatalog] = useState<Item[]>([]);
  const [filteredCatalog, setFilteredCatalog] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await ItemService.getCatalog();
      
      if (fetchError) {
        setError(fetchError);
        return;
      }
      
      setCatalog(data || []);
      setFilteredCatalog(data || []);
    } catch (err) {
      setError('Errore nel caricamento del catalogo');
    } finally {
      setLoading(false);
    }
  };

  const refreshCatalog = async () => {
    await loadCatalog();
  };

  const searchCatalog = async (query: string) => {
    if (!query.trim()) {
      setFilteredCatalog(catalog);
      return;
    }

    const { data } = await ItemService.searchCatalog(query);
    if (data) setFilteredCatalog(data);
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  return {
    catalog,
    loading,
    error,
    refreshCatalog,
    searchCatalog,
    filteredCatalog
  };
}
