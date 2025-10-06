import { useAuth } from '@/hooks/useAuth';
import { StatsService } from '@/services/statsService';
import { supabase } from '@/utils/supabase';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, Text, View } from 'react-native';

interface HeatmapData {
  date: string;
  count: number;
}

const HeatmapCalendar = () => {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const { user } = useAuth();
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (user) {
      initializeStartDate();
    } else {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user && startDate) {
        loadHeatmapData();
      }
    }, [user, startDate])
  );

  const initializeStartDate = async () => {
    const createdAt = (await supabase.auth.getUser()).data.user?.created_at;
    const userStartDate = createdAt ? new Date(createdAt) : new Date();
    setStartDate(userStartDate);
  };

  const loadHeatmapData = async () => {
    if (!startDate) return;
    
    setLoading(true);

    const { data: heatmapData, error } = await StatsService.getHeatmapData(startDate);

    if (error || !heatmapData) {
      setLoading(false);
      return;
    }

    setData(heatmapData);
    setLoading(false);
  };

  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getColorForCount = (count: number): string => {
    if (count === 0) return 'bg-neutral-100';
    if (count === 1) return 'bg-primary-200';
    if (count === 2) return 'bg-primary-400';
    return 'bg-primary-600';
  };

  const generateMonthlyData = () => {
    if (!startDate) return [];
    
    const today = new Date();
    const monthsData: { month: string; days: { date: string; count: number; day: number }[] }[] = [];
    
    const start = new Date(startDate);
    const monthsDiff = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
    
    for (let i = 0; i <= monthsDiff; i++) {
      const targetDate = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const monthName = targetDate.toLocaleString('it-IT', { month: 'short' });
      const year = targetDate.getFullYear();
      const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
      
      const monthDays: { date: string; count: number; day: number }[] = [];
      
      const startDay = (i === 0) ? start.getDate() : 1;
      
      for (let day = startDay; day <= daysInMonth; day++) {
        const currentDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), day);
        if (currentDate <= today) {
          const dateStr = formatDateLocal(currentDate);
          const dayData = data.find((d) => d.date === dateStr);
          
          monthDays.push({
            date: dateStr,
            count: dayData?.count || 0,
            day: day,
          });
        }
      }
      
      if (monthDays.length > 0) {
        monthsData.push({
          month: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`,
          days: monthDays,
        });
      }
    }
    
    return monthsData;
  };

  const monthsData = generateMonthlyData();
  const cellSize = Math.floor((screenWidth - 80) / 7);

  return (
    <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-sm border border-neutral-100">
      <View className="mb-6">
        <Text className="text-neutral-900 font-inter-semibold text-lg mb-1">
          Heatmap
        </Text>
        <Text className="text-neutral-600 font-inter text-sm">
          Ogni cerchio rappresenta un giorno. I colori più intensi indicano più sostituzioni effettuate
        </Text>
      </View>

      {loading ? (
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            className="max-h-96"
          >
            {monthsData.map((monthData, monthIndex) => (
              <View key={monthIndex} className="mb-6">
                <Text className="text-neutral-700 font-inter-semibold text-sm mb-3">
                  {monthData.month}
                </Text>
                
                <View className="flex-row flex-wrap">
                  {monthData.days.map((dayData, dayIndex) => (
                    <View 
                      key={dayIndex} 
                      className="items-center mb-2"
                      style={{ width: cellSize }}
                    >
                      <View 
                        className={`rounded-full ${getColorForCount(dayData.count)}`}
                        style={{ 
                          width: cellSize - 8, 
                          height: cellSize - 8 
                        }}
                      />
                      <Text className="text-neutral-500 font-inter text-[9px] mt-1">
                        {dayData.day}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          <View className="flex-row items-center justify-center mt-6 pt-4 border-t border-neutral-200">
            <View className="flex-row items-center">
              <View className="items-center mr-3">
                <View className="w-6 h-6 rounded-full bg-neutral-100 mb-1" />
                <Text className="text-neutral-500 font-inter text-[10px]">0</Text>
              </View>
              <View className="items-center mr-3">
                <View className="w-6 h-6 rounded-full bg-primary-200 mb-1" />
                <Text className="text-neutral-500 font-inter text-[10px]">1</Text>
              </View>
              <View className="items-center mr-3">
                <View className="w-6 h-6 rounded-full bg-primary-400 mb-1" />
                <Text className="text-neutral-500 font-inter text-[10px]">2</Text>
              </View>
              <View className="items-center">
                <View className="w-6 h-6 rounded-full bg-primary-600 mb-1" />
                <Text className="text-neutral-500 font-inter text-[10px]">3+</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default HeatmapCalendar;