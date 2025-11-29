import { PrismaClient, BookingRequest, BookingStatus } from '@prisma/client';

export interface BookingRequestData {
  userId: string;
  date: Date;
  timeSlot: string;
  numberOfPlayers: number;
  participantIds: string[]; // IDs dels usuaris participants (mínim 2, màxim 4)
  status?: BookingStatus;
  weight?: number;
}

export class BookingRequestRepository {
  constructor(private prisma: PrismaClient) {}

  async create(requestData: BookingRequestData): Promise<BookingRequest> {
    // Remove duplicate participant IDs
    const uniqueParticipantIds = [...new Set(requestData.participantIds)];
    
    // Validar que hi ha entre 1 i 4 participants únics
    if (uniqueParticipantIds.length < 1 || uniqueParticipantIds.length > 4) {
      throw new Error('El nombre de participants ha de ser entre 1 i 4');
    }

    return this.prisma.bookingRequest.create({
      data: {
        userId: requestData.userId,
        date: requestData.date,
        timeSlot: requestData.timeSlot,
        numberOfPlayers: requestData.numberOfPlayers,
        status: requestData.status ?? 'REQUESTED',
        weight: requestData.weight,
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
      },
    });
  }

  async findById(requestId: string): Promise<BookingRequest | null> {
    return this.prisma.bookingRequest.findUnique({
      where: { id: requestId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<BookingRequest[]> {
    return this.prisma.bookingRequest.findMany({
      where: { userId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findByUserIdAndDate(userId: string, date: Date): Promise<BookingRequest[]> {
    return this.prisma.bookingRequest.findMany({
      where: {
        userId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { timeSlot: 'asc' },
    });
  }

  async findPendingByDateAndTimeSlot(date: Date, timeSlot: string): Promise<BookingRequest[]> {
    return this.prisma.bookingRequest.findMany({
      where: {
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        timeSlot,
        status: 'REQUESTED',
      },
      include: {
        user: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async updateStatus(requestId: string, status: BookingStatus): Promise<BookingRequest> {
    return this.prisma.bookingRequest.update({
      where: { id: requestId },
      data: { status },
    });
  }

  async updateWeight(requestId: string, weight: number): Promise<BookingRequest> {
    return this.prisma.bookingRequest.update({
      where: { id: requestId },
      data: { weight },
    });
  }

  async delete(requestId: string): Promise<void> {
    await this.prisma.bookingRequest.delete({
      where: { id: requestId },
    });
  }
}
