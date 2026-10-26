import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
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

// SecureStore aceita apenas caracteres alfanuméricos, '.', '-' e '_'.
const SECURE_AUTH_KEY = 'futfoto_auth_v2';
const LEGACY_STORAGE_KEY = '@futfoto:auth:v2';

// O token em si fica no cookie httpOnly do servidor. No SecureStore guardamos
// os dados da sessão do usuário (id, nome, roles) com proteção de hardware (Keystore / Keychain).
async function getStoredAuth(): Promise<AuthState | null> {
  try {
    if (Platform.OS !== 'web') {
      const isAvailable = await SecureStore.isAvailableAsync().catch(() => false);
      if (isAvailable) {
        const storagedAuth = await SecureStore.getItemAsync(SECURE_AUTH_KEY);
        if (storagedAuth) {
          return JSON.parse(storagedAuth);
        }
      }
    }

    // Fallback para Web ou migração da versão anterior salva em AsyncStorage
    const legacyAuth = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyAuth) {
      const parsed = JSON.parse(legacyAuth);
      if (Platform.OS !== 'web') {
        const isAvailable = await SecureStore.isAvailableAsync().catch(() => false);
        if (isAvailable) {
          await SecureStore.setItemAsync(SECURE_AUTH_KEY, legacyAuth);
          await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
        }
      }
      return parsed;
    }
  } catch (error) {
    console.error('Erro ao ler sessão armazenada:', error);
  }
  return null;
}

async function setStoredAuth(novoAuth: AuthState): Promise<void> {
  const jsonValue = JSON.stringify(novoAuth);
  try {
    if (Platform.OS !== 'web') {
      const isAvailable = await SecureStore.isAvailableAsync().catch(() => false);
      if (isAvailable) {
        await SecureStore.setItemAsync(SECURE_AUTH_KEY, jsonValue);
        await AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => {});
        return;
      }
    }
    await AsyncStorage.setItem(LEGACY_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Erro ao salvar sessão no SecureStore:', error);
  }
}

async function removeStoredAuth(): Promise<void> {
  try {
    if (Platform.OS !== 'web') {
      const isAvailable = await SecureStore.isAvailableAsync().catch(() => false);
      if (isAvailable) {
        await SecureStore.deleteItemAsync(SECURE_AUTH_KEY).catch(() => {});
      }
    }
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => {});
  } catch (error) {
    console.error('Erro ao remover sessão:', error);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStorageAuth() {
      try {
        const storagedAuth = await getStoredAuth();
        if (storagedAuth) {
          setAuth(storagedAuth);
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
    await setStoredAuth(novoAuth);
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
      await removeStoredAuth();
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
