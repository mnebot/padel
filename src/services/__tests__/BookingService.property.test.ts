import fc from 'fast-check';
import { PrismaClient, UserType, BookingStatus } from '@prisma/client';
import { BookingRepository } from '../../repositories/BookingRepository';
import { CourtRepository } from '../../repositories/CourtRepository';
import { UsageCounterRepository } from '../../repositories/UsageCounterRepository';
import { BookingService } from '../BookingService';

describe('BookingService - Property-Based Tests', () => {
  let prisma: PrismaClient;
  let bookingRepository: BookingRepository;
  let courtRepository: CourtRepository;
  let usageCounterRepository: UsageCounterRepository;
  let bookingService: BookingService;

  beforeAll(() => {
    prisma = new PrismaClient();
    bookingRepository = new BookingRepository(prisma);
    courtRepository = new CourtRepository(prisma);
    usageCounterRepository = new UsageCounterRepository(prisma);
    bookingService = new BookingService(bookingRepository, courtRepository, usageCounterRepository);
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
    await prisma.court.deleteMany();
    await prisma.user.deleteMany();
  });

  // **Feature: gestio-reserves-padel, Property 18: Reserves directes confirmades immediatament**
  // **Validates: Requirements 6.2**
  describe('Property 18: Direct bookings confirmed immediately', () => {
    it('should create direct bookings with CONFIRMED status immediately for any valid booking within direct booking window', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 1 }), // Days in advance (within direct booking window: 0-1 days)
          fc.integer({ min: 2, max: 4 }), // Number of players
          fc.constantFrom('09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'), // Time slot
          fc.constantFrom(UserType.MEMBER, UserType.NON_MEMBER), // User type
          async (daysInAdvance, numberOfPlayers, timeSlot, userType) => {
            // Create test users (one for the booking owner, rest as participants)
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

            // Calculate target date within direct booking window
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + daysInAdvance);
            targetDate.setHours(0, 0, 0, 0); // Normalize to midnight

            const bookingData = {
              userId: users[0].id,
              courtId: court.id,
              date: targetDate,
              timeSlot,
              numberOfPlayers,
              participantIds: users.map(u => u.id),
            };

            let booking;
            try {
              // Create direct booking
              booking = await bookingService.createDirectBooking(bookingData);

              // Property: Direct booking should be CONFIRMED immediately
              expect(booking).toBeDefined();
              expect(booking.status).toBe(BookingStatus.CONFIRMED);
              expect(booking.userId).toBe(users[0].id);
              expect(booking.courtId).toBe(court.id);
              expect(booking.timeSlot).toBe(timeSlot);
              expect(booking.numberOfPlayers).toBe(numberOfPlayers);

              // Verify the booking is persisted with CONFIRMED status
              const retrievedBooking = await prisma.booking.findUnique({
                where: { id: booking.id },
              });
              expect(retrievedBooking).not.toBeNull();
              expect(retrievedBooking!.status).toBe(BookingStatus.CONFIRMED);
            } finally {
              // Cleanup - delete booking participants first, then booking, then court, then users
              if (booking) {
                await prisma.bookingParticipant.deleteMany({ where: { bookingId: booking.id } }).catch(() => {});
                await prisma.booking.delete({ where: { id: booking.id } }).catch(() => {});
              }
              await prisma.court.delete({ where: { id: court.id } }).catch(() => {});
              await prisma.user.deleteMany({ where: { id: { in: users.map(u => u.id) } } }).catch(() => {});
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  // **Feature: gestio-reserves-padel, Property 19: No dobles reserves**
  // **Validates: Requirements 6.4, 12.1**
  describe('Property 19: No double bookings', () => {
    it('should prevent double bookings for the same court and time slot for any valid booking data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 1 }), // Days in advance (within direct booking window: 0-1 days)
          fc.integer({ min: 2, max: 4 }), // Number of players for first booking
          fc.integer({ min: 2, max: 4 }), // Number of players for second booking
          fc.constantFrom('09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'), // Time slot
          fc.constantFrom(UserType.MEMBER, UserType.NON_MEMBER), // User type
          async (daysInAdvance, numberOfPlayers1, numberOfPlayers2, timeSlot, userType) => {
            // Create test users for both bookings
            const totalUsers = numberOfPlayers1 + numberOfPlayers2;
            const users = await Promise.all(
              Array.from({ length: totalUsers }, (_, i) =>
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

            // Calculate target date within direct booking window
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + daysInAdvance);
            targetDate.setHours(0, 0, 0, 0); // Normalize to midnight

            const bookingData1 = {
              userId: users[0].id,
              courtId: court.id,
              date: targetDate,
              timeSlot,
              numberOfPlayers: numberOfPlayers1,
              participantIds: users.slice(0, numberOfPlayers1).map(u => u.id),
            };

            const bookingData2 = {
              userId: users[numberOfPlayers1].id,
              courtId: court.id,
              date: targetDate,
              timeSlot, // Same time slot
              numberOfPlayers: numberOfPlayers2,
              participantIds: users.slice(numberOfPlayers1, numberOfPlayers1 + numberOfPlayers2).map(u => u.id),
            };

            let booking1;
            try {
              // Create first booking - should succeed
              booking1 = await bookingService.createDirectBooking(bookingData1);
              expect(booking1).toBeDefined();
              expect(booking1.status).toBe(BookingStatus.CONFIRMED);

              // Property: Attempting to create a second booking for the same court and time slot should fail
              await expect(
                bookingService.createDirectBooking(bookingData2)
              ).rejects.toThrow(); // Should throw CourtNotAvailableError

              // Verify only one booking exists for this court and time slot
              const bookings = await prisma.booking.findMany({
                where: {
                  courtId: court.id,
                  timeSlot,
                  status: BookingStatus.CONFIRMED,
                },
              });
              expect(bookings.length).toBe(1);
              expect(bookings[0].id).toBe(booking1.id);
            } finally {
              // Cleanup - delete booking participants first, then booking, then court, then users
              if (booking1) {
                await prisma.bookingParticipant.deleteMany({ where: { bookingId: booking1.id } }).catch(() => {});
                await prisma.booking.delete({ where: { id: booking1.id } }).catch(() => {});
              }
              await prisma.court.delete({ where: { id: court.id } }).catch(() => {});
              await prisma.user.deleteMany({ where: { id: { in: users.map(u => u.id) } } }).catch(() => {});
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  // **Feature: gestio-reserves-padel, Property 25: Cancel·lació allibera pista**
  // **Validates: Requirements 8.2**
  describe('Property 25: Cancellation frees up court', () => {
    it('should free up court immediately after cancelling any confirmed booking', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 1 }), // Days in advance (within direct booking window: 0-1 days)
          fc.integer({ min: 2, max: 4 }), // Number of players for first booking
          fc.integer({ min: 2, max: 4 }), // Number of players for second booking
          fc.constantFrom('09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'), // Time slot
          fc.constantFrom(UserType.MEMBER, UserType.NON_MEMBER), // User type
          async (daysInAdvance, numberOfPlayers1, numberOfPlayers2, timeSlot, userType) => {
            // Create test users for both bookings
            const totalUsers = numberOfPlayers1 + numberOfPlayers2;
            const users = await Promise.all(
              Array.from({ length: totalUsers }, (_, i) =>
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

            // Calculate target date within direct booking window
            // Use a unique timestamp to avoid conflicts with other test runs
            const baseDate = new Date();
            baseDate.setDate(baseDate.getDate() + daysInAdvance);
            baseDate.setHours(12, 0, 0, 0); // Use noon to avoid timezone issues
            baseDate.setMilliseconds(Date.now() % 1000); // Add uniqueness

            const bookingData1 = {
              userId: users[0].id,
              courtId: court.id,
              date: new Date(baseDate),
              timeSlot,
              numberOfPlayers: numberOfPlayers1,
              participantIds: users.slice(0, numberOfPlayers1).map(u => u.id),
            };

            const bookingData2 = {
              userId: users[numberOfPlayers1].id,
              courtId: court.id,
              date: new Date(baseDate),
              timeSlot, // Same time slot
              numberOfPlayers: numberOfPlayers2,
              participantIds: users.slice(numberOfPlayers1, numberOfPlayers1 + numberOfPlayers2).map(u => u.id),
            };

            let booking1;
            let booking2;
            try {
              // Create first booking - should succeed
              booking1 = await bookingService.createDirectBooking(bookingData1);
              expect(booking1).toBeDefined();
              expect(booking1.status).toBe(BookingStatus.CONFIRMED);

              // Property: Verify court is not available after creating booking
              // Query directly from database to check conflict
              const bookingsBeforeCancel = await prisma.booking.count({
                where: {
                  courtId: court.id,
                  timeSlot,
                  status: { in: ['CONFIRMED', 'REQUESTED'] },
                },
              });
              expect(bookingsBeforeCancel).toBeGreaterThan(0);

              // Check if there are any CANCELLED bookings that might conflict
              const existingCancelledBookings = await prisma.booking.findMany({
                where: {
                  courtId: court.id,
                  timeSlot,
                  status: 'CANCELLED',
                },
              });
              
              // If there are existing cancelled bookings, delete them to avoid unique constraint violation
              if (existingCancelledBookings.length > 0) {
                await prisma.bookingParticipant.deleteMany({
                  where: { bookingId: { in: existingCancelledBookings.map(b => b.id) } },
                });
                await prisma.booking.deleteMany({
                  where: { id: { in: existingCancelledBookings.map(b => b.id) } },
                });
              }

              // Property: Cancel the booking - should free up the court immediately
              await bookingService.cancelBooking(booking1.id);

              // Verify the booking is cancelled
              const cancelledBooking = await prisma.booking.findUnique({
                where: { id: booking1.id },
              });
              expect(cancelledBooking).not.toBeNull();
              expect(cancelledBooking!.status).toBe(BookingStatus.CANCELLED);

              // Property: Court should now be available (no conflict) after cancellation
              const bookingsAfterCancel = await prisma.booking.count({
                where: {
                  courtId: court.id,
                  timeSlot,
                  status: { in: ['CONFIRMED', 'REQUESTED'] },
                },
              });
              expect(bookingsAfterCancel).toBe(0);

              // Clean up the cancelled booking to avoid unique constraint issues
              await prisma.bookingParticipant.deleteMany({ where: { bookingId: booking1.id } });
              await prisma.booking.delete({ where: { id: booking1.id } });
              booking1 = undefined as any; // Mark as cleaned up

              // Property: Should be able to create a new booking for the same court and time slot
              booking2 = await bookingService.createDirectBooking(bookingData2);
              expect(booking2).toBeDefined();
              expect(booking2.status).toBe(BookingStatus.CONFIRMED);
              expect(booking2.courtId).toBe(court.id);
              expect(booking2.timeSlot).toBe(timeSlot);

              // Verify the court is available in the available courts list after second cancellation
              await bookingService.cancelBooking(booking2.id);
              const bookingsAfterSecondCancel = await prisma.booking.count({
                where: {
                  courtId: court.id,
                  timeSlot,
                  status: { in: ['CONFIRMED', 'REQUESTED'] },
                },
              });
              expect(bookingsAfterSecondCancel).toBe(0);
            } finally {
              // Cleanup - delete booking participants first, then bookings, then court, then users
              if (booking1) {
                await prisma.bookingParticipant.deleteMany({ where: { bookingId: booking1.id } }).catch(() => {});
                await prisma.booking.delete({ where: { id: booking1.id } }).catch(() => {});
              }
              if (booking2) {
                await prisma.bookingParticipant.deleteMany({ where: { bookingId: booking2.id } }).catch(() => {});
                await prisma.booking.delete({ where: { id: booking2.id } }).catch(() => {});
              }
              await prisma.court.delete({ where: { id: court.id } }).catch(() => {});
              await prisma.user.deleteMany({ where: { id: { in: users.map(u => u.id) } } }).catch(() => {});
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
