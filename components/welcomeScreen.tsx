import { AuthBtn } from "@/components/button/authBtn";
import { Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const WelcomeScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <View 
        className="flex-1 justify-center items-center px-5" 
        style={{ paddingBottom: Platform.OS === 'ios' ? 100 : 80 }}
      >
        <Text className="text-2xl font-bold text-neutral-900 mb-2 text-center">
          Benvenuto in Spazzolino!
        </Text>
        <Text className="text-base text-neutral-600 text-center mb-6">
          Accedi per gestire i tuoi promemoria e tenere traccia dei tuoi oggetti
        </Text>
        <AuthBtn />
      </View>
    </SafeAreaView>
  );
};