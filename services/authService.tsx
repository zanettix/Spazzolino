import { UserLogin } from '@/types/userLogin';
import { UserRegistration } from '@/types/userRegistration';
import { AuthValidation } from '@/utils/authValidation';
import { supabase } from '@/utils/supabase';


export class AuthService {

  static async login(credentials: UserLogin) {
    try {
      const validation = AuthValidation.validateLogin(credentials);
      
      if (!validation.isValid) {
        throw new Error(validation.errors[0]); 
      }

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
      const validation = AuthValidation.validateRegistration(credentials);
      
      if (!validation.isValid) {
        throw new Error(validation.errors[0]); 
      }

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
        needsVerification: !data.session, 
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante la registrazione',
      };
    }
  }

  static async logOut() {
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
}