import { useAuth } from '@/hooks/useAuth';
import { Item } from '@/models/item';
import React from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';

interface CatalogPreviewProps {
  items: Item[];
  loading: boolean;
  error: string | null;
  onItemPress: (item: Item) => void;
  onRetry?: () => void;
}

export function CatalogPreview({ items, loading, error, onItemPress, onRetry }: CatalogPreviewProps) {
  const { user, loading: authLoading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-neutral-600 mt-2">Caricamento catalogo...</Text>
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

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity 
      className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-neutral-100"
      onPress={() => onItemPress(item)}
      disabled={authLoading}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold text-neutral-800 flex-1">{item.name}</Text>
        <View className="bg-primary-100 px-3 py-1 rounded-full">
          <Text className="text-xs font-medium text-primary-700 capitalize">
            {item.category.replace('_', ' ')}
          </Text>
        </View>
      </View>
      
      <View className="flex-row items-center mb-2">
        <View className="w-2 h-2 bg-primary-500 rounded-full mr-2" />
        <Text className="text-sm font-medium text-primary-600">
          {item.duration_days} giorni
        </Text>
      </View>
      
      <Text className="text-sm text-neutral-600 leading-5" numberOfLines={2}>
        {item.description}
      </Text>

      {/* Indicatore stato autenticazione */}
      {!user && !authLoading && (
        <View className="mt-3 pt-3 border-t border-neutral-100">
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
            <Text className="text-xs text-orange-600 font-medium">
              Tocca per accedere e aggiungere ai promemoria
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-12">
      <Text className="text-lg font-medium text-neutral-500 mb-2">Nessun risultato</Text>
      <Text className="text-sm text-neutral-400 text-center px-8">
        Non abbiamo trovato oggetti che corrispondono alla tua ricerca
      </Text>
    </View>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.name}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={items.length === 0 ? renderEmptyState : null}
    />
  );
}