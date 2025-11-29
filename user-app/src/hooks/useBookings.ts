import { useState, useCallback } from 'react';
import { bookingService } from '../services/bookingService';
import type { Booking } from '../types/booking';
import type { CreateBookingDto, DayAvailability } from '../services/bookingService';

interface UseBookingsReturn {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  fetchBookings: (userId: string) => Promise<void>;
  createDirectBooking: (data: CreateBookingDto) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getAvailability: (date: string) => Promise<DayAvailability>;
}

export const useBookings = (): UseBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookingService.getBookings(userId);
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Error carregant reserves');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDirectBooking = useCallback(async (data: CreateBookingDto): Promise<Booking> => {
    try {
      setIsLoading(true);
      setError(null);
      const booking = await bookingService.createDirectBooking(data);
      setBookings(prev => [...prev, booking]);
      return booking;
    } catch (err: any) {
      setError(err.message || 'Error creant reserva');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await bookingService.cancelBooking(bookingId);
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err: any) {
      setError(err.message || 'Error cancel·lant reserva');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAvailability = useCallback(async (date: string): Promise<DayAvailability> => {
    try {
      setIsLoading(true);
      setError(null);
      return await bookingService.getAvailability(date);
    } catch (err: any) {
      setError(err.message || 'Error carregant disponibilitat');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    bookings,
    isLoading,
    error,
    fetchBookings,
    createDirectBooking,
    cancelBooking,
    getAvailability,
  };
};
