import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import defaultItems from "../../assets/data/defaultItems.json";
import SearchBar from "../../components/searchBar";
import { useAuth } from "../../hooks/useAuth";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [filteredItems, setFilteredItems] = useState(defaultItems.defaultItems);

  const handleItemPress = (item: any) => {
    // Naviga sempre alla pagina di dettaglio
    // La gestione dell'autenticazione avviene in item.tsx
    router.push({
      pathname: '/(details)/item',
      params: { 
        itemName: item.name,
        itemId: item.name.toLowerCase().replace(/\s+/g, '-')
      }
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-neutral-100"
      onPress={() => handleItemPress(item)}
      disabled={loading}
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
      {!user && !loading && (
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
      <Text className="text-lg font-medium text-neutral-500 mb-2">
        Nessun risultato
      </Text>
      <Text className="text-sm text-neutral-400 text-center px-8">
        Non abbiamo trovato oggetti che corrispondono alla tua ricerca
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View className="mb-6 px-5">
      <Text className="text-2xl font-bold text-neutral-900 text-center mb-1">
        Spazzolino
      </Text>
      <Text className="text-base text-neutral-600 text-center">
        {filteredItems.length} oggett{filteredItems.length === 1 ? 'o' : 'i'} 
        {filteredItems.length === defaultItems.defaultItems.length ? ' disponibili' : ' trovati'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="flex-1 pt-4">
        {/* Header */}
        {renderHeader()}
        
        {/* Search Bar Autonoma */}
        <SearchBar
          data={defaultItems.defaultItems}
          onFilteredData={setFilteredItems}
          searchFields={['name', 'category', 'description']}
          placeholder="Cerca per nome, categoria o descrizione..."
        />
        
        {/* Lista oggetti */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={filteredItems.length === 0 ? renderEmptyState : null}
        />
      </View>
    </SafeAreaView>
  );
}