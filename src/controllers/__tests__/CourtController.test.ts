import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../../index';

describe('CourtController Integration Tests', () => {
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

  describe('POST /api/courts', () => {
    it('should create a new court with valid data', async () => {
      const courtData = {
        name: 'Court 1',
        description: 'Main court',
      };

      const response = await request(app)
        .post('/api/courts')
        .send(courtData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(courtData.name);
      expect(response.body.data.description).toBe(courtData.description);
      expect(response.body.data.isActive).toBe(true);
    });

    it('should create a court without description', async () => {
      const courtData = {
        name: 'Court 2',
      };

      const response = await request(app)
        .post('/api/courts')
        .send(courtData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(courtData.name);
      expect(response.body.data.description).toBe('');
    });

    it('should reject creation with missing name', async () => {
      const courtData = {
        description: 'Court without name',
      };

      const response = await request(app)
        .post('/api/courts')
        .send(courtData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject creation with empty name', async () => {
      const courtData = {
        name: '   ',
        description: 'Court with empty name',
      };

      const response = await request(app)
        .post('/api/courts')
        .send(courtData)
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('GET /api/courts', () => {
    it('should return empty array when no courts exist', async () => {
      const response = await request(app)
        .get('/api/courts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return only active courts', async () => {
      // Create active court
      const activeCourt = await prisma.court.create({
        data: {
          name: 'Active Court',
          description: 'This is active',
          isActive: true,
        },
      });

      // Create inactive court
      await prisma.court.create({
        data: {
          name: 'Inactive Court',
          description: 'This is inactive',
          isActive: false,
        },
      });

      const response = await request(app)
        .get('/api/courts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(activeCourt.id);
      expect(response.body.data[0].name).toBe('Active Court');
      expect(response.body.data[0].isActive).toBe(true);
    });

    it('should return multiple active courts', async () => {
      await prisma.court.createMany({
        data: [
          { name: 'Court 1', description: 'First', isActive: true },
          { name: 'Court 2', description: 'Second', isActive: true },
          { name: 'Court 3', description: 'Third', isActive: true },
        ],
      });

      const response = await request(app)
        .get('/api/courts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });
  });

  describe('GET /api/courts/:id', () => {
    it('should retrieve court by ID', async () => {
      const court = await prisma.court.create({
        data: {
          name: 'Test Court',
          description: 'Test description',
          isActive: true,
        },
      });

      const response = await request(app)
        .get(`/api/courts/${court.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(court.id);
      expect(response.body.data.name).toBe(court.name);
      expect(response.body.data.description).toBe(court.description);
      expect(response.body.data.isActive).toBe(true);
    });

    it('should return 400 for non-existent court', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .get(`/api/courts/${fakeUuid}`)
        .expect(400);

      expect(response.body.error).toBe('CourtNotFoundError');
    });

    it('should reject invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/courts/invalid-id')
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('PATCH /api/courts/:id', () => {
    it('should update court name', async () => {
      const court = await prisma.court.create({
        data: {
          name: 'Original Name',
          description: 'Original description',
          isActive: true,
        },
      });

      const response = await request(app)
        .patch(`/api/courts/${court.id}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.description).toBe('Original description');
    });

    it('should update court description', async () => {
      const court = await prisma.court.create({
        data: {
          name: 'Court Name',
          description: 'Original description',
          isActive: true,
        },
      });

      const response = await request(app)
        .patch(`/api/courts/${court.id}`)
        .send({ description: 'Updated description' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Court Name');
      expect(response.body.data.description).toBe('Updated description');
    });

    it('should update both name and description', async () => {
      const court = await prisma.court.create({
        data: {
          name: 'Original Name',
          description: 'Original description',
          isActive: true,
        },
      });

      const response = await request(app)
        .patch(`/api/courts/${court.id}`)
        .send({
          name: 'New Name',
          description: 'New description',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Name');
      expect(response.body.data.description).toBe('New description');
    });

    it('should maintain court ID after update', async () => {
      const court = await prisma.court.create({
        data: {
          name: 'Original Name',
          description: 'Original description',
          isActive: true,
        },
      });

      const originalId = court.id;

      const response = await request(app)
        .patch(`/api/courts/${court.id}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.data.id).toBe(originalId);
    });

    it('should reject update for non-existent court', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .patch(`/api/courts/${fakeUuid}`)
        .send({ name: 'New Name' })
        .expect(400);

      expect(response.body.error).toBe('CourtNotFoundError');
    });

    it('should reject empty name', async () => {
      const court = await prisma.court.create({
        data: {
          name: 'Original Name',
          description: 'Original description',
          isActive: true,
        },
      });

      const response = await request(app)
        .patch(`/api/courts/${court.id}`)
        .send({ name: '   ' })
        .expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('PATCH /api/courts/:id/deactivate', () => {
    it('should deactivate an active court', async () => {
      const court = await prisma.court.create({
        data: {
          name: 'Active Court',
          description: 'This will be deactivated',
          isActive: true,
        },
      });

      const response = await request(app)
        .patch(`/api/courts/${court.id}/deactivate`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isActive).toBe(false);
      expect(response.body.message).toBe('Court deactivated successfully');

      // Verify in database
      const updatedCourt = await prisma.court.findUnique({
        where: { id: court.id },
      });
      expect(updatedCourt?.isActive).toBe(false);
    });

    it('should not appear in active courts list after deactivation', async () => {
      const court = await prisma.court.create({
        data: {
          name: 'Court to Deactivate',
          description: 'Test',
          isActive: true,
        },
      });

      await request(app)
        .patch(`/api/courts/${court.id}/deactivate`)
        .expect(200);

      const response = await request(app)
        .get('/api/courts')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    it('should reject deactivation for non-existent court', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .patch(`/api/courts/${fakeUuid}/deactivate`)
        .expect(400);

      expect(response.body.error).toBe('CourtNotFoundError');
    });
  });

  describe('DELETE /api/courts/:id', () => {
    it('should delete court without active bookings', async () => {
      const court = await prisma.court.create({
        data: {
          name: 'Court to Delete',
          description: 'This will be deleted',
          isActive: true,
        },
      });

      const response = await request(app)
        .delete(`/api/courts/${court.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Court deleted successfully');

      // Verify deletion
      const deletedCourt = await prisma.court.findUnique({
        where: { id: court.id },
      });
      expect(deletedCourt).toBeNull();
    });

    it('should reject deletion of court with active bookings', async () => {
      const court = await prisma.court.create({
        data: {
          name: 'Court with Bookings',
          description: 'Has active bookings',
          isActive: true,
        },
      });

      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          type: 'MEMBER',
        },
      });

      // Create an active booking
      await prisma.booking.create({
        data: {
          userId: user.id,
          courtId: court.id,
          date: new Date('2025-12-01'),
          timeSlot: '10:00',
          numberOfPlayers: 4,
          status: 'CONFIRMED',
        },
      });

      const response = await request(app)
        .delete(`/api/courts/${court.id}`)
        .expect(400);

      expect(response.body.error).toBe('CourtHasActiveBookingsError');

      // Verify court still exists
      const existingCourt = await prisma.court.findUnique({
        where: { id: court.id },
      });
      expect(existingCourt).not.toBeNull();
    });

    it('should reject deletion for non-existent court', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .delete(`/api/courts/${fakeUuid}`)
        .expect(400);

      expect(response.body.error).toBe('CourtNotFoundError');
    });
  });
});
