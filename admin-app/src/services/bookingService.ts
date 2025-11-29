import { apiClient, type ApiResponse } from './api';
import type { Booking, BookingStatus } from '../types/booking';

export interface BookingFilters {
  date?: string;
  courtId?: string;
  userId?: string;
  status?: BookingStatus;
  dateFrom?: string;
  dateTo?: string;
}

export class BookingService {
  async getAllBookings(): Promise<Booking[]> {
    const response = await apiClient.get<ApiResponse<Booking[]>>('/bookings');
    return response.data;
  }

  async getBooking(bookingId: string): Promise<Booking> {
    const response = await apiClient.get<ApiResponse<Booking>>(`/bookings/${bookingId}`);
    return response.data;
  }

  async getBookingsByFilters(filters: BookingFilters): Promise<Booking[]> {
    const response = await apiClient.get<ApiResponse<Booking[]>>('/bookings', filters);
    return response.data;
  }
}

export const bookingService = new BookingService();
