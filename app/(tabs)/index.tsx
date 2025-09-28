import { ItemPreview } from "@/components/itemPreview";
import { useAuth } from "@/hooks/useAuth";
import { useUserItems } from "@/hooks/useItems";
import { Item } from "@/models/item";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    userItems, 
    loading, 
    error, 
    refreshUserItems
  } = useUserItems();

  // Auto-refresh quando la schermata torna in focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        refreshUserItems();
      }
    }, [user?.id]) // Solo quando cambia l'ID utente, non la funzione refreshUserItems
  );

  const handleItemPress = (item: Item) => {
    router.push({
      pathname: '/[item]', 
      params: { 
        item: item.name,
        description: item.description,
        category: item.category,
        duration: item.duration_days,
        link: item.link,
        icon: item.icon
      }
    });
  };

  // Funzione per contare oggetti per stato
  const getItemStats = () => {
    if (!userItems.length) return null;

    const now = new Date();
    const expired = userItems.filter(item => {
      if (!item.expired_at) return false;
      return new Date(item.expired_at) <= now;
    }).length;

    const expiringSoon = userItems.filter(item => {
      if (!item.expired_at) return false;
      const expiry = new Date(item.expired_at);
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7;
    }).length;

    return { expired, expiringSoon, total: userItems.length };
  };

  const stats = getItemStats();

  const renderHeader = () => (
    <View className="mb-6 px-5 py-4">
      <Text className="text-2xl font-bold text-neutral-900 text-center mb-1">
        I Miei Oggetti
      </Text>
      
      {user ? (
        <View className="items-center">
          {loading ? (
            <Text className="text-base text-neutral-600">
              Caricamento...
            </Text>
          ) : stats ? (
            <View className="flex-row items-center justify-center flex-wrap">
              <Text className="text-sm text-neutral-600 mx-1">
                {stats.total} oggett{stats.total === 1 ? 'o attivo' : 'i attivi'}
              </Text>
              {stats.expired > 0 && (
                <>
                  <Text className="text-neutral-300 mx-1">•</Text>
                  <Text className="text-sm text-red-600 font-medium mx-1">
                    {stats.expired} scadut{stats.expired === 1 ? 'o' : 'i'}
                  </Text>
                </>
              )}
              {stats.expiringSoon > 0 && (
                <>
                  <Text className="text-neutral-300 mx-1">•</Text>
                  <Text className="text-sm text-orange-600 font-medium mx-1">
                    {stats.expiringSoon} in scadenza
                  </Text>
                </>
              )}
            </View>
          ) : (
            <Text className="text-base text-neutral-600">
              Nessun oggetto attivo
            </Text>
          )}
        </View>
      ) : (
        <Text className="text-base text-neutral-600 text-center">
          Accedi per vedere i tuoi oggetti
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
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
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header con statistiche */}
        {renderHeader()}
        
        {/* Lista oggetti attivi dell'utente */}
        <View className="flex-1">
          <ItemPreview
            items={userItems}
            loading={false} // Gestiamo il loading tramite RefreshControl
            error={error}
            onItemPress={handleItemPress}
            onRetry={refreshUserItems}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}