import { apiClient } from './api';
import type { Booking } from '../types/booking';
import type { Court } from '../types/court';
import type { TimeSlotType } from '../types/timeSlot';

export interface CreateBookingDto {
  userId: string;
  courtId: string;
  date: string;
  timeSlot: string;
  numberOfPlayers: number;
  participantIds: string[];
}

export interface AvailabilitySlot {
  timeSlot: string;
  type: TimeSlotType;
  availableCourts: Court[];
  isAvailable: boolean;
}

export interface DayAvailability {
  date: string;
  slots: AvailabilitySlot[];
  isInRequestWindow: boolean;
  isInDirectBookingWindow: boolean;
}

export class BookingService {
  async getBookings(userId: string): Promise<Booking[]> {
    const response = await apiClient.get<{ success: boolean; data: Booking[] }>(`/bookings/user/${userId}`);
    return response.data;
  }

  async createDirectBooking(data: CreateBookingDto): Promise<Booking> {
    const response = await apiClient.post<{ success: boolean; data: Booking }>('/bookings', data);
    return response.data;
  }

  async cancelBooking(bookingId: string): Promise<void> {
    await apiClient.delete<{ success: boolean; message: string }>(`/bookings/${bookingId}`);
  }

  async getAvailability(date: string): Promise<DayAvailability> {
    const response = await apiClient.get<{ success: boolean; data: DayAvailability }>(`/bookings/availability/${date}`);
    return response.data;
  }
}

export const bookingService = new BookingService();
