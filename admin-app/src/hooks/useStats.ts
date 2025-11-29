import { useState, useCallback } from 'react';
import { statsService, type SystemStats, type StatsFilters } from '../services/statsService';

interface UseStatsReturn {
  stats: SystemStats | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: (filters?: StatsFilters) => Promise<void>;
}

export const useStats = (): UseStatsReturn => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (filters?: StatsFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await statsService.getStats(filters);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error loading statistics');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
  };
};
