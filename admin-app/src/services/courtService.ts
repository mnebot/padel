import { apiClient, type ApiResponse } from './api';
import type { Court } from '../types/court';

export interface CreateCourtDto {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateCourtDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export class CourtService {
  async getCourts(): Promise<Court[]> {
    const response = await apiClient.get<ApiResponse<Court[]>>('/courts');
    return response.data;
  }

  async getCourt(courtId: string): Promise<Court> {
    const response = await apiClient.get<ApiResponse<Court>>(`/courts/${courtId}`);
    return response.data;
  }

  async createCourt(data: CreateCourtDto): Promise<Court> {
    const response = await apiClient.post<ApiResponse<Court>>('/courts', data);
    return response.data;
  }

  async updateCourt(courtId: string, data: UpdateCourtDto): Promise<Court> {
    const response = await apiClient.patch<ApiResponse<Court>>(`/courts/${courtId}`, data);
    return response.data;
  }

  async deleteCourt(courtId: string): Promise<void> {
    await apiClient.delete<void>(`/courts/${courtId}`);
  }
}

export const courtService = new CourtService();
