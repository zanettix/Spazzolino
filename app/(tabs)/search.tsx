import { CatalogPreview } from "@/components/catalogPreview";
import Filter from "@/components/filter";
import { RequestItemModal } from "@/components/requestModal";
import SearchBar from "@/components/searchBar";
import { useCatalog } from "@/hooks/useCatalog";
import { Item } from "@/models/item";
import { ItemService } from "@/services/itemService";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ItemPopularity {
  name: string;
  count: number;
}

export default function Search() {
  const router = useRouter();
  const { 
    catalog, 
    loading, 
    error, 
    refreshCatalog
  } = useCatalog();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterResults, setFilterResults] = useState<Item[]>([]);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [popularityData, setPopularityData] = useState<ItemPopularity[]>([]);
  const [loadingPopularity, setLoadingPopularity] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    fetchPopularityData();
  }, []);

  const fetchPopularityData = async () => {
    setLoadingPopularity(true);
    try {
      const { data, error } = await ItemService.getAllUserItemsCount();
      if (!error && data) {
        setPopularityData(data);
      }
    } finally {
      setLoadingPopularity(false);
    }
  };

  const handleItemPress = (item: Item) => {
    router.push({
      pathname: '/[item]', 
      params: { 
        item: item.name,
        description: item.description,
        category: item.category,
        duration: item.duration_days,
        link: item.link,
        icon: item.icon,
        icon_family: item.icon_family
      }
    });
  };

  const handleFilterChange = (filtered: Item[]) => {
    setFilterResults(filtered);
    setIsFilterActive(true);
  };

  const handleResetFilter = () => {
    setIsFilterActive(false);
    setFilterResults([]);
  };

  const baseDataForSearch = isFilterActive ? filterResults : catalog;

  const sortedByPopularity = useMemo(() => {
    if (loadingPopularity || popularityData.length === 0) {
      return baseDataForSearch;
    }

    return [...baseDataForSearch].sort((a, b) => {
      const aPopularity = popularityData.find(p => p.name === a.name)?.count || 0;
      const bPopularity = popularityData.find(p => p.name === b.name)?.count || 0;
      
      if (aPopularity === bPopularity) {
        return a.name.localeCompare(b.name);
      }
      
      return bPopularity - aPopularity;
    });
  }, [baseDataForSearch, popularityData, loadingPopularity]);

  const displayData = useMemo(() => {
    if (!searchQuery.trim()) {
      return sortedByPopularity;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    
    return sortedByPopularity.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      (item.description && item.description.toLowerCase().includes(lowercaseQuery)) ||
      (item.category && item.category.toLowerCase().includes(lowercaseQuery))
    );
  }, [searchQuery, sortedByPopularity]);

  const renderHeader = () => (
    <View className="mb-6 px-5">
      <Text className="text-2xl font-bold text-neutral-900 text-center mb-1">
        Spazzolino
      </Text>
      <Text className="text-base text-neutral-600 text-center">
        {loading 
          ? 'Caricamento...' 
          : `${displayData.length} oggett${displayData.length === 1 ? 'o' : 'i'} disponibili`
        }
      </Text>
    </View>
  );

  const renderRequestButton = () => (
    <View className="px-5 py-4">
      <TouchableOpacity
        className="bg-white border border-primary-500 rounded-lg py-2.5 px-4 flex-row items-center justify-center"
        onPress={() => setShowRequestModal(true)}
        activeOpacity={0.7}
      >
        <Text className="text-neutral-600 text-xs font-medium">
          Suggerisci un oggetto
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-12 px-5">
      <Text className="text-lg font-medium text-neutral-500 mb-2">Nessun risultato</Text>
      <Text className="text-sm text-neutral-400 text-center mb-6">
        Non trovi il tuo oggetto nel catalogo? Suggeriscilo e lo valuteremo.
      </Text>
      <TouchableOpacity
        className="bg-primary-500 px-6 py-3 rounded-xl flex-row items-center"
        onPress={() => setShowRequestModal(true)}
        activeOpacity={0.7}
      >
        <Text className="text-white font-semibold text-base">
          Suggerisci un nuovo oggetto
        </Text>
      </TouchableOpacity>
    </View>
  );

  const handleRefresh = async () => {
    await Promise.all([
      refreshCatalog(),
      fetchPopularityData()
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor="#3b82f6"
            colors={["#3b82f6"]}
            title="Aggiornamento catalogo..."
            titleColor="#737373"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: Platform.OS === 'ios' ? 100 : 80
        }}
      >
        <View className="pt-4">
          {renderHeader()}
          
          {!loading && !error && (
            <View className="px-5 mb-4">
              <View className="flex-row items-start gap-3">
                <View className="flex-1">
                  <SearchBar
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    placeholder="Cerca"
                  />
                </View>
                
                <Filter 
                  onFilterChange={handleFilterChange}
                  allItems={catalog}
                  onReset={handleResetFilter}
                  isActive={isFilterActive}
                />
              </View>
            </View>
          )}
          
          <View className="flex-1">
            {!loading && !error && displayData.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <CatalogPreview
                  items={displayData}
                  loading={false}
                  error={error}
                  onItemPress={handleItemPress}
                  onRetry={handleRefresh}
                />
                {!loading && !error && displayData.length > 0 && renderRequestButton()}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <RequestItemModal 
        visible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={refreshCatalog}
      />
    </SafeAreaView>
  );
}