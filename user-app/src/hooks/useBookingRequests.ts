import { useState, useCallback } from 'react';
import { bookingRequestService } from '../services/bookingRequestService';
import type { BookingRequest } from '../types/booking';
import type { CreateBookingRequestDto } from '../services/bookingRequestService';

interface UseBookingRequestsReturn {
  requests: BookingRequest[];
  isLoading: boolean;
  error: string | null;
  fetchRequests: (userId: string) => Promise<void>;
  createRequest: (data: CreateBookingRequestDto) => Promise<BookingRequest>;
  cancelRequest: (requestId: string) => Promise<void>;
}

export const useBookingRequests = (): UseBookingRequestsReturn => {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookingRequestService.getRequests(userId);
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Error carregant sol·licituds');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRequest = useCallback(async (data: CreateBookingRequestDto): Promise<BookingRequest> => {
    try {
      setIsLoading(true);
      setError(null);
      const request = await bookingRequestService.createRequest(data);
      setRequests(prev => [...prev, request]);
      return request;
    } catch (err: any) {
      setError(err.message || 'Error creant sol·licitud');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelRequest = useCallback(async (requestId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await bookingRequestService.cancelRequest(requestId);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err: any) {
      setError(err.message || 'Error cancel·lant sol·licitud');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    requests,
    isLoading,
    error,
    fetchRequests,
    createRequest,
    cancelRequest,
  };
};
