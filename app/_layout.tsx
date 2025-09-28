// app/_layout.tsx
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/utils/supabase';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider } from '../contexts/authContext';
import './globals.css';

// Componente interno per gestire le notifiche (ha accesso ai context)
function NotificationManager() {
  const { initializeNotifications, isInitialized, hasPermissions, error } = useNotifications();

  useEffect(() => {
    // Inizializza le notifiche quando l'app si avvia
    const setupApp = async () => {
      try {
        console.log('📱 Avvio app - Controllo autenticazione...');
        
        // Aspetta che Supabase sia pronto
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Errore nel recupero sessione:', sessionError);
          return;
        }
        
        if (session?.user) {
          console.log('👤 Utente autenticato trovato, inizializzazione notifiche...');
          await initializeNotifications();
        } else {
          console.log('👤 Nessun utente autenticato');
        }
      } catch (error) {
        console.error('Errore durante l\'inizializzazione app:', error);
      }
    };

    setupApp();
  }, [initializeNotifications]);

  // Ascolta i cambiamenti di autenticazione
  useEffect(() => {
    console.log('🔐 Configurazione listener autenticazione...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔐 Evento autenticazione: ${event}`);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ Utente autenticato, inizializzazione notifiche...');
        await initializeNotifications();
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 Utente disconnesso, cancellazione notifiche...');
        try {
          const { NotificationService } = await import('@/services/notificationService');
          await NotificationService.cancelAllNotifications();
          console.log('🗑️ Tutte le notifiche cancellate');
        } catch (error) {
          console.error('Errore nella cancellazione notifiche:', error);
        }
      }
    });

    return () => {
      console.log('🔐 Cleanup listener autenticazione');
      subscription.unsubscribe();
    };
  }, [initializeNotifications]);

  // Log dello stato delle notifiche per debug
  useEffect(() => {
    if (isInitialized) {
      console.log(`🔔 Notifiche inizializzate. Permessi: ${hasPermissions ? '✅' : '❌'}`);
      if (error) {
        console.warn(`⚠️ Errore notifiche: ${error}`);
      }
    }
  }, [isInitialized, hasPermissions, error]);

  return null; // Questo componente non renderizza nulla
}

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Gestione notifiche */}
      <NotificationManager />
      
      {/* StatusBar */}
      <StatusBar style="auto" />
      
      {/* Navigation Stack */}
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="(details)" 
          options={{ headerShown: false }}
        />
      </Stack>
    </AuthProvider>
  );
}