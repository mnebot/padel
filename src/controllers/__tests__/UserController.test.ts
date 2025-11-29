import request from 'supertest';
import { PrismaClient, UserType } from '@prisma/client';
import { app } from '../../index';

describe('UserController Integration Tests', () => {
  let prisma: PrismaClient;

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
  });

  describe('POST /api/users', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.type).toBe(userData.type);
    });

    it('should reject registration with missing name', async () => {
      const userData = {
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        type: UserType.MEMBER,
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject registration with invalid user type', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: 'INVALID_TYPE',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject registration with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      await request(app).post('/api/users').send(userData).expect(201);

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain('already exists');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should retrieve user by ID', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.type).toBe(userData.type);
      expect(response.body.data.usageCount).toBe(0);
    });

    it('should return 400 for non-existent user', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .get(`/api/users/${fakeUuid}`)
        .expect(400);

      expect(response.body.error).toBe('UserNotFoundError');
    });

    it('should reject invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('PATCH /api/users/:id/type', () => {
    it('should update user type from MEMBER to NON_MEMBER', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/users/${userId}/type`)
        .send({ type: UserType.NON_MEMBER })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe(UserType.NON_MEMBER);
    });

    it('should update user type from NON_MEMBER to MEMBER', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.NON_MEMBER,
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/users/${userId}/type`)
        .send({ type: UserType.MEMBER })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe(UserType.MEMBER);
    });

    it('should reject update for non-existent user', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .patch(`/api/users/${fakeUuid}/type`)
        .send({ type: UserType.MEMBER })
        .expect(400);

      expect(response.body.error).toBe('UserNotFoundError');
    });

    it('should reject invalid user type', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/users/${userId}/type`)
        .send({ type: 'INVALID_TYPE' })
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('GET /api/users/:id/usage', () => {
    it('should return 0 for user without usage counter', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/users/${userId}/usage`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(userId);
      expect(response.body.data.usageCount).toBe(0);
    });

    it('should return usage count when counter exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      const userId = createResponse.body.data.id;

      // Create usage counter
      await prisma.usageCounter.create({
        data: {
          userId: userId,
          count: 5,
        },
      });

      const response = await request(app)
        .get(`/api/users/${userId}/usage`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(userId);
      expect(response.body.data.usageCount).toBe(5);
    });

    it('should reject request for non-existent user', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .get(`/api/users/${fakeUuid}/usage`)
        .expect(400);

      expect(response.body.error).toBe('UserNotFoundError');
    });

    it('should reject invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id/usage')
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });
});
