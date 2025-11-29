import { apiClient, type ApiResponse } from './api';

export interface CourtUsageStats {
  courtId: string;
  courtName: string;
  bookingCount: number;
  utilizationRate: number;
}

export interface UserStats {
  userId: string;
  userName: string;
  userType: string;
  usageCount: number;
  totalBookings: number;
}

export interface TimeSlotDemand {
  timeSlot: string;
  type: 'OFF_PEAK' | 'PEAK';
  bookingCount: number;
  requestCount: number;
}

export interface BookingsByUserType {
  memberBookings: number;
  nonMemberBookings: number;
  memberPercentage: number;
  nonMemberPercentage: number;
}

export interface SystemStats {
  totalBookings: number;
  totalActiveBookings: number;
  totalCompletedBookings: number;
  totalCancelledBookings: number;
  totalPendingRequests: number;
  totalUsers: number;
  totalCourts: number;
  courtUsage: CourtUsageStats[];
  bookingsByUserType?: BookingsByUserType;
  timeSlotDemand?: TimeSlotDemand[];
}

export interface StatsFilters {
  dateFrom?: string;
  dateTo?: string;
  period?: 'week' | 'month' | 'year';
}

export class StatsService {
  async getStats(filters?: StatsFilters): Promise<SystemStats> {
    const response = await apiClient.get<ApiResponse<SystemStats>>('/stats', filters);
    return response.data;
  }

  async getCourtUsage(filters?: StatsFilters): Promise<CourtUsageStats[]> {
    const response = await apiClient.get<ApiResponse<CourtUsageStats[]>>('/stats/courts', filters);
    return response.data;
  }

  async getUserStats(filters?: StatsFilters): Promise<UserStats[]> {
    const response = await apiClient.get<ApiResponse<UserStats[]>>('/stats/users', filters);
    return response.data;
  }

  async getTimeSlotDemand(filters?: StatsFilters): Promise<TimeSlotDemand[]> {
    const response = await apiClient.get<ApiResponse<TimeSlotDemand[]>>('/stats/timeslots', filters);
    return response.data;
  }

  async getBookingsByUserType(filters?: StatsFilters): Promise<BookingsByUserType> {
    const response = await apiClient.get<ApiResponse<BookingsByUserType>>('/stats/bookings-by-type', filters);
    return response.data;
  }
}

export const statsService = new StatsService();
