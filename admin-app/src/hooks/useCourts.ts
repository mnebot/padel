import { useState, useCallback } from 'react';
import { courtService } from '../services/courtService';
import type { Court } from '../types/court';
import type { CreateCourtDto, UpdateCourtDto } from '../services/courtService';

interface UseCourtsReturn {
  courts: Court[];
  isLoading: boolean;
  error: string | null;
  fetchCourts: () => Promise<void>;
  createCourt: (data: CreateCourtDto) => Promise<Court>;
  updateCourt: (courtId: string, data: UpdateCourtDto) => Promise<Court>;
  deleteCourt: (courtId: string) => Promise<void>;
}

export const useCourts = (): UseCourtsReturn => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await courtService.getCourts();
      setCourts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error loading courts');
      setCourts([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCourt = useCallback(async (data: CreateCourtDto): Promise<Court> => {
    try {
      setIsLoading(true);
      setError(null);
      const court = await courtService.createCourt(data);
      setCourts(prev => {
        const currentCourts = Array.isArray(prev) ? prev : [];
        return [...currentCourts, court];
      });
      return court;
    } catch (err: any) {
      setError(err.message || 'Error creating court');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCourt = useCallback(async (courtId: string, data: UpdateCourtDto): Promise<Court> => {
    try {
      setIsLoading(true);
      setError(null);
      const court = await courtService.updateCourt(courtId, data);
      setCourts(prev => {
        const currentCourts = Array.isArray(prev) ? prev : [];
        return currentCourts.map(c => c.id === courtId ? court : c);
      });
      return court;
    } catch (err: any) {
      setError(err.message || 'Error updating court');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCourt = useCallback(async (courtId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await courtService.deleteCourt(courtId);
      setCourts(prev => {
        const currentCourts = Array.isArray(prev) ? prev : [];
        return currentCourts.filter(c => c.id !== courtId);
      });
    } catch (err: any) {
      setError(err.message || 'Error deleting court');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    courts,
    isLoading,
    error,
    fetchCourts,
    createCourt,
    updateCourt,
    deleteCourt,
  };
};
