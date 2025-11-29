import { apiClient } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  type: 'MEMBER' | 'NON_MEMBER';
  isAdmin: boolean;
}

export class UserService {
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<{ success: boolean; data: User[] }>('/users');
    return response.data;
  }

  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>(`/users/${userId}`);
    return response.data;
  }
}

export const userService = new UserService();
