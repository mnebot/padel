import { PrismaClient } from '@prisma/client';
import { CourtService } from '../CourtService';
import { CourtRepository } from '../../repositories/CourtRepository';
import { CourtHasActiveBookingsError } from '../../errors';

describe('CourtService Unit Tests', () => {
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

  describe('createCourt', () => {
    test('creates a court with valid data', async () => {
      const courtData = {
        name: 'Court 1',
        description: 'Main court',
        isActive: true,
      };

      const court = await courtService.createCourt(courtData);

      expect(court).toBeDefined();
      expect(court.id).toBeDefined();
      expect(court.name).toBe(courtData.name);
      expect(court.description).toBe(courtData.description);
      expect(court.isActive).toBe(true);
    });

    test('creates a court with default isActive=true when not specified', async () => {
      const courtData = {
        name: 'Court 2',
        description: 'Secondary court',
      };

      const court = await courtService.createCourt(courtData);

      expect(court.isActive).toBe(true);
    });
  });

  describe('updateCourt', () => {
    test('updates court data while maintaining ID', async () => {
      const court = await courtService.createCourt({
        name: 'Original Name',
        description: 'Original Description',
      });

      const originalId = court.id;

      const updated = await courtService.updateCourt(court.id, {
        name: 'Updated Name',
        description: 'Updated Description',
      });

      expect(updated.id).toBe(originalId);
      expect(updated.name).toBe('Updated Name');
      expect(updated.description).toBe('Updated Description');
    });
  });

  describe('deactivateCourt', () => {
    test('sets isActive to false', async () => {
      const court = await courtService.createCourt({
        name: 'Court to Deactivate',
        description: 'Test court',
        isActive: true,
      });

      const deactivated = await courtService.deactivateCourt(court.id);

      expect(deactivated.isActive).toBe(false);
      expect(deactivated.id).toBe(court.id);
    });
  });

  describe('getActiveCourts', () => {
    test('returns only active courts', async () => {
      await courtService.createCourt({
        name: 'Active Court 1',
        description: 'Active',
        isActive: true,
      });

      await courtService.createCourt({
        name: 'Active Court 2',
        description: 'Active',
        isActive: true,
      });

      const inactiveCourt = await courtService.createCourt({
        name: 'Inactive Court',
        description: 'Inactive',
        isActive: true,
      });

      await courtService.deactivateCourt(inactiveCourt.id);

      const activeCourts = await courtService.getActiveCourts();

      expect(activeCourts).toHaveLength(2);
      expect(activeCourts.every(c => c.isActive)).toBe(true);
    });
  });

  describe('deleteCourt', () => {
    test('deletes court when no active bookings exist', async () => {
      const court = await courtService.createCourt({
        name: 'Court to Delete',
        description: 'Test court',
      });

      await courtService.deleteCourt(court.id);

      const retrieved = await courtService.getCourtById(court.id);
      expect(retrieved).toBeNull();
    });

    test('throws error when trying to delete court with active bookings', async () => {
      const court = await courtService.createCourt({
        name: 'Court with Bookings',
        description: 'Test court',
      });

      // Create a user first
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: `test-${Date.now()}@example.com`,
          type: 'MEMBER',
        },
      });

      // Create additional users for participants
      const timestamp = Date.now();
      const participants = await Promise.all([
        prisma.user.create({
          data: { name: 'Participant 1', email: `p1-${timestamp}@example.com`, type: 'MEMBER' },
        }),
        prisma.user.create({
          data: { name: 'Participant 2', email: `p2-${timestamp}@example.com`, type: 'MEMBER' },
        }),
        prisma.user.create({
          data: { name: 'Participant 3', email: `p3-${timestamp}@example.com`, type: 'MEMBER' },
        }),
      ]);

      // Create an active booking
      await prisma.booking.create({
        data: {
          userId: user.id,
          courtId: court.id,
          date: new Date(),
          timeSlot: '10:00',
          numberOfPlayers: 4,
          status: 'CONFIRMED',
          participants: {
            create: [
              { userId: user.id },
              { userId: participants[0].id },
              { userId: participants[1].id },
              { userId: participants[2].id },
            ],
          },
        },
      });

      await expect(courtService.deleteCourt(court.id)).rejects.toThrow(
        CourtHasActiveBookingsError
      );
    });
  });

  describe('hasActiveBookings', () => {
    test('returns true when court has confirmed bookings', async () => {
      const court = await courtService.createCourt({
        name: 'Court with Bookings',
        description: 'Test court',
      });

      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: `test-hasBookings-${Date.now()}@example.com`,
          type: 'MEMBER',
        },
      });

      // Create additional users for participants
      const timestamp2 = Date.now();
      const participants = await Promise.all([
        prisma.user.create({
          data: { name: 'Participant 1', email: `p1-confirmed-${timestamp2}@example.com`, type: 'MEMBER' },
        }),
        prisma.user.create({
          data: { name: 'Participant 2', email: `p2-confirmed-${timestamp2}@example.com`, type: 'MEMBER' },
        }),
        prisma.user.create({
          data: { name: 'Participant 3', email: `p3-confirmed-${timestamp2}@example.com`, type: 'MEMBER' },
        }),
      ]);

      await prisma.booking.create({
        data: {
          userId: user.id,
          courtId: court.id,
          date: new Date(),
          timeSlot: '10:00',
          numberOfPlayers: 4,
          status: 'CONFIRMED',
          participants: {
            create: [
              { userId: user.id },
              { userId: participants[0].id },
              { userId: participants[1].id },
              { userId: participants[2].id },
            ],
          },
        },
      });

      const hasBookings = await courtService.hasActiveBookings(court.id);
      expect(hasBookings).toBe(true);
    });

    test('returns false when court has no bookings', async () => {
      const court = await courtService.createCourt({
        name: 'Empty Court',
        description: 'Test court',
      });

      const hasBookings = await courtService.hasActiveBookings(court.id);
      expect(hasBookings).toBe(false);
    });

    test('returns false when court only has cancelled bookings', async () => {
      const court = await courtService.createCourt({
        name: 'Court with Cancelled Bookings',
        description: 'Test court',
      });

      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: `test-cancelled-${Date.now()}@example.com`,
          type: 'MEMBER',
        },
      });

      // Create additional users for participants
      const timestamp3 = Date.now();
      const participants = await Promise.all([
        prisma.user.create({
          data: { name: 'Participant 1', email: `p1-cancelled-${timestamp3}@example.com`, type: 'MEMBER' },
        }),
        prisma.user.create({
          data: { name: 'Participant 2', email: `p2-cancelled-${timestamp3}@example.com`, type: 'MEMBER' },
        }),
        prisma.user.create({
          data: { name: 'Participant 3', email: `p3-cancelled-${timestamp3}@example.com`, type: 'MEMBER' },
        }),
      ]);

      await prisma.booking.create({
        data: {
          userId: user.id,
          courtId: court.id,
          date: new Date(),
          timeSlot: '10:00',
          numberOfPlayers: 4,
          status: 'CANCELLED',
          participants: {
            create: [
              { userId: user.id },
              { userId: participants[0].id },
              { userId: participants[1].id },
              { userId: participants[2].id },
            ],
          },
        },
      });

      const hasBookings = await courtService.hasActiveBookings(court.id);
      expect(hasBookings).toBe(false);
    });
  });
});
