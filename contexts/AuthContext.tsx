import {
  createContext, useCallback, useContext,
  useEffect, useMemo, useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import apiClient from '@/lib/api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const [accessToken, refreshToken, userStr] = await Promise.all([
          SecureStore.getItemAsync('accessToken'),
          SecureStore.getItemAsync('refreshToken'),
          SecureStore.getItemAsync('user'),
        ]);
        if (accessToken && refreshToken && userStr) {
          setTokens({ accessToken, refreshToken });
          setUser(JSON.parse(userStr));
        }
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const setAuthData = useCallback(async (u: User, t: Tokens) => {
    setUser(u);
    setTokens(t);
    await Promise.all([
      SecureStore.setItemAsync('accessToken', t.accessToken),
      SecureStore.setItemAsync('refreshToken', t.refreshToken),
      SecureStore.setItemAsync('user', JSON.stringify(u)),
    ]);
  }, []);

  const clearAuthData = useCallback(async () => {
    setUser(null);
    setTokens(null);
    await Promise.all([
      SecureStore.deleteItemAsync('accessToken'),
      SecureStore.deleteItemAsync('refreshToken'),
      SecureStore.deleteItemAsync('user'),
    ]);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { user: u, tokens: t } = response.data.data;
    await setAuthData(u, t);
  }, [setAuthData]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const response = await apiClient.post('/auth/register', { email, password, name });
    const { user: u, tokens: t } = response.data.data;
    await setAuthData(u, t);
  }, [setAuthData]);

  const logout = useCallback(() => {
    clearAuthData();
  }, [clearAuthData]);

  const value = useMemo<AuthContextType>(
    () => ({
      user, tokens,
      isAuthenticated: !!user && !!tokens,
      isLoading,
      login, register, logout,
    }),
    [user, tokens, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
