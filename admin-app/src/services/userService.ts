import { apiClient, type ApiResponse } from './api';
import type { User, UserType } from '../types/user';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  type: UserType;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  type?: UserType;
  password?: string;
}

export class UserService {
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>('/users');
    return response.data;
  }

  async getUser(userId: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${userId}`);
    return response.data;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data;
  }

  async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${userId}`, data);
    return response.data;
  }
}

export const userService = new UserService();
