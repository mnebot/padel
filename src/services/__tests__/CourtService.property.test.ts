import fc from 'fast-check';
import { PrismaClient } from '@prisma/client';
import { CourtService } from '../CourtService';
import { CourtRepository } from '../../repositories/CourtRepository';

describe('CourtService Property-Based Tests', () => {
  let prisma: PrismaClient;
  let courtRepository: CourtRepository;
  let courtService: CourtService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    courtRepository = new CourtRepository(prisma);
    courtService = new CourtService(courtRepository);
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

  // **Feature: gestio-reserves-padel, Property 26: Round-trip de pistes**
  test('court data persists after creation (round-trip)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ minLength: 0, maxLength: 500 }),
          isActive: fc.boolean(),
        }),
        async (courtData) => {
          // Create court
          const court = await courtService.createCourt(courtData);
          
          try {
            // Retrieve court
            const retrieved = await courtService.getCourtById(court.id);
            
            // Verify round-trip: retrieved data should match original data
            expect(retrieved).not.toBeNull();
            expect(retrieved!.name).toBe(courtData.name);
            expect(retrieved!.description).toBe(courtData.description);
            expect(retrieved!.isActive).toBe(courtData.isActive);
          } finally {
            // Cleanup: delete the court after each iteration
            await prisma.court.delete({ where: { id: court.id } }).catch(() => {});
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000); // 60 second timeout for property test

  // **Feature: gestio-reserves-padel, Property 27: Invariant d'identificador de pista**
  test('updating court information does not change its unique identifier', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          initialName: fc.string({ minLength: 1, maxLength: 100 }),
          initialDescription: fc.string({ minLength: 0, maxLength: 500 }),
          updatedName: fc.string({ minLength: 1, maxLength: 100 }),
          updatedDescription: fc.string({ minLength: 0, maxLength: 500 }),
          isActive: fc.boolean(),
        }),
        async (data) => {
          // Create court with initial data
          const court = await courtService.createCourt({
            name: data.initialName,
            description: data.initialDescription,
            isActive: data.isActive,
          });
          
          try {
            const originalId = court.id;
            
            // Update court with new data
            const updated = await courtService.updateCourt(court.id, {
              name: data.updatedName,
              description: data.updatedDescription,
            });
            
            // Verify ID remains unchanged
            expect(updated.id).toBe(originalId);
            expect(updated.name).toBe(data.updatedName);
            expect(updated.description).toBe(data.updatedDescription);
          } finally {
            // Cleanup: delete the court after each iteration
            await prisma.court.delete({ where: { id: court.id } }).catch(() => {});
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  // **Feature: gestio-reserves-padel, Property 28: Pistes inactives no accepten reserves**
  test('inactive courts should not accept new bookings', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ minLength: 0, maxLength: 500 }),
        }),
        async (courtData) => {
          // Create an active court
          const court = await courtService.createCourt({
            name: courtData.name,
            description: courtData.description,
            isActive: true,
          });
          
          try {
            // Verify it appears in active courts (can accept bookings)
            let activeCourts = await courtService.getActiveCourts();
            expect(activeCourts.some(c => c.id === court.id)).toBe(true);
            
            // Deactivate the court
            await courtService.deactivateCourt(court.id);
            
            // Verify it no longer appears in active courts (cannot accept bookings)
            activeCourts = await courtService.getActiveCourts();
            expect(activeCourts.some(c => c.id === court.id)).toBe(false);
            
            // Verify the court still exists but is inactive
            const retrieved = await courtService.getCourtById(court.id);
            expect(retrieved).not.toBeNull();
            expect(retrieved!.isActive).toBe(false);
            
            // Verify that inactive courts are excluded from available courts for booking
            // (This is the mechanism that prevents new bookings on inactive courts)
            const availableCourts = await courtService.getActiveCourts();
            expect(availableCourts.every(c => c.isActive)).toBe(true);
            expect(availableCourts.some(c => c.id === court.id)).toBe(false);
          } finally {
            // Cleanup: delete the court after each iteration
            await prisma.court.delete({ where: { id: court.id } }).catch(() => {});
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);
});
