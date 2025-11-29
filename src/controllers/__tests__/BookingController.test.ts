import request from 'supertest';
import { PrismaClient, UserType } from '@prisma/client';
import { app } from '../../index';

describe('BookingController Integration Tests', () => {
  let prisma: PrismaClient;
  let testUserId: string;
  let testCourtId: string;
  let participantIds: string[];

  beforeAll(async () => {
    prisma = new PrismaClient();
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

    // Create test users
    const user1 = await prisma.user.create({
      data: {
        name: 'Test User 1',
        email: 'test1@example.com',
        type: UserType.MEMBER,
      },
    });
    testUserId = user1.id;

    const user2 = await prisma.user.create({
      data: {
        name: 'Test User 2',
        email: 'test2@example.com',
        type: UserType.MEMBER,
      },
    });

    participantIds = [user1.id, user2.id];

    // Create test court
    const court = await prisma.court.create({
      data: {
        name: 'Test Court 1',
        description: 'Test court for integration tests',
        isActive: true,
      },
    });
    testCourtId = court.id;
  });

  describe('POST /api/bookings', () => {
    it('should create a direct booking with valid data', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // 1 day in advance (within direct booking window)
      futureDate.setHours(10, 0, 0, 0);

      const bookingData = {
        userId: testUserId,
        courtId: testCourtId,
        date: futureDate.toISOString(),
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds,
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data.courtId).toBe(testCourtId);
      expect(response.body.data.timeSlot).toBe('10:00');
      expect(response.body.data.numberOfPlayers).toBe(2);
      expect(response.body.data.status).toBe('CONFIRMED');
    });

    it('should reject booking with missing userId', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const bookingData = {
        courtId: testCourtId,
        date: futureDate.toISOString(),
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds,
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject booking with missing courtId', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const bookingData = {
        userId: testUserId,
        date: futureDate.toISOString(),
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds,
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject booking with invalid date format', async () => {
      const bookingData = {
        userId: testUserId,
        courtId: testCourtId,
        date: 'invalid-date',
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds,
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject booking with invalid time slot format', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const bookingData = {
        userId: testUserId,
        courtId: testCourtId,
        date: futureDate.toISOString(),
        timeSlot: '25:00', // Invalid hour
        numberOfPlayers: 2,
        participantIds,
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject booking with less than 2 players', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const bookingData = {
        userId: testUserId,
        courtId: testCourtId,
        date: futureDate.toISOString(),
        timeSlot: '10:00',
        numberOfPlayers: 1,
        participantIds: [testUserId],
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject booking with more than 4 players', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      // Create additional users
      const user3 = await prisma.user.create({
        data: { name: 'User 3', email: 'user3@example.com', type: UserType.MEMBER },
      });
      const user4 = await prisma.user.create({
        data: { name: 'User 4', email: 'user4@example.com', type: UserType.MEMBER },
      });
      const user5 = await prisma.user.create({
        data: { name: 'User 5', email: 'user5@example.com', type: UserType.MEMBER },
      });

      const bookingData = {
        userId: testUserId,
        courtId: testCourtId,
        date: futureDate.toISOString(),
        timeSlot: '10:00',
        numberOfPlayers: 5,
        participantIds: [testUserId, participantIds[1], user3.id, user4.id, user5.id],
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject booking outside direct booking window (too early)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3); // 3 days in advance (outside direct booking window)

      const bookingData = {
        userId: testUserId,
        courtId: testCourtId,
        date: futureDate.toISOString(),
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds,
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.error).toBe('InvalidDirectBookingWindowError');
    });

    it('should reject booking for inactive court', async () => {
      // Create inactive court
      const inactiveCourt = await prisma.court.create({
        data: {
          name: 'Inactive Court',
          description: 'This court is inactive',
          isActive: false,
        },
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const bookingData = {
        userId: testUserId,
        courtId: inactiveCourt.id,
        date: futureDate.toISOString(),
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds,
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.error).toBe('CourtInactiveError');
    });

    it('should reject booking for already occupied time slot', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);

      // Create first booking
      await prisma.booking.create({
        data: {
          userId: testUserId,
          courtId: testCourtId,
          date: futureDate,
          timeSlot: '10:00',
          numberOfPlayers: 2,
          status: 'CONFIRMED',
          participants: {
            create: participantIds.map(id => ({ userId: id })),
          },
        },
      });

      // Try to create second booking for same court and time
      const bookingData = {
        userId: participantIds[1],
        courtId: testCourtId,
        date: futureDate.toISOString(),
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds,
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.error).toBe('CourtNotAvailableError');
    });
  });

  describe('GET /api/bookings/user/:userId', () => {
    it('should retrieve all bookings for a user', async () => {
      const futureDate1 = new Date();
      futureDate1.setDate(futureDate1.getDate() + 1);
      futureDate1.setHours(10, 0, 0, 0);

      const futureDate2 = new Date();
      futureDate2.setDate(futureDate2.getDate() + 1);
      futureDate2.setHours(11, 0, 0, 0);

      // Create two bookings
      await prisma.booking.create({
        data: {
          userId: testUserId,
          courtId: testCourtId,
          date: futureDate1,
          timeSlot: '10:00',
          numberOfPlayers: 2,
          status: 'CONFIRMED',
          participants: {
            create: participantIds.map(id => ({ userId: id })),
          },
        },
      });

      await prisma.booking.create({
        data: {
          userId: testUserId,
          courtId: testCourtId,
          date: futureDate2,
          timeSlot: '11:00',
          numberOfPlayers: 2,
          status: 'CONFIRMED',
          participants: {
            create: participantIds.map(id => ({ userId: id })),
          },
        },
      });

      const response = await request(app)
        .get(`/api/bookings/user/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].userId).toBe(testUserId);
      expect(response.body.data[1].userId).toBe(testUserId);
    });

    it('should return empty array for user with no bookings', async () => {
      const response = await request(app)
        .get(`/api/bookings/user/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should reject invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/bookings/user/invalid-id')
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('GET /api/bookings/available', () => {
    it('should retrieve available courts for specific date and time slot', async () => {
      // Create additional courts
      await prisma.court.create({
        data: {
          name: 'Test Court 2',
          description: 'Second test court',
          isActive: true,
        },
      });

      await prisma.court.create({
        data: {
          name: 'Test Court 3',
          description: 'Third test court',
          isActive: true,
        },
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const response = await request(app)
        .get('/api/bookings/available')
        .query({
          date: futureDate.toISOString().split('T')[0],
          timeSlot: '10:00',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(3);
      expect(response.body.data.courts).toHaveLength(3);
      expect(response.body.data.timeSlot).toBe('10:00');
    });

    it('should exclude occupied courts from available list', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);

      // Create booking for test court
      await prisma.booking.create({
        data: {
          userId: testUserId,
          courtId: testCourtId,
          date: futureDate,
          timeSlot: '10:00',
          numberOfPlayers: 2,
          status: 'CONFIRMED',
          participants: {
            create: participantIds.map(id => ({ userId: id })),
          },
        },
      });

      // Create another available court
      await prisma.court.create({
        data: {
          name: 'Test Court 2',
          description: 'Second test court',
          isActive: true,
        },
      });

      const response = await request(app)
        .get('/api/bookings/available')
        .query({
          date: futureDate.toISOString().split('T')[0],
          timeSlot: '10:00',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(1);
      expect(response.body.data.courts).toHaveLength(1);
      expect(response.body.data.courts[0].name).toBe('Test Court 2');
    });

    it('should reject request with missing date parameter', async () => {
      const response = await request(app)
        .get('/api/bookings/available')
        .query({ timeSlot: '10:00' })
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject request with missing timeSlot parameter', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const response = await request(app)
        .get('/api/bookings/available')
        .query({ date: futureDate.toISOString().split('T')[0] })
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject request with invalid time slot format', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const response = await request(app)
        .get('/api/bookings/available')
        .query({
          date: futureDate.toISOString().split('T')[0],
          timeSlot: '25:00',
        })
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should cancel a confirmed booking', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);

      const booking = await prisma.booking.create({
        data: {
          userId: testUserId,
          courtId: testCourtId,
          date: futureDate,
          timeSlot: '10:00',
          numberOfPlayers: 2,
          status: 'CONFIRMED',
          participants: {
            create: participantIds.map(id => ({ userId: id })),
          },
        },
      });

      const response = await request(app)
        .delete(`/api/bookings/${booking.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('cancelled successfully');

      // Verify booking was cancelled
      const cancelledBooking = await prisma.booking.findUnique({
        where: { id: booking.id },
      });
      expect(cancelledBooking?.status).toBe('CANCELLED');
    });

    it('should reject cancellation of completed booking', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      pastDate.setHours(10, 0, 0, 0);

      const booking = await prisma.booking.create({
        data: {
          userId: testUserId,
          courtId: testCourtId,
          date: pastDate,
          timeSlot: '10:00',
          numberOfPlayers: 2,
          status: 'COMPLETED',
          participants: {
            create: participantIds.map(id => ({ userId: id })),
          },
        },
      });

      const response = await request(app)
        .delete(`/api/bookings/${booking.id}`)
        .expect(400);

      expect(response.body.error).toBe('CannotCancelCompletedBookingError');
    });

    it('should reject cancellation of non-existent booking', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .delete(`/api/bookings/${fakeUuid}`)
        .expect(400);

      expect(response.body.error).toBe('BookingNotFoundError');
    });

    it('should reject invalid UUID format', async () => {
      const response = await request(app)
        .delete('/api/bookings/invalid-id')
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('PATCH /api/bookings/:id/complete', () => {
    it('should complete a confirmed booking', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);

      const booking = await prisma.booking.create({
        data: {
          userId: testUserId,
          courtId: testCourtId,
          date: futureDate,
          timeSlot: '10:00',
          numberOfPlayers: 2,
          status: 'CONFIRMED',
          participants: {
            create: participantIds.map(id => ({ userId: id })),
          },
        },
      });

      const response = await request(app)
        .patch(`/api/bookings/${booking.id}/complete`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('completed successfully');

      // Verify booking was completed
      const completedBooking = await prisma.booking.findUnique({
        where: { id: booking.id },
      });
      expect(completedBooking?.status).toBe('COMPLETED');

      // Verify usage counter was incremented
      const usageCounter = await prisma.usageCounter.findUnique({
        where: { userId: testUserId },
      });
      expect(usageCounter?.count).toBe(1);
    });

    it('should reject completion of non-existent booking', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .patch(`/api/bookings/${fakeUuid}/complete`)
        .expect(400);

      expect(response.body.error).toBe('BookingNotFoundError');
    });

    it('should reject invalid UUID format', async () => {
      const response = await request(app)
        .patch('/api/bookings/invalid-id/complete')
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });
});
