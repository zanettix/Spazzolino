import { useAuth } from '@/hooks/useAuth';
import { Item } from '@/models/item';
import React from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';

interface ItemPreviewProps {
  items: Item[];
  loading: boolean;
  error: string | null;
  onItemPress: (item: Item) => void;
  onRetry?: () => void;
}

export function ItemPreview({ items, loading, error, onItemPress, onRetry }: ItemPreviewProps) {
  const { user, loading: authLoading } = useAuth();

  // Funzione per calcolare giorni rimanenti
  const getDaysRemaining = (expiredAt: string | null): number => {
    if (!expiredAt) return 0;
    const now = new Date();
    const expiry = new Date(expiredAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Funzione per ottenere il colore in base ai giorni rimanenti
  const getStatusColor = (daysRemaining: number): string => {
    if (daysRemaining <= 0) return 'text-red-600 bg-red-100';
    if (daysRemaining <= 7) return 'text-orange-600 bg-orange-100';
    if (daysRemaining <= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  // Funzione per ottenere il testo dello status
  const getStatusText = (daysRemaining: number): string => {
    if (daysRemaining <= 0) return 'Scaduto';
    if (daysRemaining === 1) return '1 giorno';
    return `${daysRemaining} giorni`;
  };

  // Loading solo se non ci sono dati e si sta caricando per la prima volta
  if (loading && items.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-neutral-600 mt-2">Caricamento oggetti attivi...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <Text className="text-lg font-medium text-red-600 mb-2">Errore</Text>
        <Text className="text-sm text-neutral-600 text-center px-8 mb-4">{error}</Text>
        {onRetry && (
          <TouchableOpacity 
            onPress={onRetry}
            className="bg-primary-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Riprova</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!user && !authLoading) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <Text className="text-lg font-medium text-neutral-500 mb-2">Accesso richiesto</Text>
        <Text className="text-sm text-neutral-400 text-center px-8">
          Effettua l'accesso per vedere i tuoi oggetti attivi
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Item }) => {
    const daysRemaining = getDaysRemaining(item.expired_at || null);
    const statusColor = getStatusColor(daysRemaining);
    const statusText = getStatusText(daysRemaining);

    return (
      <TouchableOpacity 
        className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-neutral-100"
        onPress={() => onItemPress(item)}
        disabled={authLoading}
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-lg font-semibold text-neutral-800 mb-1">{item.name}</Text>
            <View className="bg-primary-100 px-3 py-1 rounded-full self-start">
              <Text className="text-xs font-medium text-primary-700 capitalize">
                {item.category.replace('_', ' ')}
              </Text>
            </View>
          </View>
          
          <View className={`px-3 py-1 rounded-full ${statusColor}`}>
            <Text className="text-xs font-medium">
              {statusText}
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-primary-500 rounded-full mr-2" />
            <Text className="text-sm font-medium text-primary-600">
              Ogni {item.duration_days} giorni
            </Text>
          </View>
          
          {item.expired_at && (
            <Text className="text-xs text-neutral-500">
              Scade il {new Date(item.expired_at).toLocaleDateString('it-IT')}
            </Text>
          )}
        </View>
        
        <Text className="text-sm text-neutral-600 leading-5" numberOfLines={2}>
          {item.description}
        </Text>

        {/* Barra di progresso visiva */}
        {item.expired_at && (
          <View className="mt-3">
            <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <View 
                className={`h-full rounded-full ${
                  daysRemaining <= 0 ? 'bg-red-500' : 
                  daysRemaining <= 7 ? 'bg-orange-500' : 
                  daysRemaining <= 30 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min(100, Math.max(10, (daysRemaining / item.duration_days) * 100))}%` 
                }}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-12">
      <Text className="text-lg font-medium text-neutral-500 mb-2">Nessun oggetto attivo</Text>
      <Text className="text-sm text-neutral-400 text-center px-8 mb-4">
        Vai alla ricerca per attivare promemoria per i tuoi oggetti
      </Text>
      <Text className="text-xs text-neutral-400 text-center px-8">
        Scorri verso l'alto per aggiornare
      </Text>
    </View>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => `${item.name}-${item.owner}`}
      renderItem={renderItem}
      contentContainerStyle={{ 
        paddingBottom: 20, 
        paddingHorizontal: 20,
        flexGrow: 1 
      }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={items.length === 0 ? renderEmptyState : null}
      scrollEnabled={false} // Disabilita scroll interno per lasciare gestione al ScrollView padre
    />
  );
}