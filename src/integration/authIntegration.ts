import axios from 'axios';
import { AuthClaims, AuthState, MessageResponse } from '@/@types/auth';
import * as authMock from './authMock';

// Backend de login da Fatec (Spring Boot + JWT).
// O token JWT fica num cookie httpOnly setado pelo servidor, por isso toda
// chamada precisa de `credentials: 'include'` (fetch) / `withCredentials` (axios).
export const API_URL = 'https://login-api-j9cl.onrender.com/fatec/login';

// false = usa a API de verdade acima (com cookie). É o que vale na entrega.
// true  = usa o login de mentira (contas salvas no aparelho, sem internet).
//         Serve pra testar o resto do app se a API estiver fora do ar.
//         Entra com "futfoto" / "123456" ou cadastra uma conta.
export const USE_MOCK = true;

// Tempo máximo de espera. O Render (plano grátis) pode levar ~1 min pra "acordar".
const TIMEOUT_MS = 60000;

// Instância do axios já pronta pra futuras chamadas autenticadas (envia o cookie).
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
});

// POST com cookie. Se não conseguir falar com o servidor, devolve uma mensagem amigável.
async function post(caminho: string, corpo?: object): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(`${API_URL}${caminho}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) {
      throw new Error('O servidor demorou demais para responder. Tente novamente.');
    }
    throw new Error('Não foi possível conectar ao servidor. Tente novamente em instantes.');
  } finally {
    clearTimeout(timer);
  }
}

// Converte a resposta da API em erro legível (ou nos dados do usuário, se deu certo).
async function tratarResposta(resp: Response): Promise<AuthState> {
  if (!resp.ok) {
    let mensagem = 'Não foi possível concluir a operação. Tente novamente.';

    if (resp.status === 401 || resp.status === 403) {
      mensagem = 'Usuário ou senha inválidos.';
    } else if (resp.status === 409) {
      mensagem = 'Esse usuário já existe.';
    }

    try {
      const corpo = await resp.json();
      if (corpo?.message) mensagem = corpo.message;
    } catch {
      // corpo vazio ou não é JSON: mantém a mensagem padrão acima
    }

    throw new Error(mensagem);
  }

  const claims: AuthClaims = await resp.json();
  const roles = claims.roles ?? [];

  return {
    user: { id: claims.userId, name: claims.username, roles },
    roles,
  };
}

// POST /v1/auth — autentica usuário e senha já cadastrados.
export async function login(username: string, password: string): Promise<AuthState> {
  if (USE_MOCK) return authMock.login(username, password);

  const resp = await post('/v1/auth', { username, password });
  return tratarResposta(resp);
}

// POST /v1/create — cria um novo usuário e já efetua o login.
export async function register(
  username: string,
  password: string,
  email: string,
  cep: string
): Promise<AuthState> {
  if (USE_MOCK) return authMock.register(username, password, email, cep);

  const resp = await post('/v1/create', { username, password, email, cep });
  return tratarResposta(resp);
}

// POST /v1/logout — limpa o cookie do token no backend.
// "Melhor esforço": se o servidor estiver fora do ar, o app limpa o estado local mesmo assim.
export async function logout(): Promise<void> {
  if (USE_MOCK) return authMock.logout();

  try {
    await fetch(`${API_URL}/v1/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // sem conexão com o backend: segue o logout local
  }
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
