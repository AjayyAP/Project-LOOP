import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

const tokenKey = 'project_loop_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(tokenKey);
    setUser(null);
  }, []);

  const setSession = useCallback((token, nextUser) => {
    localStorage.setItem(tokenKey, token);
    setUser(nextUser);
  }, []);

  useEffect(() => {
    async function restoreSession() {
      if (!localStorage.getItem(tokenKey)) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data.user);
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, [logout]);

  const value = useMemo(() => ({ user, isLoading, isAuthenticated: Boolean(user), setSession, logout }), [user, isLoading, setSession, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
