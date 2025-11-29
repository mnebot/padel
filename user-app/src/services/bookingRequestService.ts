import { apiClient } from './api';
import type { BookingRequest } from '../types/booking';

export interface CreateBookingRequestDto {
  userId: string;
  date: string;
  timeSlot: string;
  numberOfPlayers: number;
  participantIds: string[];
}

export class BookingRequestService {
  async getRequests(userId: string): Promise<BookingRequest[]> {
    const response = await apiClient.get<{ success: boolean; data: BookingRequest[] }>(`/requests/user/${userId}`);
    return response.data;
  }

  async createRequest(data: CreateBookingRequestDto): Promise<BookingRequest> {
    const response = await apiClient.post<{ success: boolean; data: BookingRequest }>('/requests', data);
    return response.data;
  }

  async cancelRequest(requestId: string): Promise<void> {
    await apiClient.delete<void>(`/requests/${requestId}`);
  }
}

export const bookingRequestService = new BookingRequestService();
