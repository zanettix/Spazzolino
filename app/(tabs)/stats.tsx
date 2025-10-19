import HeatmapCalendar from '@/components/visualization/heatmap';
import TopRenewedChart from '@/components/visualization/topRenewedChart';
import { WelcomeScreen } from '@/components/welcomeScreen';
import { useAuth } from '@/hooks/useAuth';
import { useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Platform, ScrollView, Text, View, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Stats = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return <WelcomeScreen />;
  }

  const visualizations = [
    { id: 'heatmap', title: 'Calendario', component: <HeatmapCalendar /> },
    { id: 'top-replaced', title: 'Top 5', component: <TopRenewedChart /> },
  ];

  const infiniteData = [
    ...visualizations,
    ...visualizations,
    ...visualizations,
  ];

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index ?? 0;
      setActiveIndex(index % visualizations.length);
    }
  }).current;

  const onMomentumScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);

    if (index === 0) {
      flatListRef.current?.scrollToIndex({ index: visualizations.length, animated: false });
    } else if (index === infiniteData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: visualizations.length - 1, animated: false });
    }
  };

  const renderHeader = () => (
    <View className="mb-6 px-5 py-4">
      <Text className="text-2xl font-bold text-neutral-900 text-center mb-1">
        Statistiche
      </Text>
      <Text className="text-base text-neutral-600 text-center">
        Visualizza i tuoi progressi
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: typeof visualizations[0] }) => (
    <View style={{ width }}>
      {item.component}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: Platform.OS === 'ios' ? 100 : 80
        }}
      >
        {renderHeader()}

        {visualizations.length > 1 && (
          <View className="flex-row justify-center py-4 px-4">
            {visualizations.map((viz, index) => (
              <View
                key={viz.id}
                className={`h-2 rounded-full mx-1 ${
                  index === activeIndex ? 'bg-primary-500 w-8' : 'bg-neutral-300 w-2'
                }`}
              />
            ))}
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={infiniteData}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          onMomentumScrollEnd={onMomentumScrollEnd}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50
          }}
          initialScrollIndex={visualizations.length}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          scrollEnabled={visualizations.length > 1}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Stats;