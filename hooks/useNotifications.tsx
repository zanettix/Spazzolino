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

  const initRef = useRef({
    hasInitialized: false,
    isInitializing: false,
    lastUserId: null as string | null,
  });

  const initializeNotifications = async () => {
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

      const permissionsGranted = await NotificationService.initializeNotifications();

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
    if (initRef.current.lastUserId && initRef.current.lastUserId !== user?.id) {
      initRef.current.hasInitialized = false;
      initRef.current.isInitializing = false;
      initRef.current.lastUserId = null;
    }

    if (user && !authLoading) {
      console.log('👤 Utente autenticato trovato, inizializzazione notifiche...');
      initializeNotifications();
    }
  }, [user?.id, authLoading]); 

  useEffect(() => {

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []); 

  const requestPermissions = async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const granted = await NotificationService.requestPermissions();
      
      setState(prev => ({
        ...prev,
        hasPermissions: granted,
        isLoading: false,
        error: granted ? null : 'Permessi notifiche negati',
      }));

      if (granted && user) {
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