import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, MessageResponse } from '@/@types/auth';

const STORAGE_AUTH_KEY = '@futfoto:auth';

// Instância base do axios para quando conectar à API real
export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const authData = await AsyncStorage.getItem(STORAGE_AUTH_KEY);
  if (authData) {
    const { token } = JSON.parse(authData);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function login(email: string, _password: string): Promise<AuthState> {
  // Mock de autenticação com roles
  const isAdmin = email.toLowerCase().includes('admin');
  const mockAuth: AuthState = {
    token: 'mock-jwt-token-' + Date.now(),
    user: {
      id: '1',
      name: email.split('@')[0] || 'Jogador',
      email: email,
      roles: isAdmin ? [{ name: 'ROLE_ADMIN' }, { name: 'ROLE_USER' }] : [{ name: 'ROLE_USER' }],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60',
    },
    roles: isAdmin ? [{ name: 'ROLE_ADMIN' }, { name: 'ROLE_USER' }] : [{ name: 'ROLE_USER' }],
  };

  await AsyncStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(mockAuth));
  return mockAuth;
}

export async function register(name: string, email: string, _password: string): Promise<AuthState> {
  const mockAuth: AuthState = {
    token: 'mock-jwt-token-' + Date.now(),
    user: {
      id: '2',
      name,
      email,
      roles: [{ name: 'ROLE_USER' }],
    },
    roles: [{ name: 'ROLE_USER' }],
  };

  await AsyncStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(mockAuth));
  return mockAuth;
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_AUTH_KEY);
}

export async function getMessage(): Promise<MessageResponse> {
  // Simula busca de mensagem do servidor/backend
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        message: 'Bem-vindo ao FutFoto! Sistema de gerenciamento e fotos de futebol ativo.',
        timestamp: new Date().toISOString(),
      });
    }, 600);
  });
}
