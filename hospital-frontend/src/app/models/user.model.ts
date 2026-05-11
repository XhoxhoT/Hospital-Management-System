export interface User {
  username: string;
  token?: string;
  role?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
  departmentId?: number | null;
}
