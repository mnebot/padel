import { UsageCounter } from '@prisma/client';
import { UsageCounterRepository } from '../repositories/UsageCounterRepository';

export class UsageCounterService {
  constructor(private usageCounterRepository: UsageCounterRepository) {}

  /**
   * Increment usage counter for a user when a booking is completed
   * Validates: Requirements 4.1
   */
  async incrementUsage(userId: string): Promise<void> {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    await this.usageCounterRepository.increment(userId);
  }

  /**
   * Get the current usage count for a user
   * Returns the number of completed bookings since last reset
   * Validates: Requirements 4.2
   */
  async getUserUsage(userId: string): Promise<number> {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    return this.usageCounterRepository.getCount(userId);
  }

  /**
   * Reset all usage counters to zero (monthly reset)
   * Validates: Requirements 4.4
   */
  async resetAllCounters(): Promise<void> {
    await this.usageCounterRepository.resetAll();
  }

  /**
   * Get the date of the last reset operation
   * Validates: Requirements 4.4
   */
  async getLastResetDate(): Promise<Date | null> {
    return this.usageCounterRepository.getLastResetDate();
  }

  /**
   * Get all usage counters with user information (admin operation)
   * Useful for statistics and monitoring
   */
  async getAllCounters(): Promise<UsageCounter[]> {
    return this.usageCounterRepository.getAllCounters();
  }
}
