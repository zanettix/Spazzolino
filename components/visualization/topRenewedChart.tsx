import { useAuth } from '@/hooks/useAuth';
import { StatsService } from '@/services/statsService';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

interface TopItemData {
  name: string;
  times: number;
  category: string;
  icon: string;
  icon_family: string;
}

const TopRenewedChart = () => {
  const [data, setData] = useState<TopItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadTopReplacedItems();
      }
    }, [user])
  );

  const loadTopReplacedItems = async () => {
    setLoading(true);
    const { data: topItems, error } = await StatsService.getTopReplacedItems(5);

    if (error || !topItems) {
      setLoading(false);
      return;
    }

    setData(topItems);
    setLoading(false);
  };

  const maxTimes = data.length > 0 ? Math.max(...data.map(item => item.times)) : 1;

  const getBarWidthPercentage = (times: number) => {
    return (times / maxTimes) * 100;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'igiene_personale': 'bg-primary-500',
      'bagno': 'bg-blue-500',
      'cucina': 'bg-green-500',
    };
    return colors[category] || 'bg-neutral-500';
  };

  const getIconComponent = (iconFamily: string) => {
    switch (iconFamily) {
      case 'Ionicons':
        return Ionicons;
      case 'MaterialCommunityIcons':
        return MaterialCommunityIcons;
      case 'FontAwesome5':
        return FontAwesome5;
      default:
        return Ionicons;
    }
  };

  return (
    <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-sm border border-neutral-100">
      <View className="mb-6">
        <Text className="text-neutral-900 font-inter-semibold text-lg mb-1">
          Top 5 Sostituzioni
        </Text>
        <Text className="text-neutral-600 font-inter text-sm">
          Grafico a barre che mostra i 5 oggetti che hai sostituito più volte
        </Text>
      </View>

      {loading ? (
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : data.length === 0 ? (
        <View className="items-center justify-center py-8">
          <Text className="text-neutral-500 font-inter text-sm text-center">
            Nessuna sostituzione registrata ancora
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
          {data.map((item, index) => {
            const IconComponent = getIconComponent(item.icon_family);
            const barWidth = getBarWidthPercentage(item.times);
            
            return (
              <View key={index} className="mb-5">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    <View className="w-9 h-9 rounded-full bg-primary-100 items-center justify-center mr-3">
                      <IconComponent name={item.icon as any} size={18} color="#3b82f6" />
                    </View>
                    <Text className="text-neutral-900 font-inter-medium text-sm flex-1" numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  <Text className="text-neutral-700 font-inter-bold text-base ml-2">
                    {item.times}
                  </Text>
                </View>
                
                <View className="h-7 bg-neutral-100 rounded-full overflow-hidden ml-12">
                  <View 
                    className={`h-full ${getCategoryColor(item.category)} rounded-full`}
                    style={{ width: `${barWidth}%` }}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default TopRenewedChart;