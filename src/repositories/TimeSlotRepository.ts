import { PrismaClient, TimeSlot, TimeSlotType } from '@prisma/client';

export interface TimeSlotData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
  type: TimeSlotType;
}

export class TimeSlotRepository {
  constructor(private prisma: PrismaClient) {}

  async create(timeSlotData: TimeSlotData): Promise<TimeSlot> {
    return this.prisma.timeSlot.create({
      data: {
        dayOfWeek: timeSlotData.dayOfWeek,
        startTime: timeSlotData.startTime,
        endTime: timeSlotData.endTime,
        duration: timeSlotData.duration,
        type: timeSlotData.type,
      },
    });
  }

  async findById(timeSlotId: string): Promise<TimeSlot | null> {
    return this.prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
    });
  }

  async findAll(): Promise<TimeSlot[]> {
    return this.prisma.timeSlot.findMany();
  }

  async findByDayOfWeek(dayOfWeek: number): Promise<TimeSlot[]> {
    return this.prisma.timeSlot.findMany({
      where: { dayOfWeek },
      orderBy: { startTime: 'asc' },
    });
  }

  async update(timeSlotId: string, timeSlotData: Partial<TimeSlotData>): Promise<TimeSlot> {
    return this.prisma.timeSlot.update({
      where: { id: timeSlotId },
      data: timeSlotData,
    });
  }

  async delete(timeSlotId: string): Promise<void> {
    await this.prisma.timeSlot.delete({
      where: { id: timeSlotId },
    });
  }
}
