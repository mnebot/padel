import { PrismaClient, UsageCounter } from '@prisma/client';

export class UsageCounterRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<UsageCounter | null> {
    return this.prisma.usageCounter.findUnique({
      where: { userId },
    });
  }

  async getCount(userId: string): Promise<number> {
    const counter = await this.findByUserId(userId);
    return counter?.count ?? 0;
  }

  async increment(userId: string): Promise<UsageCounter> {
    // Try to update existing counter
    const existing = await this.findByUserId(userId);
    
    if (existing) {
      return this.prisma.usageCounter.update({
        where: { userId },
        data: {
          count: { increment: 1 },
        },
      });
    }
    
    // Create new counter if it doesn't exist
    return this.prisma.usageCounter.create({
      data: {
        userId,
        count: 1,
        lastResetDate: new Date(),
      },
    });
  }

  async reset(userId: string): Promise<UsageCounter> {
    const existing = await this.findByUserId(userId);
    
    if (existing) {
      return this.prisma.usageCounter.update({
        where: { userId },
        data: {
          count: 0,
          lastResetDate: new Date(),
        },
      });
    }
    
    // Create new counter if it doesn't exist
    return this.prisma.usageCounter.create({
      data: {
        userId,
        count: 0,
        lastResetDate: new Date(),
      },
    });
  }

  async resetAll(): Promise<number> {
    const result = await this.prisma.usageCounter.updateMany({
      data: {
        count: 0,
        lastResetDate: new Date(),
      },
    });
    return result.count;
  }

  async getLastResetDate(): Promise<Date | null> {
    const counter = await this.prisma.usageCounter.findFirst({
      orderBy: { lastResetDate: 'desc' },
      select: { lastResetDate: true },
    });
    return counter?.lastResetDate ?? null;
  }

  async getAllCounters(): Promise<UsageCounter[]> {
    return this.prisma.usageCounter.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
          },
        },
      },
      orderBy: { count: 'desc' },
    });
  }

  /**
   * Set the usage count for a user (primarily for testing)
   */
  async setCount(userId: string, count: number): Promise<UsageCounter> {
    const existing = await this.findByUserId(userId);
    
    if (existing) {
      return this.prisma.usageCounter.update({
        where: { userId },
        data: { count },
      });
    }
    
    // Create new counter if it doesn't exist
    return this.prisma.usageCounter.create({
      data: {
        userId,
        count,
        lastResetDate: new Date(),
      },
    });
  }
}
