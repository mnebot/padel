import request from 'supertest';
import { PrismaClient, UserType } from '@prisma/client';
import { app } from '../../index';

describe('BookingRequestController Integration Tests', () => {
  let prisma: PrismaClient;
  let testUserId: string;
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
  });

  describe('POST /api/requests', () => {
    it('should create a booking request with valid data', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3); // 3 days in advance

      const requestData = {
        userId: testUserId,
        date: futureDate.toISOString(),
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds,
      };

      const response = await request(app)
        .post('/api/requests')
        .set('X-User-Id', testUserId)
        .send(requestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data.timeSlot).toBe('10:00');
      expect(response.body.data.numberOfPlayers).toBe(2);
      expect(response.body.data.status).toBe('REQUESTED');
    });

    it('should reject request with missing userId', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const requestData = {
        date: futureDate.toISOString(),
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds,
      };

      const response = await request(app)
        .post('/api/requests')
        .set('X-User-Id', testUserId)
        .send(requestData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject request with invalid date format', async () => {
      const requestData = {
        userId: testUserId,
        date: 'invalid-date',
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds,
      };

      const response = await request(app)
        .post('/api/requests')
        .set('X-User-Id', testUserId)
        .send(requestData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject request with invalid time slot format', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const requestData = {
        userId: testUserId,
        date: futureDate.toISOString(),
        timeSlot: '25:00', // Invalid hour
        numberOfPlayers: 2,
        participantIds,
      };

      const response = await request(app)
        .post('/api/requests')
        .set('X-User-Id', testUserId)
        .send(requestData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject request with less than 2 players', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const requestData = {
        userId: testUserId,
        date: futureDate.toISOString(),
        timeSlot: '10:00',
        numberOfPlayers: 1,
        participantIds: [testUserId],
      };

      const response = await request(app)
        .post('/api/requests')
        .set('X-User-Id', testUserId)
        .send(requestData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject request with more than 4 players', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

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

      const requestData = {
        userId: testUserId,
        date: futureDate.toISOString(),
        timeSlot: '10:00',
        numberOfPlayers: 5,
        participantIds: [testUserId, participantIds[1], user3.id, user4.id, user5.id],
      };

      const response = await request(app)
        .post('/api/requests')
        .set('X-User-Id', testUserId)
        .send(requestData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject request outside request window (too early)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 6); // 6 days in advance (too early)

      const requestData = {
        userId: testUserId,
        date: futureDate.toISOString(),
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds,
      };

      const response = await request(app)
        .post('/api/requests')
        .set('X-User-Id', testUserId)
        .send(requestData)
        .expect(400);

      expect(response.body.error).toBe('InvalidRequestWindowError');
    });

    it('should reject request outside request window (too late)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // 1 day in advance (too late)

      const requestData = {
        userId: testUserId,
        date: futureDate.toISOString(),
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds,
      };

      const response = await request(app)
        .post('/api/requests')
        .set('X-User-Id', testUserId)
        .send(requestData)
        .expect(400);

      expect(response.body.error).toBe('InvalidRequestWindowError');
    });
  });

  describe('GET /api/requests/user/:userId', () => {
    it('should retrieve all requests for a user', async () => {
      const futureDate1 = new Date();
      futureDate1.setDate(futureDate1.getDate() + 3);

      const futureDate2 = new Date();
      futureDate2.setDate(futureDate2.getDate() + 4);

      // Create two requests
      await prisma.bookingRequest.create({
        data: {
          userId: testUserId,
          date: futureDate1,
          timeSlot: '10:00',
          numberOfPlayers: 2,
          status: 'REQUESTED',
          participants: {
            create: participantIds.map(id => ({ userId: id })),
          },
        },
      });

      await prisma.bookingRequest.create({
        data: {
          userId: testUserId,
          date: futureDate2,
          timeSlot: '11:00',
          numberOfPlayers: 2,
          status: 'REQUESTED',
          participants: {
            create: participantIds.map(id => ({ userId: id })),
          },
        },
      });

      const response = await request(app)
        .get(`/api/requests/user/${testUserId}`)
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].userId).toBe(testUserId);
      expect(response.body.data[1].userId).toBe(testUserId);
    });

    it('should return empty array for user with no requests', async () => {
      const response = await request(app)
        .get(`/api/requests/user/${testUserId}`)
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should reject invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/requests/user/invalid-id')
        .set('X-User-Id', testUserId)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('GET /api/requests/pending', () => {
    it('should retrieve pending requests for specific date and time slot', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      // Create pending requests
      await prisma.bookingRequest.create({
        data: {
          userId: testUserId,
          date: futureDate,
          timeSlot: '10:00',
          numberOfPlayers: 2,
          status: 'REQUESTED',
          participants: {
            create: participantIds.map(id => ({ userId: id })),
          },
        },
      });

      await prisma.bookingRequest.create({
        data: {
          userId: participantIds[1],
          date: futureDate,
          timeSlot: '10:00',
          numberOfPlayers: 2,
          status: 'REQUESTED',
          participants: {
            create: participantIds.map(id => ({ userId: id })),
          },
        },
      });

      const response = await request(app)
        .get('/api/requests/pending')
        .set('X-User-Id', testUserId)
        .query({
          date: futureDate.toISOString().split('T')[0],
          timeSlot: '10:00',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(2);
      expect(response.body.data.requests).toHaveLength(2);
      expect(response.body.data.timeSlot).toBe('10:00');
    });

    it('should return empty array when no pending requests exist', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const response = await request(app)
        .get('/api/requests/pending')
        .set('X-User-Id', testUserId)
        .query({
          date: futureDate.toISOString().split('T')[0],
          timeSlot: '10:00',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(0);
      expect(response.body.data.requests).toHaveLength(0);
    });

    it('should reject request with missing date parameter', async () => {
      const response = await request(app)
        .get('/api/requests/pending')
        .set('X-User-Id', testUserId)
        .query({ timeSlot: '10:00' })
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject request with missing timeSlot parameter', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const response = await request(app)
        .get('/api/requests/pending')
        .set('X-User-Id', testUserId)
        .query({ date: futureDate.toISOString().split('T')[0] })
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject request with invalid time slot format', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const response = await request(app)
        .get('/api/requests/pending')
        .set('X-User-Id', testUserId)
        .query({
          date: futureDate.toISOString().split('T')[0],
          timeSlot: '25:00',
        })
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('DELETE /api/requests/:id', () => {
    it('should cancel a pending booking request', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      const bookingRequest = await prisma.bookingRequest.create({
        data: {
          userId: testUserId,
          date: futureDate,
          timeSlot: '10:00',
          numberOfPlayers: 2,
          status: 'REQUESTED',
          participants: {
            create: participantIds.map(id => ({ userId: id })),
          },
        },
      });

      const response = await request(app)
        .delete(`/api/requests/${bookingRequest.id}`)
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('cancelled successfully');

      // Verify request was deleted
      const deletedRequest = await prisma.bookingRequest.findUnique({
        where: { id: bookingRequest.id },
      });
      expect(deletedRequest).toBeNull();
    });

    it('should reject cancellation of non-existent request', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .delete(`/api/requests/${fakeUuid}`)
        .set('X-User-Id', testUserId)
        .expect(400);

      expect(response.body.error).toBe('BookingNotFoundError');
    });

    it('should reject invalid UUID format', async () => {
      const response = await request(app)
        .delete('/api/requests/invalid-id')
        .set('X-User-Id', testUserId)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });
});
