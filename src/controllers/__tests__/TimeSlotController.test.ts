import request from 'supertest';
import { PrismaClient, TimeSlotType } from '@prisma/client';
import { app } from '../../index';

const prisma = new PrismaClient();

describe('TimeSlotController', () => {
  beforeAll(async () => {
    // Clean up database before tests
    await prisma.timeSlot.deleteMany({});
  });

  afterAll(async () => {
    // Clean up database after tests
    await prisma.timeSlot.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/timeslots', () => {
    it('should create a new time slot with valid data', async () => {
      const timeSlotData = {
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
        type: TimeSlotType.PEAK,
      };

      const response = await request(app)
        .post('/api/timeslots')
        .send(timeSlotData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        dayOfWeek: timeSlotData.dayOfWeek,
        startTime: timeSlotData.startTime,
        endTime: timeSlotData.endTime,
        duration: timeSlotData.duration,
        type: timeSlotData.type,
      });
      expect(response.body.data.id).toBeDefined();
    });

    it('should reject time slot with invalid time format', async () => {
      const timeSlotData = {
        dayOfWeek: 1,
        startTime: '25:00', // Invalid hour
        endTime: '10:00',
        duration: 60,
        type: TimeSlotType.PEAK,
      };

      const response = await request(app)
        .post('/api/timeslots')
        .send(timeSlotData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject time slot with end time before start time', async () => {
      const timeSlotData = {
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '09:00', // Before start time
        duration: 60,
        type: TimeSlotType.PEAK,
      };

      const response = await request(app)
        .post('/api/timeslots')
        .send(timeSlotData)
        .expect(400);

      expect(response.body.error).toBe('InvalidTimeSlotError');
    });

    it('should reject time slot with invalid day of week', async () => {
      const timeSlotData = {
        dayOfWeek: 7, // Invalid (must be 0-6)
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
        type: TimeSlotType.PEAK,
      };

      const response = await request(app)
        .post('/api/timeslots')
        .send(timeSlotData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('GET /api/timeslots', () => {
    it('should list all time slots', async () => {
      // Create a time slot first
      await prisma.timeSlot.create({
        data: {
          dayOfWeek: 2,
          startTime: '11:00',
          endTime: '12:00',
          duration: 60,
          type: TimeSlotType.OFF_PEAK,
        },
      });

      const response = await request(app)
        .get('/api/timeslots')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/timeslots/date/:date', () => {
    beforeAll(async () => {
      // Create time slots for different days
      await prisma.timeSlot.create({
        data: {
          dayOfWeek: 3, // Wednesday
          startTime: '14:00',
          endTime: '15:00',
          duration: 60,
          type: TimeSlotType.PEAK,
        },
      });
    });

    it('should get time slots for a specific date', async () => {
      // 2025-11-26 is a Wednesday (dayOfWeek = 3)
      const response = await request(app)
        .get('/api/timeslots/date/2025-11-26')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.dayOfWeek).toBe(3);
      expect(Array.isArray(response.body.data.timeSlots)).toBe(true);
    });

    it('should reject invalid date format', async () => {
      const response = await request(app)
        .get('/api/timeslots/date/invalid-date')
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('GET /api/timeslots/day/:dayOfWeek', () => {
    it('should get time slots for a specific day of week', async () => {
      const response = await request(app)
        .get('/api/timeslots/day/3')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.dayOfWeek).toBe(3);
      expect(Array.isArray(response.body.data.timeSlots)).toBe(true);
    });

    it('should reject invalid day of week', async () => {
      const response = await request(app)
        .get('/api/timeslots/day/8')
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('PATCH /api/timeslots/:id', () => {
    let timeSlotId: string;

    beforeAll(async () => {
      const timeSlot = await prisma.timeSlot.create({
        data: {
          dayOfWeek: 4,
          startTime: '16:00',
          endTime: '17:00',
          duration: 60,
          type: TimeSlotType.PEAK,
        },
      });
      timeSlotId = timeSlot.id;
    });

    it('should update time slot type', async () => {
      const response = await request(app)
        .patch(`/api/timeslots/${timeSlotId}`)
        .send({ type: TimeSlotType.OFF_PEAK })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe(TimeSlotType.OFF_PEAK);
    });

    it('should reject invalid UUID', async () => {
      const response = await request(app)
        .patch('/api/timeslots/invalid-uuid')
        .send({ type: TimeSlotType.OFF_PEAK })
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('DELETE /api/timeslots/:id', () => {
    let timeSlotId: string;

    beforeAll(async () => {
      const timeSlot = await prisma.timeSlot.create({
        data: {
          dayOfWeek: 5,
          startTime: '18:00',
          endTime: '19:00',
          duration: 60,
          type: TimeSlotType.PEAK,
        },
      });
      timeSlotId = timeSlot.id;
    });

    it('should delete a time slot', async () => {
      const response = await request(app)
        .delete(`/api/timeslots/${timeSlotId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Time slot deleted successfully');

      // Verify it's deleted
      const deletedSlot = await prisma.timeSlot.findUnique({
        where: { id: timeSlotId },
      });
      expect(deletedSlot).toBeNull();
    });

    it('should reject invalid UUID', async () => {
      const response = await request(app)
        .delete('/api/timeslots/invalid-uuid')
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });
});
