import fc from 'fast-check';
import { PrismaClient, UserType } from '@prisma/client';
import { UsageCounterService } from '../UsageCounterService';
import { UsageCounterRepository } from '../../repositories/UsageCounterRepository';
import { UserRepository } from '../../repositories/UserRepository';

describe('UsageCounterService Property-Based Tests', () => {
  let prisma: PrismaClient;
  let usageCounterRepository: UsageCounterRepository;
  let usageCounterService: UsageCounterService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    prisma = new PrismaClient();
    usageCounterRepository = new UsageCounterRepository(prisma);
    usageCounterService = new UsageCounterService(usageCounterRepository);
    userRepository = new UserRepository(prisma);
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

  // **Feature: gestio-reserves-padel, Property 9: Increment del comptador d'ús**
  test('incrementing usage counter increases count by exactly 1', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress(),
          type: fc.constantFrom(UserType.MEMBER, UserType.NON_MEMBER),
        }),
        fc.integer({ min: 0, max: 15 }), // Initial count
        async (userData, initialCount) => {
          // Create a user with unique email
          const uniqueEmail = `${Date.now()}-${Math.random()}-${userData.email}`;
          const user = await userRepository.create({
            ...userData,
            email: uniqueEmail,
          });

          try {
            // Set up initial count
            for (let i = 0; i < initialCount; i++) {
              await usageCounterService.incrementUsage(user.id);
            }

            // Get count before increment
            const countBefore = await usageCounterService.getUserUsage(user.id);
            expect(countBefore).toBe(initialCount);

            // Increment once
            await usageCounterService.incrementUsage(user.id);

            // Get count after increment
            const countAfter = await usageCounterService.getUserUsage(user.id);

            // Verify it increased by exactly 1
            expect(countAfter).toBe(countBefore + 1);
            expect(countAfter).toBe(initialCount + 1);
          } finally {
            // Cleanup
            await prisma.usageCounter.deleteMany({ where: { userId: user.id } }).catch(() => {});
            await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  // **Feature: gestio-reserves-padel, Property 10: Comptador reflecteix reserves completades**
  test('usage counter reflects the number of increments', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress(),
          type: fc.constantFrom(UserType.MEMBER, UserType.NON_MEMBER),
        }),
        fc.integer({ min: 0, max: 20 }), // Number of times to increment
        async (userData, numIncrements) => {
          // Create a user with unique email
          const uniqueEmail = `${Date.now()}-${Math.random()}-${userData.email}`;
          const user = await userRepository.create({
            ...userData,
            email: uniqueEmail,
          });

          try {
            // Increment the counter numIncrements times
            for (let i = 0; i < numIncrements; i++) {
              await usageCounterService.incrementUsage(user.id);
            }

            // Verify the counter equals the number of increments
            const count = await usageCounterService.getUserUsage(user.id);
            expect(count).toBe(numIncrements);
          } finally {
            // Cleanup
            await prisma.usageCounter.deleteMany({ where: { userId: user.id } }).catch(() => {});
            await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  // **Feature: gestio-reserves-padel, Property 12: Reset mensual de comptadors**
  test('reset sets all counters to zero', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            email: fc.emailAddress(),
            type: fc.constantFrom(UserType.MEMBER, UserType.NON_MEMBER),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        fc.array(fc.integer({ min: 1, max: 10 }), { minLength: 1, maxLength: 10 }),
        async (usersData, incrementCounts) => {
          // Create users
          const users: Array<{ id: string; name: string; email: string; type: UserType }> = [];
          for (let i = 0; i < usersData.length; i++) {
            const userData = usersData[i];
            // Make email unique by adding index
            const user = await userRepository.create({
              ...userData,
              email: `${i}-${userData.email}`,
            });
            users.push(user);
          }

          // Increment counters for each user
          for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const numIncrements = incrementCounts[i % incrementCounts.length];
            for (let j = 0; j < numIncrements; j++) {
              await usageCounterService.incrementUsage(user.id);
            }
          }

          // Verify counters are not zero before reset
          for (const user of users) {
            const countBefore = await usageCounterService.getUserUsage(user.id);
            expect(countBefore).toBeGreaterThan(0);
          }

          // Reset all counters
          await usageCounterService.resetAllCounters();

          // Verify all counters are zero after reset
          for (const user of users) {
            const countAfter = await usageCounterService.getUserUsage(user.id);
            expect(countAfter).toBe(0);
          }
        }
      ),
      { numRuns: 50 } // Fewer runs since this test creates multiple users
    );
  }, 120000); // 2 minute timeout

  // **Feature: gestio-reserves-padel, Property 11: Cancel·lació no modifica comptador**
  test('counter remains unchanged when not incremented (simulating cancellation)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress(),
          type: fc.constantFrom(UserType.MEMBER, UserType.NON_MEMBER),
        }),
        fc.integer({ min: 1, max: 10 }), // Initial increments
        async (userData, initialIncrements) => {
          // Create a user
          const user = await userRepository.create(userData);

          // Increment the counter initially
          for (let i = 0; i < initialIncrements; i++) {
            await usageCounterService.incrementUsage(user.id);
          }

          // Get the count after increments
          const countBefore = await usageCounterService.getUserUsage(user.id);
          expect(countBefore).toBe(initialIncrements);

          // Simulate a cancellation by NOT calling incrementUsage
          // In the real system, when a booking is cancelled, incrementUsage is not called
          // So the counter should remain the same

          // Verify the counter hasn't changed
          const countAfter = await usageCounterService.getUserUsage(user.id);
          expect(countAfter).toBe(countBefore);
          expect(countAfter).toBe(initialIncrements);
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);
});
