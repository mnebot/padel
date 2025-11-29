/**
 * **Feature: gestio-reserves-padel, Property 34: Transaccionalitat d'operacions**
 * 
 * Property: For any operation that fails due to validation or error,
 * the system state should remain the same as before the operation.
 * 
 * Validates: Requirements 12.4
 */

import { PrismaClient, UserType, TimeSlotType } from '@prisma/client';
import fc from 'fast-check';
import { UserService } from '../UserService';
import { TimeSlotService } from '../TimeSlotService';
import { BookingRequestService } from '../BookingRequestService';
import { UserRepository } from '../../repositories/UserRepository';
import { TimeSlotRepository } from '../../repositories/TimeSlotRepository';
import { BookingRequestRepository } from '../../repositories/BookingRequestRepository';

describe('Transactionality Property-Based Tests', () => {
  let prisma: PrismaClient;
  let userService: UserService;
  let timeSlotService: TimeSlotService;
  let bookingRequestService: BookingRequestService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    
    const userRepository = new UserRepository(prisma);
    const timeSlotRepository = new TimeSlotRepository(prisma);
    const bookingRequestRepository = new BookingRequestRepository(prisma);

    userService = new UserService(userRepository);
    timeSlotService = new TimeSlotService(timeSlotRepository);
    bookingRequestService = new BookingRequestService(bookingRequestRepository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.bookingParticipant.deleteMany();
    await prisma.requestParticipant.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.bookingRequest.deleteMany();
    await prisma.usageCounter.deleteMany();
    await prisma.timeSlot.deleteMany();
    await prisma.court.deleteMany();
    await prisma.user.deleteMany();
  });

  /**
   * Property 34: Transaccionalitat d'operacions
   * For any operation that fails, the system state should remain unchanged
   */
  test('failed operations should not modify system state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'invalidUser',
          'invalidTimeSlot',
          'invalidNumberOfPlayers'
        ),
        async (operationType) => {
          // Clean database for this iteration
          await prisma.bookingParticipant.deleteMany();
          await prisma.requestParticipant.deleteMany();
          await prisma.booking.deleteMany();
          await prisma.bookingRequest.deleteMany();
          await prisma.usageCounter.deleteMany();
          await prisma.timeSlot.deleteMany();
          await prisma.court.deleteMany();
          await prisma.user.deleteMany();

          // Capture initial state (should be 0 for all)
          const initialUserCount = await prisma.user.count();
          const initialTimeSlotCount = await prisma.timeSlot.count();
          const initialBookingRequestCount = await prisma.bookingRequest.count();

          try {
            switch (operationType) {
              case 'invalidUser':
                // Try to register user with empty name (should fail)
                await userService.registerUser({
                  name: '',
                  email: 'test@example.com',
                  type: UserType.MEMBER,
                });
                break;

              case 'invalidTimeSlot':
                // Try to create time slot with endTime <= startTime (should fail)
                await timeSlotService.createTimeSlot({
                  dayOfWeek: 1,
                  startTime: '10:00',
                  endTime: '09:00',
                  duration: 60,
                  type: TimeSlotType.PEAK,
                });
                break;

              case 'invalidNumberOfPlayers':
                // Try to create booking request with invalid number of players (should fail)
                const user2 = await userService.registerUser({
                  name: 'Test User',
                  email: `test-${Date.now()}@example.com`,
                  type: UserType.MEMBER,
                });

                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 3);

                await bookingRequestService.createRequest({
                  userId: user2.id,
                  date: futureDate,
                  timeSlot: '10:00',
                  numberOfPlayers: 5, // Invalid: should be 2-4
                  participantIds: [user2.id, user2.id, user2.id, user2.id, user2.id],
                });
                break;
            }

            // If we reach here, the operation didn't fail as expected
            // This shouldn't happen for these test cases
            throw new Error(`Operation ${operationType} should have failed but didn't`);
          } catch (error: any) {
            // Ignore the error we throw ourselves
            if (error.message && error.message.includes('should have failed')) {
              throw error;
            }

            // Operation failed as expected
            // Verify that the state hasn't changed (except for valid setup data)
            const finalUserCount = await prisma.user.count();
            const finalTimeSlotCount = await prisma.timeSlot.count();
            const finalBookingRequestCount = await prisma.bookingRequest.count();

            // For operations that create setup data, we need to account for that
            // The key is that the INVALID operation didn't create/modify data
            switch (operationType) {
              case 'invalidUser':
                // No setup data, counts should be exactly the same
                expect(finalUserCount).toBe(initialUserCount);
                break;

              case 'invalidTimeSlot':
                // No setup data, counts should be exactly the same
                expect(finalTimeSlotCount).toBe(initialTimeSlotCount);
                break;

              case 'invalidNumberOfPlayers':
                // Setup created 1 user, but request creation failed
                expect(finalUserCount).toBe(initialUserCount + 1);
                expect(finalBookingRequestCount).toBe(initialBookingRequestCount);
                break;
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});
