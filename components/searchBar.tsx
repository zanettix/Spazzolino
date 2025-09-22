import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  data: any[]; // Array di oggetti da filtrare
  onFilteredData: (filteredData: any[]) => void; // Callback con risultati filtrati
  searchFields: string[]; // Campi su cui effettuare la ricerca
  placeholder?: string;
}

export default function SearchBar({ 
  data,
  onFilteredData,
  searchFields,
  placeholder = "Cerca oggetti..." 
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Logica di filtro autonoma
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }
    
    return data.filter(item => {
      return searchFields.some(field => {
        const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], item);
        return fieldValue?.toString().toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, searchFields]);

  // Notifica il componente padre ogni volta che i dati filtrati cambiano
  React.useEffect(() => {
    onFilteredData(filteredData);
  }, [filteredData, onFilteredData]);

  const handleClear = () => {
    setSearchQuery("");
  };

  const handleChangeText = (text: string) => {
    setSearchQuery(text);
  };

  return (
    <View className="bg-white rounded-xl mx-5 mb-4 shadow-sm border border-neutral-100">
      <View className="flex-row items-center px-4 py-3">
        <Ionicons 
          name="search" 
          size={20} 
          color="#737373" 
          className="mr-3" 
        />
        
        <TextInput
          value={searchQuery}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="#a3a3a3"
          className="flex-1 text-base text-neutral-800"
          returnKeyType="search"
        />
        
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={handleClear}
            className="ml-2 p-1"
            activeOpacity={0.7}
          >
            <Ionicons 
              name="close-circle" 
              size={20} 
              color="#a3a3a3" 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}