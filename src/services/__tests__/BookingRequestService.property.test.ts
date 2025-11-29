import fc from 'fast-check';
import { PrismaClient } from '@prisma/client';
import { BookingRequestRepository } from '../../repositories/BookingRequestRepository';
import { BookingRequestService } from '../BookingRequestService';

describe('BookingRequestService - Property-Based Tests', () => {
  let prisma: PrismaClient;
  let repository: BookingRequestRepository;
  let service: BookingRequestService;

  beforeAll(() => {
    prisma = new PrismaClient();
    repository = new BookingRequestRepository(prisma);
    service = new BookingRequestService(repository);
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

  // **Feature: gestio-reserves-padel, Property 5: Sol·licituds sense pista assignada**
  // **Validates: Requirements 3.1**
  describe('Property 5: Requests without assigned court', () => {
    it('should create requests without assigned court within request window', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 5 }), // Days in advance (within request window)
          fc.integer({ min: 2, max: 4 }), // Number of players
          async (daysInAdvance, numberOfPlayers) => {
            // Create test users
            const users = await Promise.all(
              Array.from({ length: numberOfPlayers }, (_, i) =>
                prisma.user.create({
                  data: {
                    name: `Test User ${i}`,
                    email: `test-${Date.now()}-${i}-${Math.random()}@example.com`,
                    type: 'MEMBER',
                  },
                })
              )
            );

            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + daysInAdvance);

            const requestData = {
              userId: users[0].id,
              date: targetDate,
              timeSlot: '10:00',
              numberOfPlayers,
              participantIds: users.map(u => u.id),
            };

            try {
              const request = await service.createRequest(requestData);
              
              // Verify request was created without assigned court
              expect(request).toBeDefined();
              expect(request.status).toBe('REQUESTED');
              
              // Verify no booking was created (no court assigned)
              const booking = await prisma.booking.findFirst({
                where: { requestId: request.id },
              });
              expect(booking).toBeNull();
              
              // Cleanup
              await prisma.bookingRequest.delete({ where: { id: request.id } });
            } finally {
              // Cleanup users
              await prisma.user.deleteMany({ where: { id: { in: users.map(u => u.id) } } });
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // **Feature: gestio-reserves-padel, Property 7: Round-trip de sol·licituds**
  // **Validates: Requirements 3.4**
  describe('Property 7: Request round-trip', () => {
    it('should retrieve the same data after creating a request', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 5 }), // Days in advance
          fc.integer({ min: 2, max: 4 }), // Number of players
          fc.constantFrom('09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'), // Time slot
          async (daysInAdvance, numberOfPlayers, timeSlot) => {
            // Create test users
            const users = await Promise.all(
              Array.from({ length: numberOfPlayers }, (_, i) =>
                prisma.user.create({
                  data: {
                    name: `Test User ${i}`,
                    email: `test-${Date.now()}-${i}-${Math.random()}@example.com`,
                    type: 'MEMBER',
                  },
                })
              )
            );

            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + daysInAdvance);
            // Normalize to midnight to avoid time comparison issues
            targetDate.setHours(0, 0, 0, 0);

            const requestData = {
              userId: users[0].id,
              date: targetDate,
              timeSlot,
              numberOfPlayers,
              participantIds: users.map(u => u.id),
            };

            try {
              const createdRequest = await service.createRequest(requestData);
              
              // Retrieve the request
              const retrievedRequest = await repository.findById(createdRequest.id);
              
              // Verify round-trip: retrieved data matches created data
              expect(retrievedRequest).not.toBeNull();
              expect(retrievedRequest!.userId).toBe(requestData.userId);
              expect(retrievedRequest!.timeSlot).toBe(requestData.timeSlot);
              expect(retrievedRequest!.numberOfPlayers).toBe(requestData.numberOfPlayers);
              expect(retrievedRequest!.status).toBe('REQUESTED');
              
              // Normalize dates for comparison
              const retrievedDate = new Date(retrievedRequest!.date);
              retrievedDate.setHours(0, 0, 0, 0);
              expect(retrievedDate.getTime()).toBe(targetDate.getTime());
              
              // Cleanup
              await prisma.bookingRequest.delete({ where: { id: createdRequest.id } });
            } finally {
              // Cleanup users
              await prisma.user.deleteMany({ where: { id: { in: users.map(u => u.id) } } });
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // **Feature: gestio-reserves-padel, Property 6: Validació del nombre de jugadors**
  // **Validates: Requirements 3.2, 6.3**
  describe('Property 6: Number of players validation', () => {
    it('should only accept 2-4 players for any request', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: -10, max: 10 }), // Limit range to avoid creating too many users
          async (numberOfPlayers) => {
            // Determine how many users to create (cap at 10)
            const numUsersToCreate = Math.min(10, Math.max(1, Math.abs(numberOfPlayers)));
            
            // Create test users
            const users = await Promise.all(
              Array.from({ length: numUsersToCreate }, (_, i) =>
                prisma.user.create({
                  data: {
                    name: `Test User ${i}`,
                    email: `test-${Date.now()}-${i}-${Math.random()}@example.com`,
                    type: 'MEMBER',
                  },
                })
              )
            );

            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 3); // 3 days in advance

            // Use only the number of participants we need
            const participantIds = users.slice(0, Math.min(users.length, Math.abs(numberOfPlayers))).map(u => u.id);

            const requestData = {
              userId: users[0].id,
              date: targetDate,
              timeSlot: '10:00',
              numberOfPlayers,
              participantIds,
            };

            const isValid = numberOfPlayers >= 2 && numberOfPlayers <= 4 && participantIds.length === numberOfPlayers;

            try {
              if (isValid) {
                const request = await service.createRequest(requestData);
                expect(request).toBeDefined();
                expect(request.numberOfPlayers).toBe(numberOfPlayers);
                
                // Cleanup
                await prisma.bookingRequest.delete({ where: { id: request.id } });
              } else {
                await expect(service.createRequest(requestData)).rejects.toThrow();
              }
            } finally {
              // Cleanup users
              await prisma.user.deleteMany({ where: { id: { in: users.map(u => u.id) } } });
            }
          }
        ),
        { numRuns: 50 } // Reduce runs to speed up test
      );
    });
  });

  // **Feature: gestio-reserves-padel, Property 8: Acceptació il·limitada de sol·licituds**
  // **Validates: Requirements 3.5**
  describe('Property 8: Unlimited request acceptance', () => {
    it('should accept requests regardless of existing requests or available courts', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 5 }), // Number of requests to create
          async (numRequests) => {
            // Create test users for all requests
            const allUsers = await Promise.all(
              Array.from({ length: numRequests * 2 }, (_, i) =>
                prisma.user.create({
                  data: {
                    name: `Test User ${i}`,
                    email: `test-${Date.now()}-${i}-${Math.random()}@example.com`,
                    type: 'MEMBER',
                  },
                })
              )
            );

            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 3);

            const createdRequests = [];

            try {
              // Create multiple requests for the same time slot
              for (let i = 0; i < numRequests; i++) {
                const users = [allUsers[i * 2], allUsers[i * 2 + 1]];
                
                const requestData = {
                  userId: users[0].id,
                  date: targetDate,
                  timeSlot: '10:00',
                  numberOfPlayers: 2,
                  participantIds: users.map(u => u.id),
                };

                // Should accept request even if there are already many requests
                const request = await service.createRequest(requestData);
                expect(request).toBeDefined();
                expect(request.status).toBe('REQUESTED');
                createdRequests.push(request);
              }

              // Verify all requests were created
              expect(createdRequests.length).toBe(numRequests);

              // Verify we can retrieve all pending requests for this date/time
              const pendingRequests = await service.getPendingRequestsForDate(targetDate, '10:00');
              expect(pendingRequests.length).toBeGreaterThanOrEqual(numRequests);

            } finally {
              // Cleanup
              await prisma.bookingRequest.deleteMany({
                where: { id: { in: createdRequests.map(r => r.id) } },
              });
              await prisma.user.deleteMany({
                where: { id: { in: allUsers.map(u => u.id) } },
              });
            }
          }
        ),
        { numRuns: 30 } // Reduce runs since this creates many records
      );
    });
  });

  // **Feature: gestio-reserves-padel, Property 24: Cancel·lació elimina del sorteig**
  // **Validates: Requirements 8.1**
  describe('Property 24: Cancellation removes from lottery', () => {
    it('should remove cancelled requests from pending lottery list', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 5 }), // Number of requests to create
          fc.integer({ min: 2, max: 4 }), // Number of players
          fc.constantFrom('09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'), // Time slot
          async (numRequests, numberOfPlayers, timeSlot) => {
            // Create test users for all requests
            const allUsers = await Promise.all(
              Array.from({ length: numRequests * numberOfPlayers }, (_, i) =>
                prisma.user.create({
                  data: {
                    name: `Test User ${i}`,
                    email: `test-${Date.now()}-${i}-${Math.random()}@example.com`,
                    type: 'MEMBER',
                  },
                })
              )
            );

            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 3);
            targetDate.setHours(0, 0, 0, 0);

            const createdRequests: any[] = [];

            try {
              // Create multiple requests for the same time slot
              for (let i = 0; i < numRequests; i++) {
                const users = allUsers.slice(i * numberOfPlayers, (i + 1) * numberOfPlayers);
                
                const requestData = {
                  userId: users[0].id,
                  date: targetDate,
                  timeSlot,
                  numberOfPlayers,
                  participantIds: users.map(u => u.id),
                };

                const request = await service.createRequest(requestData);
                createdRequests.push(request);
              }

              // Verify all requests are in pending list
              const pendingBefore = await service.getPendingRequestsForDate(targetDate, timeSlot);
              const ourRequestsBefore = pendingBefore.filter(r => 
                createdRequests.some(cr => cr.id === r.id)
              );
              expect(ourRequestsBefore.length).toBe(numRequests);

              // Cancel a random request
              const requestToCancel = createdRequests[Math.floor(Math.random() * createdRequests.length)];
              await service.cancelRequest(requestToCancel.id);

              // Verify the cancelled request is no longer in pending list
              const pendingAfter = await service.getPendingRequestsForDate(targetDate, timeSlot);
              const cancelledInPending = pendingAfter.find(r => r.id === requestToCancel.id);
              expect(cancelledInPending).toBeUndefined();

              // Verify other requests are still in pending list
              const otherRequests = createdRequests.filter(r => r.id !== requestToCancel.id);
              const otherRequestsInPending = pendingAfter.filter(r => 
                otherRequests.some(or => or.id === r.id)
              );
              expect(otherRequestsInPending.length).toBe(numRequests - 1);

            } finally {
              // Cleanup - delete remaining requests
              const remainingRequests = await prisma.bookingRequest.findMany({
                where: { id: { in: createdRequests.map(r => r.id) } },
              });
              
              if (remainingRequests.length > 0) {
                await prisma.bookingRequest.deleteMany({
                  where: { id: { in: remainingRequests.map(r => r.id) } },
                });
              }
              
              await prisma.user.deleteMany({
                where: { id: { in: allUsers.map(u => u.id) } },
              });
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // **Feature: gestio-reserves-padel, Property 23: Estat de sol·licituds pendents**
  // **Validates: Requirements 7.3**
  describe('Property 23: Pending request status', () => {
    it('should have REQUESTED status for any request that has not gone through lottery', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 5 }), // Days in advance (within request window)
          fc.integer({ min: 2, max: 4 }), // Number of players
          fc.constantFrom('09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'), // Time slot
          async (daysInAdvance, numberOfPlayers, timeSlot) => {
            // Create test users
            const users = await Promise.all(
              Array.from({ length: numberOfPlayers }, (_, i) =>
                prisma.user.create({
                  data: {
                    name: `Test User ${i}`,
                    email: `test-${Date.now()}-${i}-${Math.random()}@example.com`,
                    type: 'MEMBER',
                  },
                })
              )
            );

            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + daysInAdvance);
            targetDate.setHours(0, 0, 0, 0);

            const requestData = {
              userId: users[0].id,
              date: targetDate,
              timeSlot,
              numberOfPlayers,
              participantIds: users.map(u => u.id),
            };

            try {
              // Create a request
              const request = await service.createRequest(requestData);
              
              // Verify the request has REQUESTED status immediately after creation
              expect(request.status).toBe('REQUESTED');
              
              // Retrieve the request from database to verify persistence
              const retrievedRequest = await repository.findById(request.id);
              expect(retrievedRequest).not.toBeNull();
              expect(retrievedRequest!.status).toBe('REQUESTED');
              
              // Verify it appears in pending requests list
              const pendingRequests = await service.getPendingRequestsForDate(targetDate, timeSlot);
              const ourRequest = pendingRequests.find(r => r.id === request.id);
              expect(ourRequest).toBeDefined();
              expect(ourRequest!.status).toBe('REQUESTED');
              
              // Verify no booking has been created (lottery hasn't run)
              const booking = await prisma.booking.findFirst({
                where: { requestId: request.id },
              });
              expect(booking).toBeNull();
              
              // Cleanup
              await prisma.bookingRequest.delete({ where: { id: request.id } });
            } finally {
              // Cleanup users
              await prisma.user.deleteMany({ where: { id: { in: users.map(u => u.id) } } });
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
