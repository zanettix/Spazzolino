// components/authWrapper.tsx
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallbackMessage?: string;
}

export default function AuthWrapper({ 
  children, 
  requireAuth = true, 
  fallbackMessage = "Accedi per utilizzare questa funzione" 
}: AuthWrapperProps) {
  const { user, loading, signIn, signUp } = useAuth();
  
  // Stati per la form di autenticazione
  const [isLogin, setIsLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Mostra loading durante il controllo iniziale della sessione
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary-500 justify-center items-center">
        <Text className="text-white text-3xl font-bold mb-4">
          Spazzolino
        </Text>
        <Text className="text-primary-100 text-center mb-6">
          La tua salute e igiene quotidiana
        </Text>
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );
  }

  // Se l'utente è autenticato o l'auth non è richiesta, mostra il contenuto
  if (!requireAuth || user) {
    return <>{children}</>;
  }

  // Funzioni di validazione e gestione form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email) {
      newErrors.email = 'Email è richiesta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    if (!formData.password) {
      newErrors.password = 'Password è richiesta';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password deve essere di almeno 6 caratteri';
    }

    if (!isLogin && !formData.nickname) {
      newErrors.nickname = 'Nickname è richiesto';
    } else if (!isLogin && formData.nickname.length < 2) {
      newErrors.nickname = 'Nickname deve essere di almeno 2 caratteri';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

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
        
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = 'Email o password non corretti';
            break;
          case 'User already registered':
            errorMessage = 'Questo indirizzo email è già registrato';
            break;
          case 'Email not confirmed':
            errorMessage = 'Conferma il tuo indirizzo email prima di accedere';
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      Alert.alert('Errore', errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', nickname: '' });
    setErrors({});
  };

  const handleToggleMode = () => {
    if (authLoading) return;
    setIsLogin(!isLogin);
    resetForm();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Renderizza la schermata di autenticazione
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
          {/* Header */}
          <View className="bg-primary-500 pt-16 pb-8 px-6">
            <Text className="text-white text-3xl font-bold text-center mb-2">
              Spazzolino
            </Text>
            <Text className="text-primary-100 text-center text-lg">
              La tua salute e igiene quotidiana
            </Text>
          </View>

          {/* Main Content */}
          <View className="flex-1 px-6 py-8">
            <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              {/* Toggle Buttons - SEMPLIFICATO */}
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

              {/* Form Fields */}
              {!isLogin && (
                <View className="mb-5">
                  <Text className="text-neutral-700 font-medium mb-2">
                    Nickname
                  </Text>
                  <TextInput
                    className={`border rounded-xl px-4 py-4 bg-neutral-50 ${
                      errors.nickname ? 'border-red-500' : 'border-neutral-200'
                    }`}
                    placeholder="Il tuo nickname"
                    value={formData.nickname}
                    onChangeText={(value) => updateField('nickname', value)}
                    autoCapitalize="words"
                    editable={!authLoading}
                    maxLength={30}
                  />
                  {errors.nickname && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors.nickname}
                    </Text>
                  )}
                </View>
              )}

              <View className="mb-5">
                <Text className="text-neutral-700 font-medium mb-2">
                  Email
                </Text>
                <TextInput
                  className={`border rounded-xl px-4 py-4 bg-neutral-50 ${
                    errors.email ? 'border-red-500' : 'border-neutral-200'
                  }`}
                  placeholder="la.tua@email.com"
                  value={formData.email}
                  onChangeText={(value) => updateField('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!authLoading}
                />
                {errors.email && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </Text>
                )}
              </View>

              <View className="mb-6">
                <Text className="text-neutral-700 font-medium mb-2">
                  Password
                </Text>
                <TextInput
                  className={`border rounded-xl px-4 py-4 bg-neutral-50 ${
                    errors.password ? 'border-red-500' : 'border-neutral-200'
                  }`}
                  placeholder="La tua password"
                  value={formData.password}
                  onChangeText={(value) => updateField('password', value)}
                  secureTextEntry
                  autoComplete="password"
                  editable={!authLoading}
                />
                {errors.password && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </Text>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={{
                  paddingVertical: 16,
                  borderRadius: 12,
                  marginBottom: 16,
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
                    fontSize: 18
                  }}>
                    {isLogin ? 'Accedi' : 'Registrati'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Alternative Action */}
              <TouchableOpacity onPress={handleToggleMode} disabled={authLoading}>
                <Text className="text-neutral-500 text-center">
                  {isLogin 
                    ? "Non hai un account? Registrati" 
                    : "Hai già un account? Accedi"
                  }
                </Text>
              </TouchableOpacity>
            </View>

            {/* Additional Info */}
            <View className="bg-primary-50 rounded-xl p-4 mb-6">
              <Text className="text-primary-700 font-medium text-center mb-2">
                🦷 Perché registrarsi?
              </Text>
              <Text className="text-primary-600 text-center text-sm leading-5">
                Sincronizza i tuoi promemoria su tutti i dispositivi e non perdere mai 
                una sostituzione importante per la tua salute
              </Text>
            </View>

            {/* Preview Message */}
            <View className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <Text className="text-orange-600 font-medium text-center mb-1">
                👀 Modalità Anteprima
              </Text>
              <Text className="text-neutral-600 text-center text-sm">
                {fallbackMessage}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}