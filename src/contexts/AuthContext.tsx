import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState } from '@/@types/auth';

interface AuthContextData {
  auth: AuthState | null;
  setAuth: React.Dispatch<React.SetStateAction<AuthState | null>>;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const STORAGE_AUTH_KEY = '@futfoto:auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStorageAuth() {
      try {
        const storagedAuth = await AsyncStorage.getItem(STORAGE_AUTH_KEY);
        if (storagedAuth) {
          setAuth(JSON.parse(storagedAuth));
        }
      } catch (error) {
        console.error('Erro ao carregar dados de autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStorageAuth();
  }, []);

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_AUTH_KEY);
      setAuth(null);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
