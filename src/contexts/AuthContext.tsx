import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../lib/apiClient';

type ReactNode = React.ReactNode;

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
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const storedTokens = await AsyncStorage.getItem('tokens');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedTokens && storedUser) {
        const parsedTokens = JSON.parse(storedTokens);
        const parsedUser = JSON.parse(storedUser);

        setTokens(parsedTokens);
        setUser(parsedUser);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${parsedTokens.accessToken}`;
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setAuthData = async (user: User, tokens: Tokens) => {
    setUser(user);
    setTokens(tokens);
    await AsyncStorage.setItem('tokens', JSON.stringify(tokens));
    await AsyncStorage.setItem('user', JSON.stringify(user));
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
  };

  const clearAuthData = async () => {
    setUser(null);
    setTokens(null);
    await AsyncStorage.removeItem('tokens');
    await AsyncStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', { email, password, name });
      const { user: newUser, tokens: newTokens } = response.data.data;
      await setAuthData(newUser, newTokens);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user: newUser, tokens: newTokens } = response.data.data;
      await setAuthData(newUser, newTokens);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearAuthData();
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!user && !!tokens,
        isLoading,
        register,
        login,
        logout,
      }}
    >
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
