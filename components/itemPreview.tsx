import { useAuth } from '@/hooks/useAuth';
import { Item } from '@/models/item';
import { renderIcon } from '@/utils/iconRenderer';
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

  const getDaysRemaining = (expiredAt: string | null): number => {
    if (!expiredAt) return 0;
    const now = new Date();
    const expiry = new Date(expiredAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getStatusColor = (daysRemaining: number): string => {
    if (daysRemaining <= 0) return 'text-red-600';
    if (daysRemaining <= 7) return 'text-orange-600';
    if (daysRemaining <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusText = (daysRemaining: number): string => {
    if (daysRemaining <= 0) return 'Scaduto';
    if (daysRemaining === 1) return '1 giorno';
    return `${daysRemaining} giorni`;
  };

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
        className="bg-white p-4 m-1 rounded-xl shadow-sm border border-neutral-100 flex-1"
        style={{ maxWidth: '32%' }}
        onPress={() => onItemPress(item)}
        disabled={authLoading}
        activeOpacity={0.7}
      >
        <View className="items-center mb-2">
          {renderIcon({ 
            family: item.icon_family, 
            name: item.icon, 
            size: 40, 
            color: '#3b82f6' 
          })}
        </View>
        
        <Text className="text-sm font-semibold text-neutral-800 text-center mb-2" numberOfLines={2}>
          {item.name}
        </Text>
        
        <Text className={`text-xs font-medium text-center ${statusColor}`}>
          {statusText}
        </Text>
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
      numColumns={3}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
      contentContainerStyle={{ 
        paddingBottom: 20, 
        paddingHorizontal: 16,
        flexGrow: 1 
      }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={items.length === 0 ? renderEmptyState : null}
      scrollEnabled={false}
    />
  );
}