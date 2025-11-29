import { PrismaClient, TimeSlotType } from '@prisma/client';
import { TimeSlotService } from '../TimeSlotService';
import { TimeSlotRepository } from '../../repositories/TimeSlotRepository';

describe('TimeSlotService Unit Tests', () => {
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
    await prisma.timeSlot.deleteMany();
  });

  describe('createTimeSlot', () => {
    it('should reject time slot with endTime <= startTime', async () => {
      const invalidTimeSlot = {
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '09:00',
        duration: 60,
        type: TimeSlotType.PEAK,
      };

      await expect(timeSlotService.createTimeSlot(invalidTimeSlot)).rejects.toThrow(
        'L\'hora de fi ha de ser posterior a l\'hora d\'inici'
      );
    });

    it('should create time slot with valid times', async () => {
      const validTimeSlot = {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
        type: TimeSlotType.PEAK,
      };

      const created = await timeSlotService.createTimeSlot(validTimeSlot);
      expect(created.startTime).toBe('09:00');
      expect(created.endTime).toBe('10:00');
    });
  });

  describe('updateTimeSlot', () => {
    it('should reject update with endTime <= startTime', async () => {
      const timeSlot = await timeSlotService.createTimeSlot({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
        type: TimeSlotType.PEAK,
      });

      await expect(
        timeSlotService.updateTimeSlot(timeSlot.id, {
          startTime: '11:00',
          endTime: '10:00',
        })
      ).rejects.toThrow('L\'hora de fi ha de ser posterior a l\'hora d\'inici');
    });

    it('should update time slot with valid times', async () => {
      const timeSlot = await timeSlotService.createTimeSlot({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
        type: TimeSlotType.PEAK,
      });

      const updated = await timeSlotService.updateTimeSlot(timeSlot.id, {
        startTime: '10:00',
        endTime: '11:00',
      });

      expect(updated.startTime).toBe('10:00');
      expect(updated.endTime).toBe('11:00');
    });
  });

  describe('getTimeSlotsForDate', () => {
    it('should return time slots for the correct day of week', async () => {
      // Create time slots for Monday (1) and Tuesday (2)
      await timeSlotService.createTimeSlot({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
        type: TimeSlotType.PEAK,
      });

      await timeSlotService.createTimeSlot({
        dayOfWeek: 2,
        startTime: '11:00',
        endTime: '12:00',
        duration: 60,
        type: TimeSlotType.OFF_PEAK,
      });

      // Test with a Monday date (2025-11-24 is a Monday)
      const mondayDate = new Date('2025-11-24');
      const mondaySlots = await timeSlotService.getTimeSlotsForDate(mondayDate);

      expect(mondaySlots).toHaveLength(1);
      expect(mondaySlots[0].dayOfWeek).toBe(1);
      expect(mondaySlots[0].startTime).toBe('09:00');

      // Test with a Tuesday date (2025-11-25 is a Tuesday)
      const tuesdayDate = new Date('2025-11-25');
      const tuesdaySlots = await timeSlotService.getTimeSlotsForDate(tuesdayDate);

      expect(tuesdaySlots).toHaveLength(1);
      expect(tuesdaySlots[0].dayOfWeek).toBe(2);
      expect(tuesdaySlots[0].startTime).toBe('11:00');
    });
  });

  describe('getTimeSlotsForDayOfWeek', () => {
    it('should return time slots for specific day of week', async () => {
      await timeSlotService.createTimeSlot({
        dayOfWeek: 3,
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
        type: TimeSlotType.PEAK,
      });

      await timeSlotService.createTimeSlot({
        dayOfWeek: 3,
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        type: TimeSlotType.OFF_PEAK,
      });

      const slots = await timeSlotService.getTimeSlotsForDayOfWeek(3);

      expect(slots).toHaveLength(2);
      expect(slots[0].startTime).toBe('09:00');
      expect(slots[1].startTime).toBe('10:00');
    });
  });
});
