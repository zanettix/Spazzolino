import { useRouter } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import defaultItems from "../../assets/data/defaultItems.json";

export default function Index() {
  const router = useRouter();

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-neutral-100 active:bg-neutral-50">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold text-neutral-800 flex-1">{item.name}</Text>
        <View className="bg-primary-100 px-3 py-1 rounded-full">
          <Text className="text-xs font-medium text-primary-700 capitalize">
            {item.category.replace('_', ' ')}
          </Text>
        </View>
      </View>
      
      <View className="flex-row items-center mb-2">
        <View className="w-2 h-2 bg-secondary-500 rounded-full mr-2" />
        <Text className="text-sm font-medium text-secondary-600">
          {item.duration_days} giorni
        </Text>
      </View>
      
      <Text className="text-sm text-neutral-600 leading-5" numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-neutral-50 pt-12 px-5">
      {/* Header con nuovo styling */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-neutral-900 text-center mb-1">
          Spazzolino
        </Text>
        <Text className="text-base text-neutral-600 text-center">
          {defaultItems.defaultItems.length} oggetti disponibili
        </Text>
      </View>
      
      {/* Lista oggetti con nuovo styling */}
      <FlatList
        data={defaultItems.defaultItems}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}