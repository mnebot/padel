import fc from 'fast-check';
import { PrismaClient, UserType } from '@prisma/client';
import { BookingRepository } from '../BookingRepository';
import { BookingRequestRepository } from '../BookingRequestRepository';
import { UserRepository } from '../UserRepository';
import { CourtRepository } from '../CourtRepository';

describe('Referential Integrity Property-Based Tests', () => {
  let prisma: PrismaClient;
  let bookingRepository: BookingRepository;
  let bookingRequestRepository: BookingRequestRepository;
  let userRepository: UserRepository;
  let courtRepository: CourtRepository;

  beforeAll(async () => {
    prisma = new PrismaClient();
    bookingRepository = new BookingRepository(prisma);
    bookingRequestRepository = new BookingRequestRepository(prisma);
    userRepository = new UserRepository(prisma);
    courtRepository = new CourtRepository(prisma);
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
    await prisma.court.deleteMany();
    await prisma.user.deleteMany();
  });

  // **Feature: gestio-reserves-padel, Property 33: Integritat referencial**
  test('bookings and requests always reference existing users and courts', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Generate user data
          userName: fc.string({ minLength: 1, maxLength: 100 }),
          userEmail: fc.emailAddress(),
          userType: fc.constantFrom(UserType.MEMBER, UserType.NON_MEMBER),
          // Generate court data
          courtName: fc.string({ minLength: 1, maxLength: 100 }),
          courtDescription: fc.string({ minLength: 0, maxLength: 500 }),
          // Generate booking/request data
          date: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
          timeSlot: fc.constantFrom('09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'),
          numberOfPlayers: fc.integer({ min: 2, max: 4 }),
          createBooking: fc.boolean(), // true = booking, false = request
        }),
        async (testData) => {
          // Create user with unique email
          const uniqueEmail = `${Date.now()}-${Math.random()}-${testData.userEmail}`;
          const user = await userRepository.create({
            name: testData.userName,
            email: uniqueEmail,
            type: testData.userType,
          });

          // Create additional participants (numberOfPlayers - 1, since user is already one)
          const participantIds = [user.id];
          for (let i = 1; i < testData.numberOfPlayers; i++) {
            const participant = await userRepository.create({
              name: `Participant ${i}`,
              email: `participant${i}-${Date.now()}-${Math.random()}@test.com`,
              type: UserType.NON_MEMBER,
            });
            participantIds.push(participant.id);
          }

          // Create court
          const court = await courtRepository.create({
            name: testData.courtName,
            description: testData.courtDescription,
            isActive: true,
          });

          if (testData.createBooking) {
            // Create booking
            const booking = await bookingRepository.create({
              userId: user.id,
              courtId: court.id,
              date: testData.date,
              timeSlot: testData.timeSlot,
              numberOfPlayers: testData.numberOfPlayers,
              participantIds: participantIds,
            });

            // Verify referential integrity: user exists
            const retrievedUser = await userRepository.findById(booking.userId);
            expect(retrievedUser).not.toBeNull();
            expect(retrievedUser!.id).toBe(user.id);

            // Verify referential integrity: court exists
            const retrievedCourt = await courtRepository.findById(booking.courtId);
            expect(retrievedCourt).not.toBeNull();
            expect(retrievedCourt!.id).toBe(court.id);

            // Verify all participants exist
            const bookingWithParticipants = await prisma.booking.findUnique({
              where: { id: booking.id },
              include: {
                participants: {
                  include: {
                    user: true,
                  },
                },
              },
            });
            
            expect(bookingWithParticipants).not.toBeNull();
            expect(bookingWithParticipants!.participants.length).toBe(testData.numberOfPlayers);
            
            for (const participant of bookingWithParticipants!.participants) {
              expect(participant.user).not.toBeNull();
              expect(participantIds).toContain(participant.userId);
            }
          } else {
            // Create booking request
            const request = await bookingRequestRepository.create({
              userId: user.id,
              date: testData.date,
              timeSlot: testData.timeSlot,
              numberOfPlayers: testData.numberOfPlayers,
              participantIds: participantIds,
            });

            // Verify referential integrity: user exists
            const retrievedUser = await userRepository.findById(request.userId);
            expect(retrievedUser).not.toBeNull();
            expect(retrievedUser!.id).toBe(user.id);

            // Verify all participants exist
            const requestWithParticipants = await prisma.bookingRequest.findUnique({
              where: { id: request.id },
              include: {
                participants: {
                  include: {
                    user: true,
                  },
                },
              },
            });
            
            expect(requestWithParticipants).not.toBeNull();
            expect(requestWithParticipants!.participants.length).toBe(testData.numberOfPlayers);
            
            for (const participant of requestWithParticipants!.participants) {
              expect(participant.user).not.toBeNull();
              expect(participantIds).toContain(participant.userId);
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 120000); // 120 second timeout for property test
});
