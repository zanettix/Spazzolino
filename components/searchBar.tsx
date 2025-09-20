import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface searchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export default function SearchBar({ 
  value, 
  onChangeText, 
  placeholder = "Cerca oggetti...", 
  onClear 
}: searchBarProps) {
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
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#a3a3a3"
          className="flex-1 text-base text-neutral-800 font-inter"
          returnKeyType="search"
        />
        
        {value.length > 0 && (
          <TouchableOpacity 
            onPress={onClear}
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