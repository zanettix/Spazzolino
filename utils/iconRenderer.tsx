import { Entypo, FontAwesome5, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';

type IconFamily = 'Ionicons' | 'MaterialCommunityIcons' | 'MaterialIcons' | 'Entypo' | 'FontAwesome5' | 'FontAwesome6';

interface IconProps {
  family: IconFamily | string | null;
  name: string | null;
  size?: number;
  color?: string;
}

export const renderIcon = ({ family, name, size = 24, color = '#000' }: IconProps) => {
  if (!family || !name) {
    return <Ionicons name="help-circle-outline" size={size} color={color} />;
  }

  const iconFamily = family.toLowerCase().trim();

  switch (iconFamily) {
    case 'ionicons':
      return <Ionicons name={name as any} size={size} color={color} />;
    case 'materialcommunityicons':
      return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
    case 'materialicons':
      return <MaterialIcons name={name as any} size={size} color={color} />;
    case 'entypo':
      return <Entypo name={name as any} size={size} color={color} />;
    case 'fontawesome5':
      return <FontAwesome5 name={name as any} size={size} color={color} />;
    case 'fontawesome6':
      return <FontAwesome6 name={name as any} size={size} color={color} />;
    default:
      return <Ionicons name="help-circle-outline" size={size} color={color} />;
  }
};

export const getIconComponent = (family: IconFamily | string | null) => {
  if (!family) return Ionicons;

  const iconFamily = family.toLowerCase().trim();

  switch (iconFamily) {
    case 'ionicons':
      return Ionicons;
    case 'materialcommunityicons':
      return MaterialCommunityIcons;
    case 'materialicons':
      return MaterialIcons;
    case 'entypo':
      return Entypo;
    case 'fontawesome5':
      return FontAwesome5;
    case 'fontawesome6':
      return FontAwesome6;
    default:
      return Ionicons;
  }
};