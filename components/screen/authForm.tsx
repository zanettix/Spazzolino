import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthFormProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  showCancelButton?: boolean;
  onCancel?: () => void;
}

export default function AuthForm({ 
  children, 
  requireAuth = true,
  showCancelButton = false,
  onCancel
}: AuthFormProps) {
  const { user, loading, signIn, signUp } = useAuth();
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: ''
  });

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary-500 justify-center items-center">
        <Text className="text-white text-3xl font-bold mb-4">Spazzolino</Text>
        <Text className="text-primary-100 text-center mb-6">
          La tua salute e igiene quotidiana
        </Text>
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );
  }

  if (!requireAuth || user) {
    return <>{children}</>;
  }

  const handleSubmit = async () => {
    setAuthLoading(true);
    
    try {
      if (isLogin) {
        await signIn({
          email: formData.email.trim(),
          password: formData.password
        });
      } else {
        await signUp({
          email: formData.email.trim(),
          password: formData.password,
          nickname: formData.nickname.trim()
        });
      }
    } catch (error) {
      let errorMessage = 'Si è verificato un errore imprevisto';
      
      if (error instanceof Error) {
        if (error.message === 'VERIFICATION_REQUIRED') {
          Alert.alert(
            'Registrazione completata!', 
            'Controlla la tua email per verificare l\'account prima di accedere.',
            [{ text: 'OK', onPress: () => setIsLogin(true) }]
          );
          resetForm();
          return;
        }
        errorMessage = error.message;
      }
      
      Alert.alert('Errore', errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', nickname: '' });
  };

  const handleToggleMode = () => {
    if (authLoading) return;
    setIsLogin(!isLogin);
    resetForm();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-primary-500 pt-16 pb-8 px-6">
            <Text className="text-white text-3xl font-bold text-center mb-2">
              Spazzolino
            </Text>
            <Text className="text-primary-100 text-center text-lg">
              La tua salute e igiene quotidiana
            </Text>
          </View>

          <View className="flex-1 px-6 py-8">
            <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              
              <View className="flex-row bg-neutral-100 rounded-xl p-1 mb-8">
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    borderRadius: 8,
                    backgroundColor: isLogin ? 'white' : 'transparent',
                  }}
                  onPress={handleToggleMode}
                  disabled={authLoading}
                >
                  <Text style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    color: isLogin ? '#2563eb' : '#6b7280'
                  }}>
                    Accedi
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    borderRadius: 8,
                    backgroundColor: !isLogin ? 'white' : 'transparent',
                  }}
                  onPress={handleToggleMode}
                  disabled={authLoading}
                >
                  <Text style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    color: !isLogin ? '#2563eb' : '#6b7280'
                  }}>
                    Registrati
                  </Text>
                </TouchableOpacity>
              </View>

              {!isLogin && (
                <View className="mb-5">
                  <Text className="text-neutral-700 font-medium mb-2">
                    Nickname
                  </Text>
                  <TextInput
                    className="border border-neutral-200 rounded-xl px-4 py-4 bg-neutral-50"
                    placeholder="Il tuo nickname"
                    value={formData.nickname}
                    onChangeText={(value) => updateField('nickname', value)}
                    autoCapitalize="words"
                    editable={!authLoading}
                    maxLength={30}
                  />
                </View>
              )}

              <View className="mb-5">
                <Text className="text-neutral-700 font-medium mb-2">Email</Text>
                <TextInput
                  className="border border-neutral-200 rounded-xl px-4 py-4 bg-neutral-50"
                  placeholder="la.tua@email.com"
                  value={formData.email}
                  onChangeText={(value) => updateField('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!authLoading}
                />
              </View>

              <View className="mb-6">
                <Text className="text-neutral-700 font-medium mb-2">Password</Text>
                <TextInput
                  className="border border-neutral-200 rounded-xl px-4 py-4 bg-neutral-50"
                  placeholder="La tua password"
                  value={formData.password}
                  onChangeText={(value) => updateField('password', value)}
                  secureTextEntry
                  autoComplete="password"
                  editable={!authLoading}
                />
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  style={{
                    flex: showCancelButton ? 2 : 1,
                    paddingVertical: showCancelButton ? 14 : 16,
                    borderRadius: 12,
                    backgroundColor: authLoading ? '#d1d5db' : '#3b82f6'
                  }}
                  onPress={handleSubmit}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={{
                      color: 'white',
                      fontWeight: '600',
                      textAlign: 'center',
                      fontSize: showCancelButton ? 16 : 18
                    }}>
                      {isLogin ? 'Accedi' : 'Registrati'}
                    </Text>
                  )}
                </TouchableOpacity>

                {showCancelButton && (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: '#e5e5e5',
                      backgroundColor: 'white'
                    }}
                    onPress={handleCancel}
                    disabled={authLoading}
                  >
                    <Text style={{
                      color: '#737373',
                      fontWeight: '600',
                      textAlign: 'center',
                      fontSize: 16
                    }}>
                      Annulla
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}