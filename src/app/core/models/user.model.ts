export type UserRole = 'ATTENDEE' | 'ORGANISER' | 'ADMIN';

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  name: string;
  role: UserRole;
  email: string;
}
