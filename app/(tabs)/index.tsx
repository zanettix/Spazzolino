import { CatalogPreview } from "@/components/catalogPreview";
import SearchBar from "@/components/searchBar";
import { useCatalog } from "@/hooks/useCatalog";
import { Item } from "@/models/item";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const { 
    catalog, 
    loading, 
    error, 
    refreshCatalog
  } = useCatalog();

  // Stato per i risultati della ricerca
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleItemPress = (item: Item) => {
    router.push({
      pathname: '/[item]', 
      params: { 
        item: item.name,
        description: item.description,
        category: item.category,
        duration:item.duration_days,
        link: item.link,
        icon: item.icon
      }
    });
  };

  // Gestisce i risultati della ricerca
  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
    setIsSearchActive(results.length > 0);
  };

  // Determina quali dati mostrare: risultati ricerca o catalogo completo
  const displayData = isSearchActive ? searchResults : catalog;

  const renderHeader = () => (
    <View className="mb-6 px-5">
      <Text className="text-2xl font-bold text-neutral-900 text-center mb-1">
        Spazzolino
      </Text>
      <Text className="text-base text-neutral-600 text-center">
        {loading 
          ? 'Caricamento...' 
          : isSearchActive 
            ? `${searchResults.length} risultat${searchResults.length === 1 ? 'o trovato' : 'i trovati'}`
            : `${catalog.length} oggett${catalog.length === 1 ? 'o' : 'i'} disponibili`
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="flex-1 pt-4">
        {/* Header */}
        {renderHeader()}
        
        {/* Search Bar - Solo ricerca nel catalogo */}
        {!loading && !error && (
          <SearchBar
            onFilteredData={handleSearchResults}
            placeholder="Cerca per nome, categoria o descrizione"
            defaultSearchType="catalog"
            showTabs={false} // Nascondi i tabs dato che cerchiamo solo nel catalogo
          />
        )}
        
        {/* Lista oggetti con CatalogPreview */}
        <CatalogPreview
          items={displayData}
          loading={loading}
          error={error}
          onItemPress={handleItemPress}
          onRetry={refreshCatalog}
        />
      </View>
    </SafeAreaView>
  );
}