import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const AUTH_KEY = 'ieadpe_auth';
const DEFAULT_PASSWORD = 'admin123';

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      setIsAuthenticated(true);
      setUser(stored);
    }
  }, []);

  const login = useCallback((password: string): boolean => {
    const adminPassword = process.env.GITHUB_PAGES === 'true'
      ? DEFAULT_PASSWORD
      : (import.meta as any).env?.VITE_ADMIN_PASSWORD || DEFAULT_PASSWORD;

    if (password === adminPassword) {
      localStorage.setItem(AUTH_KEY, 'admin');
      setIsAuthenticated(true);
      setUser('admin');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
