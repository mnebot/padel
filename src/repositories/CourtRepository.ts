import { PrismaClient, Court } from '@prisma/client';

export interface CourtData {
  name: string;
  description: string;
  isActive?: boolean;
}

export class CourtRepository {
  constructor(private prisma: PrismaClient) {}

  async create(courtData: CourtData): Promise<Court> {
    return this.prisma.court.create({
      data: {
        name: courtData.name,
        description: courtData.description,
        isActive: courtData.isActive ?? true,
      },
    });
  }

  async findById(courtId: string): Promise<Court | null> {
    return this.prisma.court.findUnique({
      where: { id: courtId },
    });
  }

  async findAll(): Promise<Court[]> {
    return this.prisma.court.findMany();
  }

  async findActiveCourts(): Promise<Court[]> {
    return this.prisma.court.findMany({
      where: { isActive: true },
    });
  }

  async update(courtId: string, courtData: Partial<CourtData>): Promise<Court> {
    return this.prisma.court.update({
      where: { id: courtId },
      data: courtData,
    });
  }

  async deactivate(courtId: string): Promise<Court> {
    return this.prisma.court.update({
      where: { id: courtId },
      data: { isActive: false },
    });
  }

  async delete(courtId: string): Promise<void> {
    await this.prisma.court.delete({
      where: { id: courtId },
    });
  }

  async hasActiveBookings(courtId: string): Promise<boolean> {
    const count = await this.prisma.booking.count({
      where: {
        courtId,
        status: {
          in: ['CONFIRMED', 'REQUESTED'],
        },
      },
    });
    return count > 0;
  }
}
