// app/(tabs)/index.tsx
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import defaultItems from "../../assets/data/defaultItems.json";
import SearchBar from "../../components/searchBar";
import { useAuth } from "../../hooks/useAuth";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Filtro gli oggetti in base alla query di ricerca
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return defaultItems.defaultItems;
    }
    
    return defaultItems.defaultItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleItemPress = (item: any) => {
    if (!user && !loading) {
      // Mostra un alert informativo
      Alert.alert(
        "Autenticazione richiesta",
        `Per aggiungere "${item.name}" ai tuoi promemoria devi prima accedere al tuo account.`,
        [
          {
            text: "Annulla",
            style: "cancel"
          },
          {
            text: "Accedi ora",
            onPress: () => {
              // Naviga verso la pagina protetta
              router.push({
                pathname: '/(details)/item',
                params: { 
                  itemName: item.name,
                  itemId: item.name.toLowerCase().replace(/\s+/g, '-')
                }
              });
            }
          }
        ]
      );
      return;
    }

    // Se l'utente è autenticato, naviga direttamente
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
        Non abbiamo trovato oggetti che corrispondono alla tua ricerca "{searchQuery}"
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
        {searchQuery ? ' trovati' : ' disponibili'}
      </Text>
      
      {/* Status autenticazione */}
      {!loading && (
        <View className="mt-3">
          {user ? (
            <View className="bg-green-50 border border-green-200 rounded-lg p-3">
              <View className="flex-row items-center justify-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-green-600 font-medium text-sm">
                  Benvenuto, {user.user_metadata?.nickname || 'Utente'}!
                </Text>
              </View>
            </View>
          ) : (
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Text className="text-blue-600 font-medium text-center text-sm">
                👆 Tocca un oggetto per iniziare a tracciarlo
              </Text>
              <Text className="text-blue-500 text-center text-xs mt-1">
                (Richiede autenticazione)
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="flex-1 pt-4">
        {/* Header */}
        {renderHeader()}
        
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={handleClearSearch}
          placeholder="Cerca per nome, categoria o descrizione..."
        />
        
        {/* Lista oggetti */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={searchQuery ? renderEmptyState : null}
        />
      </View>
    </SafeAreaView>
  );
}