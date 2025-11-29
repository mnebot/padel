import { PrismaClient, Booking, BookingStatus } from '@prisma/client';

export interface BookingData {
  userId: string;
  courtId: string;
  date: Date;
  timeSlot: string;
  numberOfPlayers: number;
  participantIds: string[]; // IDs dels usuaris participants (mínim 2, màxim 4)
  status?: BookingStatus;
  requestId?: string;
}

export class BookingRepository {
  constructor(private prisma: PrismaClient) {}

  async create(bookingData: BookingData): Promise<Booking> {
    // Remove duplicate participant IDs
    const uniqueParticipantIds = [...new Set(bookingData.participantIds)];
    
    // Validar que hi ha entre 1 i 4 participants únics
    if (uniqueParticipantIds.length < 1 || uniqueParticipantIds.length > 4) {
      throw new Error('El nombre de participants ha de ser entre 1 i 4');
    }

    return this.prisma.booking.create({
      data: {
        userId: bookingData.userId,
        courtId: bookingData.courtId,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        numberOfPlayers: bookingData.numberOfPlayers,
        status: bookingData.status ?? 'CONFIRMED',
        requestId: bookingData.requestId,
        participants: {
          create: uniqueParticipantIds.map(userId => ({
            userId,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        court: true,
      },
    });
  }

  async findById(bookingId: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        court: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        court: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findByUserIdAndDate(userId: string, date: Date): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: {
        userId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
      include: {
        court: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { timeSlot: 'asc' },
    });
  }

  async findByCourtAndDate(courtId: string, date: Date): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: {
        courtId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        status: {
          in: ['CONFIRMED', 'REQUESTED'],
        },
      },
      orderBy: { timeSlot: 'asc' },
    });
  }

  async findByDateAndTimeSlot(date: Date, timeSlot: string): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: {
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        timeSlot,
      },
      include: {
        court: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async hasConflict(courtId: string, date: Date, timeSlot: string): Promise<boolean> {
    const count = await this.prisma.booking.count({
      where: {
        courtId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        timeSlot,
        status: {
          in: ['CONFIRMED', 'REQUESTED'],
        },
      },
    });
    return count > 0;
  }

  async findAvailableCourts(date: Date, timeSlot: string): Promise<string[]> {
    // Get all active courts
    const allCourts = await this.prisma.court.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    // Get courts that are already booked for this date and time
    const bookedCourts = await this.prisma.booking.findMany({
      where: {
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        timeSlot,
        status: {
          in: ['CONFIRMED', 'REQUESTED'],
        },
      },
      select: { courtId: true },
    });

    const bookedCourtIds = new Set(bookedCourts.map(b => b.courtId));
    return allCourts
      .filter(court => !bookedCourtIds.has(court.id))
      .map(court => court.id);
  }

  async updateStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    const updateData: any = { status };
    
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
    });
  }

  async cancel(bookingId: string): Promise<Booking> {
    return this.updateStatus(bookingId, 'CANCELLED');
  }

  async complete(bookingId: string): Promise<Booking> {
    return this.updateStatus(bookingId, 'COMPLETED');
  }

  async delete(bookingId: string): Promise<void> {
    await this.prisma.booking.delete({
      where: { id: bookingId },
    });
  }
}
