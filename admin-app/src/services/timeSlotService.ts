import { apiClient, type ApiResponse } from './api';
import type { TimeSlot, TimeSlotType } from '../types/timeSlot';

export interface CreateTimeSlotDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
  type: TimeSlotType;
}

export interface UpdateTimeSlotDto {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  type?: TimeSlotType;
}

export class TimeSlotService {
  async getTimeSlots(): Promise<TimeSlot[]> {
    const response = await apiClient.get<ApiResponse<TimeSlot[]>>('/timeslots');
    return response.data;
  }

  async getTimeSlot(timeSlotId: string): Promise<TimeSlot> {
    const response = await apiClient.get<ApiResponse<TimeSlot>>(`/timeslots/${timeSlotId}`);
    return response.data;
  }

  async createTimeSlot(data: CreateTimeSlotDto): Promise<TimeSlot> {
    const response = await apiClient.post<ApiResponse<TimeSlot>>('/timeslots', data);
    return response.data;
  }

  async updateTimeSlot(timeSlotId: string, data: UpdateTimeSlotDto): Promise<TimeSlot> {
    const response = await apiClient.put<ApiResponse<TimeSlot>>(`/timeslots/${timeSlotId}`, data);
    return response.data;
  }

  async deleteTimeSlot(timeSlotId: string): Promise<void> {
    await apiClient.delete<void>(`/timeslots/${timeSlotId}`);
  }
}

export const timeSlotService = new TimeSlotService();
