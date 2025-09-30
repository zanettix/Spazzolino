import { useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

interface AuthBtnProps {
  variant?: 'primary' | 'secondary';
  text?: string;
}

export function AuthBtn({ variant = 'primary', text = 'Accedi' }: AuthBtnProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push('/(tabs)/profile');
  };

  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`px-6 py-3 rounded-lg ${
        isPrimary ? 'bg-primary-500' : 'bg-white border border-primary-500'
      }`}
      activeOpacity={0.7}
    >
      <Text className={`font-medium text-center ${
        isPrimary ? 'text-white' : 'text-primary-500'
      }`}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}