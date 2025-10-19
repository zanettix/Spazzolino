import { Item } from "@/models/item";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

type SortOption = 'none' | 'expiring_soon' | 'expiring_late';

interface FilterProps {
  onFilterChange: (filteredData: Item[]) => void;
  allItems: Item[];
  onReset: () => void;
  isActive?: boolean;
}

const CATEGORIES: Item['category'][] = [
  'igiene_personale',
  'bagno',
  'cucina'
];

const CATEGORY_LABELS: Record<Item['category'], string> = {
  igiene_personale: 'Igiene Personale',
  bagno: 'Bagno',
  cucina: 'Cucina'
};

export default function Filter({ onFilterChange, allItems, onReset, isActive = false }: FilterProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Item['category'][]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('none');

  const toggleCategory = (category: Item['category']) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const applyFilters = () => {
    if (selectedCategories.length === 0 && sortOption === 'none') {
      onReset();
      setIsModalVisible(false);
      return;
    }

    let filtered = [...allItems];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => 
        selectedCategories.includes(item.category)
      );
    }

    if (sortOption === 'expiring_soon') {
      filtered.sort((a, b) => {
        if (!a.expired_at) return 1;
        if (!b.expired_at) return -1;
        return new Date(a.expired_at).getTime() - new Date(b.expired_at).getTime();
      });
    } else if (sortOption === 'expiring_late') {
      filtered.sort((a, b) => {
        if (!a.expired_at) return -1;
        if (!b.expired_at) return 1;
        return new Date(b.expired_at).getTime() - new Date(a.expired_at).getTime();
      });
    }
    
    onFilterChange(filtered);
    setIsModalVisible(false);
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSortOption('none');
    onReset();
    setIsModalVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setIsModalVisible(true)}
        className={`w-12 h-12 rounded-xl items-center justify-center ${
          isActive 
            ? 'bg-primary-500 active:bg-primary-600' 
            : 'bg-neutral-100 active:bg-neutral-200'
        }`}
      >
        <Ionicons 
          name="filter" 
          size={20} 
          color={isActive ? "#ffffff" : "#737373"} 
        />
      </Pressable>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl h-4/5">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-200">
              <Text className="text-xl font-bold text-neutral-900">Filtri</Text>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                className="p-2"
              >
                <Ionicons name="close" size={24} color="#737373" />
              </Pressable>
            </View>

            <ScrollView className="flex-1 px-5 py-4">
              <View className="mb-6">
                <Text className="text-lg font-semibold text-neutral-900 mb-3">
                  Categorie
                </Text>
                {CATEGORIES.map(category => (
                  <Pressable
                    key={category}
                    onPress={() => toggleCategory(category)}
                    className={`flex-row items-center justify-between p-4 mb-2 rounded-xl ${
                      selectedCategories.includes(category)
                        ? 'bg-primary-50 border-2 border-primary-500'
                        : 'bg-neutral-100 border-2 border-transparent'
                    }`}
                  >
                    <Text className={`text-base ${
                      selectedCategories.includes(category)
                        ? 'text-primary-700 font-semibold'
                        : 'text-neutral-700'
                    }`}>
                      {CATEGORY_LABELS[category]}
                    </Text>
                    {selectedCategories.includes(category) && (
                      <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                    )}
                  </Pressable>
                ))}
              </View>

              <View className="mb-6">
                <Text className="text-lg font-semibold text-neutral-900 mb-3">
                  Ordina per scadenza
                </Text>
                
                <Pressable
                  onPress={() => setSortOption('none')}
                  className={`flex-row items-center justify-between p-4 mb-2 rounded-xl ${
                    sortOption === 'none'
                      ? 'bg-primary-50 border-2 border-primary-500'
                      : 'bg-neutral-100 border-2 border-transparent'
                  }`}
                >
                  <Text className={`text-base ${
                    sortOption === 'none'
                      ? 'text-primary-700 font-semibold'
                      : 'text-neutral-700'
                  }`}>
                    Nessun ordinamento
                  </Text>
                  {sortOption === 'none' && (
                    <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                  )}
                </Pressable>

                <Pressable
                  onPress={() => setSortOption('expiring_soon')}
                  className={`flex-row items-center justify-between p-4 mb-2 rounded-xl ${
                    sortOption === 'expiring_soon'
                      ? 'bg-primary-50 border-2 border-primary-500'
                      : 'bg-neutral-100 border-2 border-transparent'
                  }`}
                >
                  <Text className={`text-base ${
                    sortOption === 'expiring_soon'
                      ? 'text-primary-700 font-semibold'
                      : 'text-neutral-700'
                  }`}>
                    Prima in scadenza
                  </Text>
                  {sortOption === 'expiring_soon' && (
                    <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                  )}
                </Pressable>

                <Pressable
                  onPress={() => setSortOption('expiring_late')}
                  className={`flex-row items-center justify-between p-4 mb-2 rounded-xl ${
                    sortOption === 'expiring_late'
                      ? 'bg-primary-50 border-2 border-primary-500'
                      : 'bg-neutral-100 border-2 border-transparent'
                  }`}
                >
                  <Text className={`text-base ${
                    sortOption === 'expiring_late'
                      ? 'text-primary-700 font-semibold'
                      : 'text-neutral-700'
                  }`}>
                    Ultima in scadenza
                  </Text>
                  {sortOption === 'expiring_late' && (
                    <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                  )}
                </Pressable>
              </View>
            </ScrollView>

            <View className="px-5 py-4 border-t border-neutral-200 flex-row gap-3">
              <Pressable
                onPress={resetFilters}
                className="flex-1 bg-neutral-200 rounded-xl py-3 items-center active:bg-neutral-300"
              >
                <Text className="text-neutral-700 font-semibold">Reset</Text>
              </Pressable>
              
              <Pressable
                onPress={applyFilters}
                className="flex-1 bg-primary-500 rounded-xl py-3 items-center active:bg-primary-600"
              >
                <Text className="text-white font-semibold">Applica</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}