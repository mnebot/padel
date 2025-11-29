import { apiClient } from './api';
import type { User } from '../types/user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', { email, password });
  }

  async logout(): Promise<void> {
    // Call API to invalidate token if needed
    try {
      await apiClient.post<void>('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  }
}

export const authService = new AuthService();
