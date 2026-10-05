export interface Role {
  id?: string | number;
  name: string;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  roles: (Role | string)[];
  avatarUrl?: string;
}

export interface AuthState {
  token: string;
  user: User;
  roles: (Role | string)[];
}

export interface LoginResponse {
  token: string;
  user: User;
  roles: (Role | string)[];
}

export interface MessageResponse {
  message: string;
  timestamp?: string;
}
