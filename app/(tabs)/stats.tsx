import { WelcomeScreen } from '@/components/welcomeScreen';
import { useAuth } from '@/hooks/useAuth';
import { Text, View } from 'react-native';

const Stats = () => {
  const { user, loading: authLoading } = useAuth();

  if (!user && !authLoading) {
    return <WelcomeScreen />;
  }

  return (
    <View>
      <Text>stats</Text>
    </View>
  );
};

export default Stats;