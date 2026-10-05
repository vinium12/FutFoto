export interface Role {
  id?: string | number;
  name: string;
}

// Resposta de POST /v1/auth e POST /v1/create.
// O token JWT NÃO vem no corpo: o servidor manda num cookie httpOnly.
export interface AuthClaims {
  userId: string;
  username: string;
  roles: string[];
}

export interface User {
  id: string | number;
  name: string; // = username devolvido pela API
  roles: (Role | string)[];
  email?: string;
  avatarUrl?: string;
}

// O que o app guarda no AsyncStorage: só dados públicos (sem token).
export interface AuthState {
  user: User;
  roles: (Role | string)[];
}

export interface MessageResponse {
  message: string;
  timestamp?: string;
}
