import { useState, useCallback } from 'react';
import { lotteryService } from '../services/lotteryService';
import type { LotteryResult } from '../services/lotteryService';

interface UseLotteryReturn {
  result: LotteryResult | null;
  isLoading: boolean;
  error: string | null;
  executeLottery: (date: string, timeSlot: string) => Promise<LotteryResult>;
  getLotteryResults: (date: string, timeSlot: string) => Promise<void>;
}

export const useLottery = (): UseLotteryReturn => {
  const [result, setResult] = useState<LotteryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeLottery = useCallback(async (date: string, timeSlot: string): Promise<LotteryResult> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await lotteryService.executeLottery(date, timeSlot);
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error executing lottery');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLotteryResults = useCallback(async (date: string, timeSlot: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await lotteryService.getLotteryResults(date, timeSlot);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error loading lottery results');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    result,
    isLoading,
    error,
    executeLottery,
    getLotteryResults,
  };
};
