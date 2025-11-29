import request from 'supertest';
import { app } from '../../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('LotteryController', () => {
  let userId1: string;
  let userId2: string;
  let courtId1: string;

  beforeAll(async () => {
    // Clean up database
    await prisma.bookingParticipant.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.bookingRequest.deleteMany();
    await prisma.usageCounter.deleteMany();
    await prisma.user.deleteMany();
    await prisma.court.deleteMany();

    // Create test users
    const user1 = await prisma.user.create({
      data: {
        name: 'Test User 1',
        email: 'testuser1@lottery.com',
        type: 'MEMBER',
      },
    });
    userId1 = user1.id;

    const user2 = await prisma.user.create({
      data: {
        name: 'Test User 2',
        email: 'testuser2@lottery.com',
        type: 'NON_MEMBER',
      },
    });
    userId2 = user2.id;

    // Create test courts
    const court1 = await prisma.court.create({
      data: {
        name: 'Court 1',
        description: 'Test Court 1',
        isActive: true,
      },
    });
    courtId1 = court1.id;

    await prisma.court.create({
      data: {
        name: 'Court 2',
        description: 'Test Court 2',
        isActive: true,
      },
    });

    // Initialize usage counters
    await prisma.usageCounter.create({
      data: {
        userId: userId1,
        count: 0,
        lastResetDate: new Date(),
      },
    });

    await prisma.usageCounter.create({
      data: {
        userId: userId2,
        count: 0,
        lastResetDate: new Date(),
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.bookingParticipant.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.bookingRequest.deleteMany();
    await prisma.usageCounter.deleteMany();
    await prisma.user.deleteMany();
    await prisma.court.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up bookings and requests before each test
    await prisma.bookingParticipant.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.bookingRequest.deleteMany();
  });

  describe('POST /api/lottery/execute', () => {
    it('should execute lottery and assign courts to requests', async () => {
      // Create booking requests
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      await prisma.bookingRequest.create({
        data: {
          userId: userId1,
          date: futureDate,
          timeSlot: '10:00',
          numberOfPlayers: 2,
          status: 'REQUESTED',
          participants: {
            create: [
              { userId: userId1 },
              { userId: userId2 },
            ],
          },
        },
      });

      await prisma.bookingRequest.create({
        data: {
          userId: userId2,
          date: futureDate,
          timeSlot: '10:00',
          numberOfPlayers: 2,
          status: 'REQUESTED',
          participants: {
            create: [
              { userId: userId1 },
              { userId: userId2 },
            ],
          },
        },
      });

      const response = await request(app)
        .post('/api/lottery/execute')
        .send({
          date: futureDate.toISOString(),
          timeSlot: '10:00',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.totalRequests).toBe(2);
      expect(response.body.data.summary.assigned).toBeGreaterThan(0);
      expect(response.body.data.assignments).toBeInstanceOf(Array);
    });

    it('should return empty result when no pending requests exist', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const response = await request(app)
        .post('/api/lottery/execute')
        .send({
          date: futureDate.toISOString(),
          timeSlot: '11:00',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.totalRequests).toBe(0);
      expect(response.body.data.summary.assigned).toBe(0);
      expect(response.body.data.summary.unassigned).toBe(0);
    });

    it('should reject invalid date format', async () => {
      const response = await request(app)
        .post('/api/lottery/execute')
        .send({
          date: 'invalid-date',
          timeSlot: '10:00',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject invalid time slot format', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const response = await request(app)
        .post('/api/lottery/execute')
        .send({
          date: futureDate.toISOString(),
          timeSlot: '25:00',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('GET /api/lottery/results/:date/:timeSlot', () => {
    it('should return lottery results for a specific date and time', async () => {
      // Create a booking from a request (simulating lottery result)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const request1 = await prisma.bookingRequest.create({
        data: {
          userId: userId1,
          date: futureDate,
          timeSlot: '12:00',
          numberOfPlayers: 2,
          status: 'REQUESTED',
          participants: {
            create: [
              { userId: userId1 },
              { userId: userId2 },
            ],
          },
        },
      });

      const booking = await prisma.booking.create({
        data: {
          userId: userId1,
          courtId: courtId1,
          date: futureDate,
          timeSlot: '12:00',
          numberOfPlayers: 2,
          status: 'CONFIRMED',
          requestId: request1.id,
          participants: {
            create: [
              { userId: userId1 },
              { userId: userId2 },
            ],
          },
        },
      });

      const dateStr = futureDate.toISOString().split('T')[0];
      const response = await request(app)
        .get(`/api/lottery/results/${dateStr}/12:00`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.date).toBe(dateStr);
      expect(response.body.data.timeSlot).toBe('12:00');
      expect(response.body.data.summary.totalAssigned).toBe(1);
      expect(response.body.data.assignedBookings).toHaveLength(1);
      expect(response.body.data.assignedBookings[0].bookingId).toBe(booking.id);
    });

    it('should return empty results when no lottery has been executed', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = futureDate.toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/lottery/results/${dateStr}/14:00`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.totalAssigned).toBe(0);
      expect(response.body.data.summary.totalUnassigned).toBe(0);
    });

    it('should reject invalid date format', async () => {
      const response = await request(app)
        .get('/api/lottery/results/invalid-date/10:00');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject invalid time slot format', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      const dateStr = futureDate.toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/lottery/results/${dateStr}/25:00`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ValidationError');
    });
  });
});
