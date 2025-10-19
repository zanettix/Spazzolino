import { useAuth } from '@/hooks/useAuth';
import { StatsService } from '@/services/statsService';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

interface CategoryData {
  name: string;
  count: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

const CategoryDistributionChart = () => {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const screenWidth = Dimensions.get('window').width;

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadCategoryDistribution();
      }
    }, [user])
  );

  const loadCategoryDistribution = async () => {
    setLoading(true);
    const { data: categoryData, error } = await StatsService.getCategoryDistribution();

    if (error || !categoryData) {
      setLoading(false);
      return;
    }

    const formattedData: CategoryData[] = categoryData.map((item) => ({
      name: getCategoryDisplayName(item.category),
      count: item.count,
      color: getCategoryColor(item.category),
      legendFontColor: '#737373',
      legendFontSize: 13,
    }));

    setData(formattedData);
    setLoading(false);
  };

  const getCategoryDisplayName = (category: string): string => {
    const names: { [key: string]: string } = {
      'igiene_personale': 'Igiene',
      'bagno': 'Bagno',
      'cucina': 'Cucina',
    };
    return names[category] || category;
  };

    const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
        'igiene_personale': '#3b82f6',
        'bagno': '#60a5fa',
        'cucina': '#10b981',
    };
    return colors[category] || '#737373';
    };

  const chartConfig = {
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(115, 115, 115, ${opacity})`,
    propsForLabels: {
      fontFamily: 'Inter-Medium',
    },
  };

  const totalItems = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-sm border border-neutral-100">
      <View className="mb-6">
        <Text className="text-neutral-900 font-inter-semibold text-lg mb-1">
          Distribuzione per Categoria
        </Text>
        <Text className="text-neutral-600 font-inter text-sm">
          Percentuale di oggetti per ogni categoria
        </Text>
      </View>

      {loading ? (
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : data.length === 0 ? (
        <View className="items-center justify-center py-8">
          <Text className="text-neutral-500 font-inter text-sm text-center">
            Nessun oggetto registrato ancora
          </Text>
        </View>
      ) : (
        <>
          <View className="items-center mb-6">
            <PieChart
              data={data}
              width={screenWidth - 80}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>

          <View className="border-t border-neutral-200 pt-4">
            <Text className="text-neutral-700 font-inter-semibold text-sm mb-3">
              Dettagli
            </Text>
            {data.map((item, index) => {
              const percentage = ((item.count / totalItems) * 100).toFixed(1);
              return (
                <View key={index} className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-neutral-900 font-inter-medium text-sm">
                      {item.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-neutral-700 font-inter-bold text-sm mr-2">
                      {item.count}
                    </Text>
                    <Text className="text-neutral-500 font-inter text-xs">
                      ({percentage}%)
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
};

export default CategoryDistributionChart;