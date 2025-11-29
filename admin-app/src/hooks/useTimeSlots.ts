import { useState, useCallback } from 'react';
import { timeSlotService } from '../services/timeSlotService';
import type { TimeSlot } from '../types/timeSlot';
import type { CreateTimeSlotDto, UpdateTimeSlotDto } from '../services/timeSlotService';

interface UseTimeSlotsReturn {
  timeSlots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
  fetchTimeSlots: () => Promise<void>;
  createTimeSlot: (data: CreateTimeSlotDto) => Promise<TimeSlot>;
  updateTimeSlot: (timeSlotId: string, data: UpdateTimeSlotDto) => Promise<TimeSlot>;
  deleteTimeSlot: (timeSlotId: string) => Promise<void>;
}

export const useTimeSlots = (): UseTimeSlotsReturn => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeSlots = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await timeSlotService.getTimeSlots();
      setTimeSlots(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error loading time slots');
      setTimeSlots([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTimeSlot = useCallback(async (data: CreateTimeSlotDto): Promise<TimeSlot> => {
    try {
      setIsLoading(true);
      setError(null);
      const timeSlot = await timeSlotService.createTimeSlot(data);
      setTimeSlots(prev => {
        const currentSlots = Array.isArray(prev) ? prev : [];
        return [...currentSlots, timeSlot];
      });
      return timeSlot;
    } catch (err: any) {
      setError(err.message || 'Error creating time slot');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTimeSlot = useCallback(async (timeSlotId: string, data: UpdateTimeSlotDto): Promise<TimeSlot> => {
    try {
      setIsLoading(true);
      setError(null);
      const timeSlot = await timeSlotService.updateTimeSlot(timeSlotId, data);
      setTimeSlots(prev => {
        const currentSlots = Array.isArray(prev) ? prev : [];
        return currentSlots.map(ts => ts.id === timeSlotId ? timeSlot : ts);
      });
      return timeSlot;
    } catch (err: any) {
      setError(err.message || 'Error updating time slot');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTimeSlot = useCallback(async (timeSlotId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await timeSlotService.deleteTimeSlot(timeSlotId);
      setTimeSlots(prev => {
        const currentSlots = Array.isArray(prev) ? prev : [];
        return currentSlots.filter(ts => ts.id !== timeSlotId);
      });
    } catch (err: any) {
      setError(err.message || 'Error deleting time slot');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    timeSlots,
    isLoading,
    error,
    fetchTimeSlots,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
  };
};
