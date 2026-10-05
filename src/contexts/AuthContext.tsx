import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState } from '@/@types/auth';
import * as authIntegration from '@/integration/authIntegration';

interface AuthContextData {
  auth: AuthState | null;
  setAuth: React.Dispatch<React.SetStateAction<AuthState | null>>;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, email: string, cep: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Chave nova (v2) de propósito: invalida sessões "fake" salvas pelo login antigo (mock).
const STORAGE_AUTH_KEY = '@futfoto:auth:v2';

// O token em si fica no cookie httpOnly do servidor. Aqui guardamos só os dados
// públicos do usuário (id, nome, roles) para saber que ele está logado.
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

  async function saveAuth(novoAuth: AuthState) {
    await AsyncStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(novoAuth));
    setAuth(novoAuth);
  }

  const signIn = async (username: string, password: string) => {
    const novoAuth = await authIntegration.login(username.trim(), password);
    await saveAuth(novoAuth);
  };

  const signUp = async (username: string, password: string, email: string, cep: string) => {
    const novoAuth = await authIntegration.register(username.trim(), password, email.trim(), cep.trim());
    await saveAuth(novoAuth);
  };

  const signOut = async () => {
    try {
      await authIntegration.logout(); // limpa o cookie no servidor (melhor esforço)
      await AsyncStorage.removeItem(STORAGE_AUTH_KEY);
      setAuth(null);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, isLoading, signIn, signUp, signOut }}>
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
