import { useAuth as useAuthContext } from '../contexts/authContext';

export const useAuth = useAuthContext;

export function useRequireAuth() {
  const auth = useAuthContext();
  
  return {
    ...auth,
    isAuthenticated: !!auth.user && !auth.loading
  };
}