import { useState, useCallback } from 'react';
import { bookingService } from '../services/bookingService';
import type { Booking } from '../types/booking';
import type { BookingFilters } from '../services/bookingService';

interface UseBookingsReturn {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  fetchAllBookings: () => Promise<void>;
  filterBookings: (filters: BookingFilters) => Promise<void>;
}

export const useBookings = (): UseBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookingService.getAllBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Error loading bookings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterBookings = useCallback(async (filters: BookingFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookingService.getBookingsByFilters(filters);
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Error filtering bookings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    bookings,
    isLoading,
    error,
    fetchAllBookings,
    filterBookings,
  };
};
