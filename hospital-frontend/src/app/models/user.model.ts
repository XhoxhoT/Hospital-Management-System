export interface User {
  username: string;
  token?: string;
  role?: string;
  privileged?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  privileged: boolean;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
  departmentId?: number | null;
  privileged?: boolean;
}
