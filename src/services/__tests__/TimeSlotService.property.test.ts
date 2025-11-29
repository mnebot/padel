import fc from 'fast-check';
import { PrismaClient, TimeSlotType } from '@prisma/client';
import { TimeSlotService } from '../TimeSlotService';
import { TimeSlotRepository } from '../../repositories/TimeSlotRepository';

describe('TimeSlotService Property-Based Tests', () => {
  let timeSlotService: TimeSlotService;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    const timeSlotRepository = new TimeSlotRepository(prisma);
    timeSlotService = new TimeSlotService(timeSlotRepository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.timeSlot.deleteMany();
  });

  // **Feature: gestio-reserves-padel, Property 3: Classificació de franges horàries**
  test('all time slots have valid classification (OFF_PEAK or PEAK)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          dayOfWeek: fc.integer({ min: 0, max: 6 }),
          startTime: fc.integer({ min: 0, max: 22 }).map(h => `${h.toString().padStart(2, '0')}:00`),
          endTime: fc.integer({ min: 1, max: 23 }).map(h => `${h.toString().padStart(2, '0')}:00`),
          duration: fc.integer({ min: 30, max: 180 }),
          type: fc.constantFrom(TimeSlotType.OFF_PEAK, TimeSlotType.PEAK),
        }),
        async (timeSlotData) => {
          // Only test valid time slots where endTime > startTime
          if (timeSlotData.endTime <= timeSlotData.startTime) {
            return; // Skip invalid combinations
          }

          // Clean up before each iteration
          await prisma.timeSlot.deleteMany();

          // Create time slot
          const timeSlot = await timeSlotService.createTimeSlot(timeSlotData);
          
          // Verify classification is valid
          expect([TimeSlotType.OFF_PEAK, TimeSlotType.PEAK]).toContain(timeSlot.type);
          expect(timeSlot.type).toBe(timeSlotData.type);
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  // **Feature: gestio-reserves-padel, Property 31: Validació d'horaris**
  test('end time must be strictly after start time', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          dayOfWeek: fc.integer({ min: 0, max: 6 }),
          startTime: fc.integer({ min: 0, max: 23 }).map(h => `${h.toString().padStart(2, '0')}:00`),
          endTime: fc.integer({ min: 0, max: 23 }).map(h => `${h.toString().padStart(2, '0')}:00`),
          duration: fc.integer({ min: 30, max: 180 }),
          type: fc.constantFrom(TimeSlotType.OFF_PEAK, TimeSlotType.PEAK),
        }),
        async (timeSlotData) => {
          // Clean up before each iteration
          await prisma.timeSlot.deleteMany();

          if (timeSlotData.endTime > timeSlotData.startTime) {
            // Valid case: should succeed
            const timeSlot = await timeSlotService.createTimeSlot(timeSlotData);
            // Verify that endTime is after startTime (string comparison works for "HH:mm" format)
            expect(timeSlot.endTime > timeSlot.startTime).toBe(true);
          } else {
            // Invalid case: should reject
            await expect(timeSlotService.createTimeSlot(timeSlotData)).rejects.toThrow(
              'L\'hora de fi ha de ser posterior a l\'hora d\'inici'
            );
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  // **Feature: gestio-reserves-padel, Property 29: Round-trip de franges horàries**
  test('time slot data persists after creation (round-trip)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          dayOfWeek: fc.integer({ min: 0, max: 6 }),
          startTime: fc.integer({ min: 0, max: 22 }).map(h => `${h.toString().padStart(2, '0')}:00`),
          endTime: fc.integer({ min: 1, max: 23 }).map(h => `${h.toString().padStart(2, '0')}:00`),
          duration: fc.integer({ min: 30, max: 180 }),
          type: fc.constantFrom(TimeSlotType.OFF_PEAK, TimeSlotType.PEAK),
        }),
        async (timeSlotData) => {
          // Only test valid time slots where endTime > startTime
          if (timeSlotData.endTime <= timeSlotData.startTime) {
            return; // Skip invalid combinations
          }

          // Clean up before each iteration
          await prisma.timeSlot.deleteMany();

          // Create time slot
          const timeSlot = await timeSlotService.createTimeSlot(timeSlotData);
          
          // Retrieve time slot
          const retrieved = await timeSlotService.getTimeSlotById(timeSlot.id);
          
          // Verify round-trip: retrieved data should match original data
          expect(retrieved).not.toBeNull();
          expect(retrieved!.dayOfWeek).toBe(timeSlotData.dayOfWeek);
          expect(retrieved!.startTime).toBe(timeSlotData.startTime);
          expect(retrieved!.endTime).toBe(timeSlotData.endTime);
          expect(retrieved!.duration).toBe(timeSlotData.duration);
          expect(retrieved!.type).toBe(timeSlotData.type);
        }
      ),
      { numRuns: 10 }
    );
  }, 60000); // 60 second timeout for property test

  // **Feature: gestio-reserves-padel, Property 30: Horaris per dia de la setmana**
  test('dates with same day of week have same time slots', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          dayOfWeek: fc.integer({ min: 0, max: 6 }),
          startTime: fc.integer({ min: 0, max: 22 }).map(h => `${h.toString().padStart(2, '0')}:00`),
          endTime: fc.integer({ min: 1, max: 23 }).map(h => `${h.toString().padStart(2, '0')}:00`),
          duration: fc.integer({ min: 30, max: 180 }),
          type: fc.constantFrom(TimeSlotType.OFF_PEAK, TimeSlotType.PEAK),
        }),
        async (timeSlotData) => {
          // Only test valid time slots where endTime > startTime
          if (timeSlotData.endTime <= timeSlotData.startTime) {
            return; // Skip invalid combinations
          }

          // Clean up before each iteration
          await prisma.timeSlot.deleteMany();

          // Create time slot for specific day of week
          await timeSlotService.createTimeSlot(timeSlotData);

          // Get time slots for the day of week directly
          const slotsByDayOfWeek = await timeSlotService.getTimeSlotsForDayOfWeek(timeSlotData.dayOfWeek);

          // Create two different dates with the same day of week
          // We need to find dates that match the dayOfWeek
          const today = new Date();
          const currentDayOfWeek = today.getDay();
          const daysToAdd = (timeSlotData.dayOfWeek - currentDayOfWeek + 7) % 7;
          
          const date1 = new Date(today);
          date1.setDate(today.getDate() + daysToAdd);
          
          const date2 = new Date(today);
          date2.setDate(today.getDate() + daysToAdd + 7); // Same day, next week

          // Get time slots for both dates
          const slotsForDate1 = await timeSlotService.getTimeSlotsForDate(date1);
          const slotsForDate2 = await timeSlotService.getTimeSlotsForDate(date2);

          // Verify both dates return the same time slots
          expect(slotsForDate1.length).toBe(slotsByDayOfWeek.length);
          expect(slotsForDate2.length).toBe(slotsByDayOfWeek.length);
          expect(slotsForDate1.length).toBe(slotsForDate2.length);

          // Verify the content matches
          if (slotsForDate1.length > 0) {
            expect(slotsForDate1[0].id).toBe(slotsForDate2[0].id);
            expect(slotsForDate1[0].startTime).toBe(slotsForDate2[0].startTime);
            expect(slotsForDate1[0].endTime).toBe(slotsForDate2[0].endTime);
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);
});
