export enum UserRole {
  ADMIN = 'ADMIN',
  EMERGENCY_DOCTOR = 'EMERGENCY_DOCTOR',
  DEPARTMENT_STAFF = 'DEPARTMENT_STAFF'
}

export interface User {
  id?: number;
  username: string;
  role?: UserRole;
  token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}
