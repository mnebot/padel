import { PrismaClient, BookingStatus, UserType } from '@prisma/client';
import { BookingService } from '../BookingService';
import { BookingRepository } from '../../repositories/BookingRepository';
import { CourtRepository } from '../../repositories/CourtRepository';
import { UsageCounterRepository } from '../../repositories/UsageCounterRepository';

const prisma = new PrismaClient();

describe('BookingService - State Validations', () => {
  let bookingService: BookingService;
  let bookingRepository: BookingRepository;
  let courtRepository: CourtRepository;
  let usageCounterRepository: UsageCounterRepository;

  beforeAll(async () => {
    bookingRepository = new BookingRepository(prisma);
    courtRepository = new CourtRepository(prisma);
    usageCounterRepository = new UsageCounterRepository(prisma);
    bookingService = new BookingService(bookingRepository, courtRepository, usageCounterRepository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('cancelBooking - State Validation', () => {
    it('should reject cancellation of completed bookings (Requirement 8.3)', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: `test-${Date.now()}@example.com`,
          type: UserType.MEMBER,
        },
      });

      // Create test court
      const court = await prisma.court.create({
        data: {
          name: 'Test Court',
          description: 'Test Description',
          isActive: true,
        },
      });

      // Create a booking
      const booking = await prisma.booking.create({
        data: {
          userId: user.id,
          courtId: court.id,
          date: new Date(),
          timeSlot: '10:00',
          numberOfPlayers: 2,
          status: BookingStatus.CONFIRMED,
        },
      });

      // Complete the booking
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      // Try to cancel the completed booking - should fail
      await expect(bookingService.cancelBooking(booking.id)).rejects.toThrow(
        'Cannot cancel a completed booking'
      );

      // Cleanup
      await prisma.booking.delete({ where: { id: booking.id } });
      await prisma.court.delete({ where: { id: court.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should successfully cancel confirmed bookings', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: `test-${Date.now()}@example.com`,
          type: UserType.MEMBER,
        },
      });

      // Create test court
      const court = await prisma.court.create({
        data: {
          name: 'Test Court',
          description: 'Test Description',
          isActive: true,
        },
      });

      // Create a booking
      const booking = await prisma.booking.create({
        data: {
          userId: user.id,
          courtId: court.id,
          date: new Date(),
          timeSlot: '10:00',
          numberOfPlayers: 2,
          status: BookingStatus.CONFIRMED,
        },
      });

      // Cancel the booking - should succeed
      await bookingService.cancelBooking(booking.id);

      // Verify the booking is cancelled
      const cancelledBooking = await prisma.booking.findUnique({
        where: { id: booking.id },
      });

      expect(cancelledBooking?.status).toBe(BookingStatus.CANCELLED);
      expect(cancelledBooking?.cancelledAt).not.toBeNull();

      // Cleanup
      await prisma.booking.delete({ where: { id: booking.id } });
      await prisma.court.delete({ where: { id: court.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should reject cancellation of non-existent bookings', async () => {
      await expect(bookingService.cancelBooking('non-existent-id')).rejects.toThrow(
        'Booking not found'
      );
    });
  });

  describe('createDirectBooking - Inactive Court Validation', () => {
    it('should reject bookings for inactive courts (Requirement 9.3)', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: `test-${Date.now()}@example.com`,
          type: UserType.MEMBER,
        },
      });

      // Create test court and deactivate it
      const court = await prisma.court.create({
        data: {
          name: 'Test Court',
          description: 'Test Description',
          isActive: false, // Inactive court
        },
      });

      // Try to create a booking for inactive court - should fail
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await expect(
        bookingService.createDirectBooking({
          userId: user.id,
          courtId: court.id,
          date: tomorrow,
          timeSlot: '10:00',
          numberOfPlayers: 2,
          participantIds: [user.id, user.id],
        })
      ).rejects.toThrow('Cannot book an inactive court');

      // Cleanup
      await prisma.court.delete({ where: { id: court.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });
});
