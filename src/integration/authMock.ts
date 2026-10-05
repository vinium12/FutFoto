import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState } from '@/@types/auth';

// MOCK DE LOGIN (só pra testar o app sem depender da API).
// As contas criadas no cadastro ficam salvas no aparelho (AsyncStorage no celular,
// localStorage na web). A senha fica em texto puro aqui, por ser só um mock:
// a API de verdade guarda o hash.
const USERS_STORAGE_KEY = '@futfoto:mock-users';
const LATENCIA_MS = 600;

interface MockUser {
  userId: string;
  username: string;
  password: string;
  email: string;
  cep: string;
  roles: string[];
}

// Conta que já existe de fábrica: usuário "futfoto" / senha "123456"
const USUARIOS_INICIAIS: MockUser[] = [
  {
    userId: '1',
    username: 'futfoto',
    password: '123456',
    email: 'contato@futfoto.com',
    cep: '01001000',
    roles: ['ROLE_USER'],
  },
];

const esperar = () => new Promise<void>((resolve) => setTimeout(resolve, LATENCIA_MS));
const igual = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

function paraAuthState(user: MockUser): AuthState {
  return {
    user: { id: user.userId, name: user.username, roles: [...user.roles] },
    roles: [...user.roles],
  };
}

async function carregarUsuarios(): Promise<MockUser[]> {
  let salvos: MockUser[] = [];
  try {
    const bruto = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    salvos = bruto ? (JSON.parse(bruto) as MockUser[]) : [];
  } catch {
    salvos = [];
  }
  return [...USUARIOS_INICIAIS, ...salvos];
}

export async function login(username: string, password: string): Promise<AuthState> {
  await esperar();
  const usuarios = await carregarUsuarios();
  const user = usuarios.find((u) => igual(u.username, username) && u.password === password);

  if (!user) throw new Error('Usuário ou senha inválidos.');
  return paraAuthState(user);
}

export async function register(
  username: string,
  password: string,
  email: string,
  cep: string
): Promise<AuthState> {
  await esperar();
  const usuarios = await carregarUsuarios();

  if (usuarios.some((u) => igual(u.username, username))) {
    throw new Error('Esse usuário já existe. Escolha outro nome.');
  }
  if (usuarios.some((u) => igual(u.email, email))) {
    throw new Error('Esse e-mail já está em uso.');
  }

  const novo: MockUser = {
    userId: `u_${Date.now()}`,
    username: username.trim(),
    password,
    email: email.trim(),
    cep: cep.trim(),
    roles: ['ROLE_USER'],
  };

  const criados = usuarios.slice(USUARIOS_INICIAIS.length);
  await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([...criados, novo]));
  return paraAuthState(novo);
}

export async function logout(): Promise<void> {
  await esperar();
}
