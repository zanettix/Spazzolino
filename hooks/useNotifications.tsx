import { ItemService } from '@/services/itemService';
import { NotificationService } from '@/services/notificationService';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

export interface NotificationState {
  isInitialized: boolean;
  hasPermissions: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useNotifications = () => {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<NotificationState>({
    isInitialized: false,
    hasPermissions: false,
    isLoading: false,
    error: null,
  });

  // Ref per evitare inizializzazioni multiple
  const initRef = useRef({
    hasInitialized: false,
    isInitializing: false,
    lastUserId: null as string | null,
  });

  // Inizializza le notifiche solo quando necessario
  const initializeNotifications = async () => {
    // Evita inizializzazioni multiple o durante il loading auth
    if (authLoading || 
        initRef.current.isInitializing || 
        (initRef.current.hasInitialized && initRef.current.lastUserId === user?.id)) {
      return;
    }

    if (!user) {
      setState({
        isInitialized: false,
        hasPermissions: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      initRef.current.isInitializing = true;
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('🔔 Inizializzazione sistema notifiche...');

      // Inizializza il servizio notifiche
      const permissionsGranted = await NotificationService.initializeNotifications();
      
      if (permissionsGranted) {
        console.log('✅ Permessi notifiche concessi, sincronizzazione in corso...');
        // Sincronizza le notifiche con gli oggetti attivi
        const syncResult = await ItemService.syncNotifications();
        console.log(`🔄 Sincronizzazione completata: ${syncResult.synchronized} oggetti`);
      } else {
        console.log('❌ Permessi notifiche non concessi');
      }

      setState({
        isInitialized: true,
        hasPermissions: permissionsGranted,
        isLoading: false,
        error: permissionsGranted ? null : 'Permessi notifiche non concessi',
      });

      // Aggiorna i riferimenti
      initRef.current.hasInitialized = true;
      initRef.current.lastUserId = user.id;

    } catch (error) {
      console.error('Errore inizializzazione notifiche:', error);
      setState({
        isInitialized: false,
        hasPermissions: false,
        isLoading: false,
        error: 'Errore durante l\'inizializzazione delle notifiche',
      });
    } finally {
      initRef.current.isInitializing = false;
    }
  };

  // Effect che si attiva solo quando cambia l'utente autenticato
  useEffect(() => {
    // Reset quando l'utente cambia
    if (initRef.current.lastUserId && initRef.current.lastUserId !== user?.id) {
      initRef.current.hasInitialized = false;
      initRef.current.isInitializing = false;
      initRef.current.lastUserId = null;
    }

    // Inizializza solo se c'è un utente autenticato e non è in loading
    if (user && !authLoading) {
      console.log('👤 Utente autenticato trovato, inizializzazione notifiche...');
      initializeNotifications();
    }
  }, [user?.id, authLoading]); // Solo quando cambia l'ID utente o lo stato di loading

  // Gestisce le notifiche ricevute (setup una sola volta)
  useEffect(() => {
    // Listener per notifiche ricevute mentre l'app è in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📨 Notifica ricevuta in foreground:', notification.request.content.title);
    });

    // Listener per quando l'utente tocca una notifica
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Utente ha toccato la notifica:', response.notification.request.content.title);
      
      const data = response.notification.request.content.data;
      
      // Qui puoi aggiungere logica di navigazione basata sui dati della notifica
      if (data?.itemName) {
        console.log(`🔍 Notifica per oggetto: ${data.itemName}, tipo: ${data.type}`);
        // Esempio: router.push(`/item/${data.itemName}`);
      }
    });

    return () => {
      // Cleanup dei listener
      notificationListener.remove();
      responseListener.remove();
    };
  }, []); // Solo al mount del componente

  // Richiedi permessi manualmente
  const requestPermissions = async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      console.log('🔍 Richiesta permessi notifiche...');
      
      const granted = await NotificationService.requestPermissions();
      
      setState(prev => ({
        ...prev,
        hasPermissions: granted,
        isLoading: false,
        error: granted ? null : 'Permessi notifiche negati',
      }));

      if (granted && user) {
        console.log('✅ Permessi concessi, sincronizzazione...');
        await ItemService.syncNotifications();
      }

      return granted;
    } catch (error) {
      console.error('Errore richiesta permessi:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Errore durante la richiesta permessi',
      }));
      return false;
    }
  };

  return {
    ...state,
    initializeNotifications,
    requestPermissions,
  };
};