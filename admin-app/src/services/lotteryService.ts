import { apiClient, type ApiResponse } from './api';
import type { Booking } from '../types/booking';

export interface LotteryResult {
  date: string;
  timeSlot: string;
  totalRequests: number;
  assignedBookings: number;
  bookings: Booking[];
}

export class LotteryService {
  async executeLottery(date: string, timeSlot: string): Promise<LotteryResult> {
    const response = await apiClient.post<ApiResponse<any>>('/lottery/execute', { date, timeSlot });
    
    // Transform API response to match our interface
    const data = response.data;
    
    // Fetch the actual bookings to get full details
    const resultsResponse = await apiClient.get<ApiResponse<any>>(`/lottery/results/${date}/${timeSlot}`);
    const resultsData = resultsResponse.data;
    
    return {
      date: data.date,
      timeSlot: data.timeSlot,
      totalRequests: data.summary.totalRequests,
      assignedBookings: data.summary.assigned,
      bookings: resultsData.assignedBookings || [],
    };
  }

  async getLotteryResults(date: string, timeSlot: string): Promise<LotteryResult> {
    const response = await apiClient.get<ApiResponse<any>>(`/lottery/results/${date}/${timeSlot}`);
    
    // Transform API response to match our interface
    const data = response.data;
    return {
      date: data.date,
      timeSlot: data.timeSlot,
      totalRequests: data.summary.totalRequests,
      assignedBookings: data.summary.totalAssigned,
      bookings: data.assignedBookings || [],
    };
  }
}

export const lotteryService = new LotteryService();
