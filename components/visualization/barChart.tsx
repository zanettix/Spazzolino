import { ItemService } from '@/services/itemService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

const StatsOverview = () => {
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [expiredItems, setExpiredItems] = useState(0);
  const [upcomingItems, setUpcomingItems] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const { data: userItems } = await ItemService.getUserItems();

    if (userItems) {
      const now = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const expired = userItems.filter(item => new Date(item.expired_at) < now).length;
      const upcoming = userItems.filter(item => {
        const expDate = new Date(item.expired_at);
        return expDate >= now && expDate <= sevenDaysFromNow;
      }).length;

      setTotalItems(userItems.length);
      setExpiredItems(expired);
      setUpcomingItems(upcoming);
    }

    setLoading(false);
  };

  return (
    <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-sm border border-neutral-100">
      <View className="mb-6">
        <Text className="text-neutral-900 font-inter-semibold text-lg mb-1">
          Riepilogo
        </Text>
        <Text className="text-neutral-600 font-inter text-sm">
          Panoramica dei tuoi oggetti
        </Text>
      </View>

      {loading ? (
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <View className="space-y-4">
          <View className="flex-row items-center justify-between p-4 bg-primary-50 rounded-xl">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-primary-500 rounded-full items-center justify-center">
                <Ionicons name="albums-outline" size={24} color="white" />
              </View>
              <View className="ml-4">
                <Text className="text-neutral-600 font-inter text-sm">Totale oggetti</Text>
                <Text className="text-neutral-900 font-inter-bold text-2xl">{totalItems}</Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between p-4 bg-error/10 rounded-xl">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-error rounded-full items-center justify-center">
                <Ionicons name="alert-circle-outline" size={24} color="white" />
              </View>
              <View className="ml-4">
                <Text className="text-neutral-600 font-inter text-sm">Scaduti</Text>
                <Text className="text-neutral-900 font-inter-bold text-2xl">{expiredItems}</Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between p-4 bg-warning/10 rounded-xl">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-warning rounded-full items-center justify-center">
                <Ionicons name="time-outline" size={24} color="white" />
              </View>
              <View className="ml-4">
                <Text className="text-neutral-600 font-inter text-sm">In scadenza (7gg)</Text>
                <Text className="text-neutral-900 font-inter-bold text-2xl">{upcomingItems}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default StatsOverview;