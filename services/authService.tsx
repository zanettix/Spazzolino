// services/authService.ts
import { UserLogin } from '@/types/userLogin';
import { UserRegistration } from '@/types/userRegistration';
import { supabase } from '../utils/supabase';

export class AuthService {

  static async signIn(credentials: UserLogin) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante il login',
      };
    }
  }

  static async signUp(credentials: UserRegistration) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            nickname: credentials.nickname,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        needsVerification: !data.session, // Se non c'è sessione, serve verifica email
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante la registrazione',
      };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante il logout',
      };
    }
  }

  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        session,
        user: session?.user || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore nel recupero della sessione',
      };
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const result = await this.getCurrentSession();
    return result.success && !!result.session;
  }

  /**
   * Ottiene i dati del profilo utente
   */
  static async getUserProfile() {
    try {
      const sessionResult = await this.getCurrentSession();
      if (!sessionResult.success || !sessionResult.user) {
        throw new Error('Utente non autenticato');
      }

      return {
        success: true,
        profile: {
          id: sessionResult.user.id,
          email: sessionResult.user.email,
          nickname: sessionResult.user.user_metadata?.nickname || 'Utente',
          emailConfirmed: sessionResult.user.email_confirmed_at !== null,
          createdAt: sessionResult.user.created_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore nel recupero del profilo',
      };
    }
  }

  /**
   * Valida i dati di login
   */
  static validateLoginData(credentials: UserLogin): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!credentials.email) {
      errors.push('Email è richiesta');
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.push('Email non valida');
    }

    if (!credentials.password) {
      errors.push('Password è richiesta');
    } else if (credentials.password.length < 6) {
      errors.push('Password deve essere di almeno 6 caratteri');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }


  static validateRegistrationData(credentials: UserRegistration): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!credentials.nickname) {
      errors.push('Nickname è richiesto');
    } else if (credentials.nickname.length < 2) {
      errors.push('Nickname deve essere di almeno 2 caratteri');
    }

    // Riusa la validazione del login
    const loginValidation = this.validateLoginData({
      email: credentials.email,
      password: credentials.password,
    });
    
    errors.push(...loginValidation.errors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}