import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { TextInput, View } from 'react-native'

const searchBar = () => {
  return (
    <View className="flex-row items-center p-3 border border-gray-300 rounded-lg">
        <Ionicons name="search" size={20} color="#6b7280" className="mr-2" />
        <TextInput
          onPress={() => {}}
          placeholder="Search"
          className="flex-1 text-base text-gray-900"
          placeholderTextColor="#6b7280"
        />
    </View>
  )
}

export default searchBar