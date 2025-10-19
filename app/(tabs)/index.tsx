import { CameraScanner } from "@/components/cameraScanner";
import Filter from "@/components/filter";
import { ItemPreview } from "@/components/itemPreview";
import { WelcomeScreen } from "@/components/welcomeScreen";
import { useAuth } from "@/hooks/useAuth";
import { useUserItems } from "@/hooks/useItems";
import { Item } from "@/models/item";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    userItems, 
    loading, 
    error, 
    refreshUserItems
  } = useUserItems();

  const [filterResults, setFilterResults] = useState<Item[]>([]);
  const [isFilterActive, setIsFilterActive] = useState(false);

  useEffect(() => {
    if (user) {
      refreshUserItems();
    }
  }, [user?.id]);

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

  const displayData = isFilterActive ? filterResults : userItems;

  const getItemStats = () => {
    if (!displayData.length) return null;

    const now = new Date();
    const expired = displayData.filter(item => {
      if (!item.expired_at) return false;
      return new Date(item.expired_at) <= now;
    }).length;

    const expiringSoon = displayData.filter(item => {
      if (!item.expired_at) return false;
      const expiry = new Date(item.expired_at);
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7;
    }).length;

    return { expired, expiringSoon, total: displayData.length };
  };

  const stats = getItemStats();

  const renderHeader = () => (
    <View className="mb-6 px-5 py-4">
      <View className="flex-row items-center justify-center">
        <Text className="text-2xl font-bold text-neutral-900 text-center">
          I Miei Oggetti
        </Text>
        
        <View style={{ position: 'absolute', right: 0 }}>
          {user && <CameraScanner />}
        </View>
      </View>
      
      {loading ? (
        <Text className="text-base text-neutral-600 text-center mt-1">
          Caricamento...
        </Text>
      ) : stats ? (
        <View className="flex-row items-center justify-center flex-wrap mt-1">
          <Text className="text-sm text-neutral-600 mx-1">
            {stats.total} oggett{stats.total === 1 ? 'o attivo' : 'i attivi'}
          </Text>
        </View>
      ) : (
        <Text className="text-base text-neutral-600 text-center mt-1">
          Nessun oggetto attivo
        </Text>
      )}
    </View>
  );

  if (!user && !authLoading) {
   return <WelcomeScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshUserItems}
            tintColor="#3b82f6"
            colors={["#3b82f6"]}
            title="Aggiornamento oggetti..."
            titleColor="#737373"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: Platform.OS === 'ios' ? 100 : 80
        }}
      >
        {renderHeader()}
        
        <View className="flex-1">
          <ItemPreview
            items={displayData}
            loading={false}
            error={error}
            onItemPress={handleItemPress}
            onRetry={refreshUserItems}
          />
        </View>
      </ScrollView>

      {userItems.length > 0 && (
        <View 
          style={{
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 90 : 70,
            left: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <View className="bg-white rounded-full shadow-lg" style={{ elevation: 8 }}>
            <Filter 
              onFilterChange={handleFilterChange}
              allItems={userItems}
              onReset={handleResetFilter}
              isActive={isFilterActive}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}