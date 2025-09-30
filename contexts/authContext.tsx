import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AuthService } from '../services/authService';
import { AuthContextType } from '../types/authContextType';
import { AuthState } from '../types/authState';
import { UserLogin } from '../types/userLogin';
import { UserRegistration } from '../types/userRegistration';
import { supabase } from '../utils/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  const initializationRef = useRef({
    hasInitialized: false,
    isInitializing: false
  });

  useEffect(() => {
    if (initializationRef.current.hasInitialized || initializationRef.current.isInitializing) {
      return;
    }
    initializationRef.current.isInitializing = true;

    const getInitialSession = async () => {
      try {
        const result = await AuthService.getCurrentSession();
        
        if (result.success) {
          setAuthState({
            user: result.user,
            session: result.session,
            loading: false,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Errore nel recupero sessione iniziale:', error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
        });
      } finally {
        initializationRef.current.isInitializing = false;
        initializationRef.current.hasInitialized = true;
      }
    };

    getInitialSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        
        // Evita di processare eventi durante l'inizializzazione
        if (initializationRef.current.isInitializing) {
          return;
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); 

  const signIn = async (credentials: UserLogin) => {
    const result = await AuthService.login(credentials);
    
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const signUp = async (credentials: UserRegistration) => {
    const result = await AuthService.signUp(credentials);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    // Se l'utente deve verificare l'email
    if (result.needsVerification) {
      throw new Error('VERIFICATION_REQUIRED');
    }
  };

  const signOut = async () => {
    const result = await AuthService.logOut();
    
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}