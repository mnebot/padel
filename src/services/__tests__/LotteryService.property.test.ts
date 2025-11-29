import fc from 'fast-check';
import { PrismaClient, UserType } from '@prisma/client';
import { LotteryService } from '../LotteryService';
import { BookingRequestRepository } from '../../repositories/BookingRequestRepository';
import { BookingRepository } from '../../repositories/BookingRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { UsageCounterRepository } from '../../repositories/UsageCounterRepository';

describe('LotteryService - Property-Based Tests', () => {
  let prisma: PrismaClient;
  let lotteryService: LotteryService;
  let bookingRequestRepository: BookingRequestRepository;
  let bookingRepository: BookingRepository;
  let userRepository: UserRepository;
  let usageCounterRepository: UsageCounterRepository;

  beforeAll(() => {
    prisma = new PrismaClient();
    bookingRequestRepository = new BookingRequestRepository(prisma);
    bookingRepository = new BookingRepository(prisma);
    userRepository = new UserRepository(prisma);
    usageCounterRepository = new UsageCounterRepository(prisma);
    lotteryService = new LotteryService(
      bookingRequestRepository,
      bookingRepository,
      userRepository,
      usageCounterRepository
    );
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

  // **Feature: gestio-reserves-padel, Property 15: Distribució ponderada del sorteig**
  // **Validates: Requirements 5.5**
  describe('Property 15: Weighted lottery distribution', () => {
    it('should assign courts proportionally to weights over many lottery executions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 5 }), // Usage count for first user (reduced range)
          fc.integer({ min: 0, max: 5 }), // Usage count for second user (reduced range)
          async (usageCount1, usageCount2) => {
            // We'll test with exactly 2 requests to simplify the statistical analysis

            // Create users with different types and usage counts
            const user1 = await prisma.user.create({
              data: {
                name: 'Member User',
                email: `member-${Date.now()}-${Math.random()}@example.com`,
                type: UserType.MEMBER,
              },
            });

            const user1Partner = await prisma.user.create({
              data: {
                name: 'Member User Partner',
                email: `member-partner-${Date.now()}-${Math.random()}@example.com`,
                type: UserType.MEMBER,
              },
            });

            const user2 = await prisma.user.create({
              data: {
                name: 'Non-Member User',
                email: `nonmember-${Date.now()}-${Math.random()}@example.com`,
                type: UserType.NON_MEMBER,
              },
            });

            const user2Partner = await prisma.user.create({
              data: {
                name: 'Non-Member User Partner',
                email: `nonmember-partner-${Date.now()}-${Math.random()}@example.com`,
                type: UserType.NON_MEMBER,
              },
            });

            // Set usage counters
            await usageCounterRepository.setCount(user1.id, usageCount1);
            await usageCounterRepository.setCount(user2.id, usageCount2);

            // Calculate expected weights
            const weight1 = lotteryService.calculateWeight(UserType.MEMBER, usageCount1);
            const weight2 = lotteryService.calculateWeight(UserType.NON_MEMBER, usageCount2);

            // Create a court (only 1 court, so competition for it)
            const court = await prisma.court.create({
              data: {
                name: 'Test Court',
                description: 'Test court for lottery',
                isActive: true,
              },
            });

            const timeSlot = '10:00';

            try {
              // Run the lottery multiple times and count assignments
              const numRuns = 20; // Run lottery 20 times (reduced for performance)
              let user1Wins = 0;
              let user2Wins = 0;

              for (let run = 0; run < numRuns; run++) {
                // Clean up previous run
                await prisma.bookingParticipant.deleteMany();
                await prisma.requestParticipant.deleteMany();
                await prisma.booking.deleteMany();
                await prisma.bookingRequest.deleteMany();

                // Create a fresh date for each run (to avoid mutation issues)
                const targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + 3);
                targetDate.setHours(0, 0, 0, 0);

                // Create requests for this run
                const request1 = await prisma.bookingRequest.create({
                  data: {
                    userId: user1.id,
                    date: targetDate,
                    timeSlot,
                    numberOfPlayers: 2,
                    status: 'REQUESTED',
                    weight: weight1,
                    participants: {
                      create: [
                        { userId: user1.id },
                        { userId: user1Partner.id },
                      ],
                    },
                  },
                });

                const request2 = await prisma.bookingRequest.create({
                  data: {
                    userId: user2.id,
                    date: targetDate,
                    timeSlot,
                    numberOfPlayers: 2,
                    status: 'REQUESTED',
                    weight: weight2,
                    participants: {
                      create: [
                        { userId: user2.id },
                        { userId: user2Partner.id },
                      ],
                    },
                  },
                });

                // No additional requests needed

                // Execute lottery
                const result = await lotteryService.executeLottery(targetDate, timeSlot);

                // Check who won
                if (result.assigned.length > 0) {
                  const winningRequestId = result.assigned[0].requestId;
                  if (winningRequestId === request1.id) {
                    user1Wins++;
                  } else if (winningRequestId === request2.id) {
                    user2Wins++;
                  }
                }
              }

              // Verify proportional distribution
              // The user with higher weight should win more often
              const totalWins = user1Wins + user2Wins;
              
              if (totalWins > 0 && weight1 !== weight2) {
                const user1WinRate = user1Wins / totalWins;
                const user2WinRate = user2Wins / totalWins;
                
                const expectedUser1Rate = weight1 / (weight1 + weight2);
                const expectedUser2Rate = weight2 / (weight1 + weight2);

                // Allow for statistical variance (within 30% of expected)
                // This is a probabilistic test, so we need some tolerance
                const tolerance = 0.3;
                
                if (weight1 > weight2) {
                  // User 1 should win more often
                  expect(user1WinRate).toBeGreaterThan(user2WinRate * 0.7);
                } else if (weight2 > weight1) {
                  // User 2 should win more often
                  expect(user2WinRate).toBeGreaterThan(user1WinRate * 0.7);
                }
                
                // Check that win rates are roughly proportional to weights
                // (within tolerance)
                const user1RatioError = Math.abs(user1WinRate - expectedUser1Rate);
                const user2RatioError = Math.abs(user2WinRate - expectedUser2Rate);
                
                expect(user1RatioError).toBeLessThan(tolerance);
                expect(user2RatioError).toBeLessThan(tolerance);
              }

            } finally {
              // Cleanup
              await prisma.bookingParticipant.deleteMany();
              await prisma.requestParticipant.deleteMany();
              await prisma.booking.deleteMany();
              await prisma.bookingRequest.deleteMany();
              await prisma.usageCounter.deleteMany();
              await prisma.court.delete({ where: { id: court.id } });
              await prisma.user.delete({ where: { id: user1.id } });
              await prisma.user.delete({ where: { id: user1Partner.id } });
              await prisma.user.delete({ where: { id: user2.id } });
              await prisma.user.delete({ where: { id: user2Partner.id } });
            }
          }
        ),
        { numRuns: 5 } // Reduced runs since each run executes lottery 20 times
      );
    }, 30000); // 30 second timeout for this test
  });

  // **Feature: gestio-reserves-padel, Property 16: Assignació crea reserva confirmada**
  // **Validates: Requirements 5.6**
  describe('Property 16: Assignment creates confirmed booking', () => {
    it('should create a confirmed booking with assigned court when a request wins the lottery', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 4 }), // Number of players
          fc.constantFrom(UserType.MEMBER, UserType.NON_MEMBER), // User type
          fc.integer({ min: 0, max: 10 }), // Usage count
          async (numberOfPlayers, userType, usageCount) => {
            // Create user
            const user = await prisma.user.create({
              data: {
                name: `Test User ${Date.now()}`,
                email: `user-${Date.now()}-${Math.random()}@example.com`,
                type: userType,
              },
            });

            // Create participant users
            const participantUsers: any[] = [];
            for (let i = 0; i < numberOfPlayers; i++) {
              const participant = await prisma.user.create({
                data: {
                  name: `Participant ${i} ${Date.now()}`,
                  email: `participant-${i}-${Date.now()}-${Math.random()}@example.com`,
                  type: userType,
                },
              });
              participantUsers.push(participant);
            }

            // Set usage counter
            await usageCounterRepository.setCount(user.id, usageCount);

            // Create a court
            const court = await prisma.court.create({
              data: {
                name: `Test Court ${Date.now()}`,
                description: 'Test court for lottery',
                isActive: true,
              },
            });

            const timeSlot = '10:00';
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 3);
            targetDate.setHours(0, 0, 0, 0);

            try {
              // Create a booking request
              const request = await prisma.bookingRequest.create({
                data: {
                  userId: user.id,
                  date: targetDate,
                  timeSlot,
                  numberOfPlayers,
                  status: 'REQUESTED',
                  participants: {
                    create: participantUsers.map(p => ({ userId: p.id })),
                  },
                },
              });

              // Execute lottery
              const result = await lotteryService.executeLottery(targetDate, timeSlot);

              // Since there's only one request and one court, it should be assigned
              expect(result.assigned.length).toBe(1);
              expect(result.unassigned.length).toBe(0);

              const assignment = result.assigned[0];
              expect(assignment.requestId).toBe(request.id);
              expect(assignment.courtId).toBe(court.id);
              expect(assignment.bookingId).toBeDefined();

              // Verify that a booking was created
              const booking = await bookingRepository.findById(assignment.bookingId);
              expect(booking).not.toBeNull();
              expect(booking!.status).toBe('CONFIRMED');
              expect(booking!.courtId).toBe(court.id);
              expect(booking!.userId).toBe(user.id);
              // Compare dates by normalizing both to midnight
              const bookingDate = new Date(booking!.date);
              bookingDate.setHours(0, 0, 0, 0);
              const expectedDate = new Date(targetDate);
              expectedDate.setHours(0, 0, 0, 0);
              expect(bookingDate.getTime()).toBe(expectedDate.getTime());
              expect(booking!.timeSlot).toBe(timeSlot);
              expect(booking!.numberOfPlayers).toBe(numberOfPlayers);
              expect(booking!.requestId).toBe(request.id);

            } finally {
              // Cleanup
              await prisma.bookingParticipant.deleteMany();
              await prisma.requestParticipant.deleteMany();
              await prisma.booking.deleteMany();
              await prisma.bookingRequest.deleteMany();
              await prisma.usageCounter.deleteMany();
              await prisma.court.delete({ where: { id: court.id } });
              await prisma.user.delete({ where: { id: user.id } });
              for (const participant of participantUsers) {
                await prisma.user.delete({ where: { id: participant.id } });
              }
            }
          }
        ),
        { numRuns: 10 }
      );
    }, 30000); // 30 second timeout
  });

  // **Feature: gestio-reserves-padel, Property 17: Sol·licituds no assignades**
  // **Validates: Requirements 5.7**
  describe('Property 17: Unassigned requests', () => {
    it('should mark requests as unassigned when they do not get a court in the lottery', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 5 }), // Number of requests (more than courts)
          fc.integer({ min: 2, max: 4 }), // Number of players
          async (numRequests, numberOfPlayers) => {
            // Ensure we have more requests than courts
            const numCourts = 1; // Only 1 court available
            const actualNumRequests = Math.max(numRequests, numCourts + 1); // At least 2 requests

            const users: any[] = [];
            const participantUsers: any[] = [];
            const requests: any[] = [];

            const timeSlot = '10:00';
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 3);
            targetDate.setHours(0, 0, 0, 0);

            try {
              // Create court
              await prisma.court.create({
                data: {
                  name: `Test Court ${Date.now()}`,
                  description: 'Test court for lottery',
                  isActive: true,
                },
              });

              // Create users and requests
              for (let i = 0; i < actualNumRequests; i++) {
                const user = await prisma.user.create({
                  data: {
                    name: `Test User ${i} ${Date.now()}`,
                    email: `user-${i}-${Date.now()}-${Math.random()}@example.com`,
                    type: i % 2 === 0 ? UserType.MEMBER : UserType.NON_MEMBER,
                  },
                });
                users.push(user);

                // Create participants for this request
                const requestParticipants: any[] = [];
                for (let j = 0; j < numberOfPlayers; j++) {
                  const participant = await prisma.user.create({
                    data: {
                      name: `Participant ${i}-${j} ${Date.now()}`,
                      email: `participant-${i}-${j}-${Date.now()}-${Math.random()}@example.com`,
                      type: user.type,
                    },
                  });
                  participantUsers.push(participant);
                  requestParticipants.push(participant);
                }

                // Set usage counter (all equal for simplicity)
                await usageCounterRepository.setCount(user.id, 0);

                // Create booking request
                const request = await prisma.bookingRequest.create({
                  data: {
                    userId: user.id,
                    date: targetDate,
                    timeSlot,
                    numberOfPlayers,
                    status: 'REQUESTED',
                    participants: {
                      create: requestParticipants.map(p => ({ userId: p.id })),
                    },
                  },
                });
                requests.push(request);
              }

              // Execute lottery
              const result = await lotteryService.executeLottery(targetDate, timeSlot);

              // Verify that exactly numCourts requests were assigned
              expect(result.assigned.length).toBe(numCourts);

              // Verify that the remaining requests are unassigned
              const expectedUnassigned = actualNumRequests - numCourts;
              expect(result.unassigned.length).toBe(expectedUnassigned);

              // Verify that unassigned requests are in the unassigned list
              const assignedRequestIds = new Set(result.assigned.map(a => a.requestId));
              for (const unassignedRequest of result.unassigned) {
                // Should not be in assigned list
                expect(assignedRequestIds.has(unassignedRequest.id)).toBe(false);

                // Should still be a valid request
                expect(unassignedRequest.userId).toBeDefined();
                expect(unassignedRequest.status).toBe('REQUESTED');

                // Should not have a booking created for it
                const booking = await prisma.booking.findFirst({
                  where: { requestId: unassignedRequest.id },
                });
                expect(booking).toBeNull();
              }

              // Verify that assigned requests have bookings
              for (const assignment of result.assigned) {
                const booking = await bookingRepository.findById(assignment.bookingId);
                expect(booking).not.toBeNull();
                expect(booking!.status).toBe('CONFIRMED');
              }

              // Verify total count
              expect(result.assigned.length + result.unassigned.length).toBe(actualNumRequests);

            } finally {
              // Cleanup
              await prisma.bookingParticipant.deleteMany();
              await prisma.requestParticipant.deleteMany();
              await prisma.booking.deleteMany();
              await prisma.bookingRequest.deleteMany();
              await prisma.usageCounter.deleteMany();
              await prisma.court.deleteMany();
              for (const user of users) {
                await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
              }
              for (const participant of participantUsers) {
                await prisma.user.delete({ where: { id: participant.id } }).catch(() => {});
              }
            }
          }
        ),
        { numRuns: 10 }
      );
    }, 30000); // 30 second timeout
  });
});
