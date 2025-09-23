import { ItemService } from '@/services/itemService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

type SearchType = 'catalog' | 'user_items';

interface SearchBarProps {
  onFilteredData: (filteredData: any[]) => void; // Callback con risultati filtrati
  placeholder?: string;
  userId?: string; // ID utente per ricerca user_items
  defaultSearchType?: SearchType; // Tipo di ricerca predefinito
  showTabs?: boolean; // Mostra/nasconde i tabs per selezionare il tipo di ricerca
}

export default function SearchBar({ 
  onFilteredData,
  placeholder = "Cerca oggetti...",
  userId,
  defaultSearchType = 'catalog',
  showTabs = true
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>(defaultSearchType);

  // Funzione per eseguire la ricerca
  const performSearch = async (query: string, type: SearchType) => {
    if (!query.trim()) {
      onFilteredData([]);
      return;
    }

    setIsSearching(true);
    try {
      let result;
      
      if (type === 'catalog') {
        result = await ItemService.searchCatalog(query);
      } else {
        result = await ItemService.searchUserItem(query, userId);
      }

      if (result.error) {
        console.error(`Errore ricerca ${type}:`, result.error);
        onFilteredData([]);
      } else {
        onFilteredData(result.data || []);
      }
    } catch (error) {
      console.error(`Errore ricerca ${type}:`, error);
      onFilteredData([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Effect per gestire la ricerca con debounce
  useEffect(() => {
    if (searchQuery.trim()) {
      // Debounce per evitare troppe chiamate API
      const timeoutId = setTimeout(() => {
        performSearch(searchQuery, searchType);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      onFilteredData([]);
    }
  }, [searchQuery, searchType, userId]);

  const handleClear = () => {
    setSearchQuery("");
    onFilteredData([]);
  };

  const handleChangeText = (text: string) => {
    setSearchQuery(text);
  };

  const handleTabPress = (type: SearchType) => {
    setSearchType(type);
    // Rilancia la ricerca con il nuovo tipo se c'è una query
    if (searchQuery.trim()) {
      performSearch(searchQuery, type);
    }
  };

  return (
    <View className="mx-5 mb-4">
      {/* Tabs per selezionare il tipo di ricerca */}
      {showTabs && (
        <View className="flex-row bg-neutral-100 rounded-lg p-1 mb-3">
          <TouchableOpacity
            onPress={() => handleTabPress('catalog')}
            className={`flex-1 py-2 px-4 rounded-md ${
              searchType === 'catalog' 
                ? 'bg-white shadow-sm' 
                : 'bg-transparent'
            }`}
            activeOpacity={0.7}
          >
            <Text className={`text-center text-sm font-medium ${
              searchType === 'catalog' 
                ? 'text-primary-600' 
                : 'text-neutral-600'
            }`}>
              Catalogo
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleTabPress('user_items')}
            className={`flex-1 py-2 px-4 rounded-md ${
              searchType === 'user_items' 
                ? 'bg-white shadow-sm' 
                : 'bg-transparent'
            }`}
            activeOpacity={0.7}
          >
            <Text className={`text-center text-sm font-medium ${
              searchType === 'user_items' 
                ? 'text-primary-600' 
                : 'text-neutral-600'
            }`}>
              I Miei Oggetti
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Barra di ricerca */}
      <View className="bg-white rounded-xl shadow-sm border border-neutral-100">
        <View className="flex-row items-center px-4 py-3">
          <Ionicons 
            name={isSearching ? "hourglass" : "search"} 
            size={20} 
            color="#737373" 
            className="mr-3" 
          />
          
          <TextInput
            value={searchQuery}
            onChangeText={handleChangeText}
            placeholder={`${placeholder} ${searchType === 'catalog' ? 'nel catalogo' : 'nei tuoi oggetti'}`}
            placeholderTextColor="#a3a3a3"
            className="flex-1 text-base text-neutral-800"
            returnKeyType="search"
            editable={!isSearching}
          />
          
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={handleClear}
              className="ml-2 p-1"
              activeOpacity={0.7}
              disabled={isSearching}
            >
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={isSearching ? "#d4d4d4" : "#a3a3a3"} 
              />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Indicatore del tipo di ricerca attuale */}
        {searchQuery.length > 0 && (
          <View className="px-4 pb-2">
            <Text className="text-xs text-neutral-500">
              {isSearching 
                ? `Cercando ${searchType === 'catalog' ? 'nel catalogo' : 'nei tuoi oggetti'}...`
                : `Risultati ${searchType === 'catalog' ? 'dal catalogo' : 'dai tuoi oggetti'}`
              }
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}