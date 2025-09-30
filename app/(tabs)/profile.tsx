import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthForm from '../../components/authForm';
import { useAuth } from '../../hooks/useAuth';

export default function Profile() {
  const { user, loading, signOut } = useAuth();

  if (!user && !loading) {
    return (
      <AuthForm 
        requireAuth={true}
        showCancelButton={false} 
      >
        <></>
      </AuthForm>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-neutral-600 mt-4">Caricamento profilo...</Text>
      </SafeAreaView>
    );
  }

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Sei sicuro di voler uscire dal tuo account?",
      [
        {
          text: "Annulla",
          style: "cancel"
        },
        {
          text: "Esci",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert(
                "Errore",
                "Si è verificato un errore durante il logout. Riprova."
              );
            }
          }
        }
      ]
    );
  };

  const getUserInitials = (nickname: string): string => {
    if (!nickname) return "U";
    const words = nickname.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return nickname.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const userNickname = user?.user_metadata?.nickname || 'Utente';
  const userEmail = user?.email || '';
  const userCreatedAt = user?.created_at || '';
  const emailConfirmed = user?.email_confirmed_at !== null;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-primary-500 px-6 pt-8 pb-12">
          <Text className="text-white text-2xl font-bold text-center mb-2">
            Il mio Profilo
          </Text>
          <Text className="text-primary-100 text-center">
            Gestisci il tuo account Spazzolino
          </Text>
        </View>

        {/* User Avatar Section */}
        <View className="px-6 -mt-8">
          <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-primary-500 rounded-full items-center justify-center mb-4">
                <Text className="text-white text-xl font-bold">
                  {getUserInitials(userNickname)}
                </Text>
              </View>
              
              <Text className="text-xl font-semibold text-neutral-800 mb-1">
                {userNickname}
              </Text>
              
              <View className="flex-row items-center">
                <Text className="text-neutral-600 mr-2">
                  {userEmail}
                </Text>
                {emailConfirmed ? (
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="alert-circle" size={16} color="#f59e0b" />
                  </View>
                )}
              </View>
            </View>

            <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <View className="flex-row items-center justify-center">
                <Ionicons name="checkmark-circle" size={20} color="#10b981" className="mr-2" />
                <Text className="text-green-600 font-medium ml-2">
                  Account Attivo
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View className="px-6 mb-6">
          <View className="bg-white rounded-2xl shadow-sm p-6">
            <Text className="text-lg font-semibold text-neutral-800 mb-4">
              Informazioni Account
            </Text>
            
            <View className="space-y-4">
              <View className="border-b border-neutral-100 pb-4">
                <Text className="text-sm text-neutral-500 mb-1">Nickname</Text>
                <Text className="text-base text-neutral-800 font-medium">
                  {userNickname}
                </Text>
              </View>
              
              <View className="border-b border-neutral-100 pb-4">
                <Text className="text-sm text-neutral-500 mb-1">Email</Text>
                <Text className="text-base text-neutral-800">
                  {userEmail}
                </Text>
              </View>
              
              <View className="border-b border-neutral-100 pb-4">
                <Text className="text-sm text-neutral-500 mb-1">Stato Email</Text>
                <View className="flex-row items-center">
                  <Text className="text-base text-neutral-800 mr-2">
                    {emailConfirmed ? 'Verificata' : 'Non verificata'}
                  </Text>
                  <Ionicons 
                    name={emailConfirmed ? "checkmark-circle" : "alert-circle"} 
                    size={16} 
                    color={emailConfirmed ? "#10b981" : "#f59e0b"} 
                  />
                </View>
              </View>
              
              <View>
                <Text className="text-sm text-neutral-500 mb-1">Membro dal</Text>
                <Text className="text-base text-neutral-800">
                  {userCreatedAt ? formatDate(userCreatedAt) : 'Data non disponibile'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            className="bg-red-500 rounded-xl py-4 shadow-sm"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text className="text-white font-semibold text-lg ml-2">
                Esci dall'account
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}