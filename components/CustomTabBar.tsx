import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ffffff',
      borderTopWidth: 0.5,
      borderTopColor: '#e5e5e5',
      paddingBottom: Platform.OS === 'ios' ? 20 : 8,
      paddingTop: 8,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 16,
      }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getIconName = (): keyof typeof Ionicons.glyphMap => {
            switch (route.name) {
              case 'index':
                return isFocused ? 'home' : 'home-outline';
              case 'search':
                return isFocused ? 'search' : 'search-outline';
              case 'stats':
                return isFocused ? 'stats-chart' : 'stats-chart-outline';
              case 'profile':
                return isFocused ? 'person-circle' : 'person-circle-outline';
              default:
                return 'help-outline';
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
              }}
              activeOpacity={0.6}
            >
              <Ionicons
                name={getIconName()}
                size={28}
                color={isFocused ? '#2563eb' : '#6b7280'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}