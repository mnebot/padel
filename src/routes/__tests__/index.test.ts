import request from 'supertest';
import { app } from '../../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Centralized Routes', () => {
  beforeAll(async () => {
    // Clean up database before tests
    await prisma.booking.deleteMany();
    await prisma.bookingRequest.deleteMany();
    await prisma.usageCounter.deleteMany();
    await prisma.user.deleteMany();
    await prisma.court.deleteMany();
    await prisma.timeSlot.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Route Prefixes', () => {
    it('should route /api/users correctly', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          type: 'MEMBER',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should route /api/courts correctly', async () => {
      const response = await request(app)
        .get('/api/courts');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should route /api/timeslots correctly', async () => {
      const response = await request(app)
        .get('/api/timeslots');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should route /api/bookings/available correctly', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/bookings/available?date=${dateStr}&timeSlot=10:00`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('NotFound');
    });

    it('should return 404 for routes without /api prefix', async () => {
      const response = await request(app)
        .get('/users');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('NotFound');
    });
  });

  describe('Health Check', () => {
    it('should still work with centralized routes', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });
});
