import { useState, useCallback } from 'react';
import { bookingService } from '../services/bookingService';
import type { DayAvailability } from '../services/bookingService';

interface UseAvailabilityReturn {
  availability: DayAvailability | null;
  isLoading: boolean;
  error: string | null;
  fetchAvailability: (date: string) => Promise<void>;
}

export const useAvailability = (): UseAvailabilityReturn => {
  const [availability, setAvailability] = useState<DayAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async (date: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookingService.getAvailability(date);
      setAvailability(data);
    } catch (err: any) {
      setError(err.message || 'Error carregant disponibilitat');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    availability,
    isLoading,
    error,
    fetchAvailability,
  };
};
