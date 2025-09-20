// hooks/useAuth.tsx
import { useAuth as useAuthContext } from '../contexts/authContext';

export const useAuth = useAuthContext;

// Hook per componenti che richiedono autenticazione
export function useRequireAuth() {
  const auth = useAuthContext();
  
  return {
    ...auth,
    isAuthenticated: !!auth.user && !auth.loading
  };
}