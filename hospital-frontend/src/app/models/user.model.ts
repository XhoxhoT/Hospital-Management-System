export enum UserRole {
  SUPER_ADMIN = 'super_admin'
}

export interface User {
  id?: string;
  email: string;
  username: string;
  role: UserRole;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword?: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}
