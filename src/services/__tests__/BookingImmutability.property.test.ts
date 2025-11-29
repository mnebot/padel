import fc from 'fast-check';
import { PrismaClient, UserType, TimeSlotType } from '@prisma/client';
import { BookingRepository } from '../../repositories/BookingRepository';
import { CourtRepository } from '../../repositories/CourtRepository';
import { UsageCounterRepository } from '../../repositories/UsageCounterRepository';
import { TimeSlotRepository } from '../../repositories/TimeSlotRepository';
import { BookingService } from '../BookingService';
import { TimeSlotService } from '../TimeSlotService';

describe('Booking Immutability - Property-Based Tests', () => {
  let prisma: PrismaClient;
  let bookingRepository: BookingRepository;
  let courtRepository: CourtRepository;
  let usageCounterRepository: UsageCounterRepository;
  let timeSlotRepository: TimeSlotRepository;
  let bookingService: BookingService;
  let timeSlotService: TimeSlotService;

  beforeAll(() => {
    prisma = new PrismaClient();
    bookingRepository = new BookingRepository(prisma);
    courtRepository = new CourtRepository(prisma);
    usageCounterRepository = new UsageCounterRepository(prisma);
    timeSlotRepository = new TimeSlotRepository(prisma);
    bookingService = new BookingService(bookingRepository, courtRepository, usageCounterRepository);
    timeSlotService = new TimeSlotService(timeSlotRepository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database before each test - order matters due to foreign keys
    await prisma.bookingParticipant.deleteMany();
    await prisma.requestParticipant.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.bookingRequest.deleteMany();
    await prisma.usageCounter.deleteMany();
    await prisma.timeSlot.deleteMany();
    await prisma.court.deleteMany();
    await prisma.user.deleteMany();
  });

  // **Feature: gestio-reserves-padel, Property 32: Immutabilitat de reserves existents**
  // **Validates: Requirements 10.5**
  describe('Property 32: Immutability of existing bookings', () => {
    it('should not modify existing booking data when time slot configuration is changed', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 6 }), // Day of week
          fc.constantFrom('09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'), // Original time slot
          fc.constantFrom('10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00'), // New end time
          fc.integer({ min: 2, max: 4 }), // Number of players
          fc.constantFrom(UserType.MEMBER, UserType.NON_MEMBER), // User type
          fc.constantFrom(TimeSlotType.OFF_PEAK, TimeSlotType.PEAK), // Original type
          fc.constantFrom(TimeSlotType.OFF_PEAK, TimeSlotType.PEAK), // New type
          async (dayOfWeek, startTime, newEndTime, numberOfPlayers, userType, originalType, newType) => {
            // Skip if new end time is not after start time
            if (newEndTime <= startTime) {
              return;
            }

            // Create test users
            const users = await Promise.all(
              Array.from({ length: numberOfPlayers }, (_, i) =>
                prisma.user.create({
                  data: {
                    name: `Test User ${i}`,
                    email: `test-${Date.now()}-${i}-${Math.random()}@example.com`,
                    type: userType,
                  },
                })
              )
            );

            // Create test court
            const court = await prisma.court.create({
              data: {
                name: `Test Court ${Date.now()}`,
                description: 'Test Description',
                isActive: true,
              },
            });

            // Create time slot configuration
            const timeSlot = await timeSlotService.createTimeSlot({
              dayOfWeek,
              startTime,
              endTime: '18:00', // Original end time
              duration: 60,
              type: originalType,
            });

            // Calculate target date within direct booking window
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 1); // 1 day in advance
            targetDate.setHours(0, 0, 0, 0); // Normalize to midnight

            // Create a booking
            const bookingData = {
              userId: users[0].id,
              courtId: court.id,
              date: targetDate,
              timeSlot: startTime,
              numberOfPlayers,
              participantIds: users.map(u => u.id),
            };

            let booking;
            try {
              booking = await bookingService.createDirectBooking(bookingData);

              // Capture original booking data
              const originalBooking = {
                id: booking.id,
                userId: booking.userId,
                courtId: booking.courtId,
                date: new Date(booking.date),
                timeSlot: booking.timeSlot,
                numberOfPlayers: booking.numberOfPlayers,
                status: booking.status,
                requestId: booking.requestId,
                createdAt: new Date(booking.createdAt),
                updatedAt: new Date(booking.updatedAt),
              };

              // Wait a moment to ensure updatedAt would change if modified
              await new Promise(resolve => setTimeout(resolve, 10));

              // Update the time slot configuration
              await timeSlotService.updateTimeSlot(timeSlot.id, {
                endTime: newEndTime,
                type: newType,
                duration: 90, // Change duration too
              });

              // Retrieve the booking again
              const bookingAfterUpdate = await bookingRepository.findById(booking.id);

              // Property: Booking data should remain unchanged
              expect(bookingAfterUpdate).not.toBeNull();
              expect(bookingAfterUpdate!.id).toBe(originalBooking.id);
              expect(bookingAfterUpdate!.userId).toBe(originalBooking.userId);
              expect(bookingAfterUpdate!.courtId).toBe(originalBooking.courtId);
              expect(new Date(bookingAfterUpdate!.date).getTime()).toBe(originalBooking.date.getTime());
              expect(bookingAfterUpdate!.timeSlot).toBe(originalBooking.timeSlot);
              expect(bookingAfterUpdate!.numberOfPlayers).toBe(originalBooking.numberOfPlayers);
              expect(bookingAfterUpdate!.status).toBe(originalBooking.status);
              expect(bookingAfterUpdate!.requestId).toBe(originalBooking.requestId);
              expect(new Date(bookingAfterUpdate!.createdAt).getTime()).toBe(originalBooking.createdAt.getTime());
              // updatedAt should also remain the same since we didn't update the booking
              expect(new Date(bookingAfterUpdate!.updatedAt).getTime()).toBe(originalBooking.updatedAt.getTime());
            } finally {
              // Cleanup
              if (booking) {
                await prisma.bookingParticipant.deleteMany({ where: { bookingId: booking.id } }).catch(() => {});
                await bookingRepository.delete(booking.id).catch(() => {});
              }
              await timeSlotRepository.delete(timeSlot.id).catch(() => {});
              await courtRepository.delete(court.id).catch(() => {});
              for (const user of users) {
                await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
              }
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
