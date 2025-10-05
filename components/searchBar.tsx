import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ 
  searchQuery,
  onSearchQueryChange,
  placeholder = "Cerca oggetti..."
}: SearchBarProps) {

  const handleClear = () => {
    onSearchQueryChange("");
  };

  return (
    <View>
      <View className="bg-white rounded-xl shadow-sm border border-neutral-100">
        <View className="flex-row items-center px-4 py-3">
          <Ionicons 
            name="search" 
            size={20} 
            color="#737373" 
            className="mr-3" 
          />
          
          <TextInput
            value={searchQuery}
            onChangeText={onSearchQueryChange}
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
    </View>
  );
}