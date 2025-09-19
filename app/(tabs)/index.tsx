import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { SearchBar } from "react-native-screens";

export default function Index() {
  const router = useRouter();
  
  return (
    <View className="flex-1 items-center justify-center">
      <ScrollView className="flex-1 px-5"
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{minHeight: '100%', paddingBottom: 10}}>

        <View className="flex-1 mt-5">
          <SearchBar />
        </View>
      </ScrollView>
    </View>
  );
}
