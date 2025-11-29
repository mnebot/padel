import { PrismaClient, BookingStatus } from '@prisma/client';
import { BookingRequestRepository } from '../../repositories/BookingRequestRepository';
import { BookingRequestService } from '../BookingRequestService';

describe('BookingRequestService', () => {
  let prisma: PrismaClient;
  let repository: BookingRequestRepository;
  let service: BookingRequestService;

  beforeAll(() => {
    prisma = new PrismaClient();
    repository = new BookingRequestRepository(prisma);
    service = new BookingRequestService(repository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('createRequest', () => {
    it('should create a request within the valid window (3 days in advance)', async () => {
      // Create test users
      const user1 = await prisma.user.create({
        data: {
          name: 'Test User 1',
          email: `test1-${Date.now()}@example.com`,
          type: 'MEMBER',
        },
      });

      const user2 = await prisma.user.create({
        data: {
          name: 'Test User 2',
          email: `test2-${Date.now()}@example.com`,
          type: 'MEMBER',
        },
      });

      const user3 = await prisma.user.create({
        data: {
          name: 'Test User 3',
          email: `test3-${Date.now()}@example.com`,
          type: 'MEMBER',
        },
      });

      const user4 = await prisma.user.create({
        data: {
          name: 'Test User 4',
          email: `test4-${Date.now()}@example.com`,
          type: 'MEMBER',
        },
      });

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3); // 3 days in advance

      const requestData = {
        userId: user1.id,
        date: targetDate,
        timeSlot: '10:00',
        numberOfPlayers: 4,
        participantIds: [user1.id, user2.id, user3.id, user4.id],
      };

      const request = await service.createRequest(requestData);

      expect(request).toBeDefined();
      expect(request.userId).toBe(user1.id);
      expect(request.numberOfPlayers).toBe(4);
      expect(request.status).toBe(BookingStatus.REQUESTED);
      expect(request.timeSlot).toBe('10:00');

      // Cleanup
      await prisma.bookingRequest.delete({ where: { id: request.id } });
      await prisma.user.deleteMany({ where: { id: { in: [user1.id, user2.id, user3.id, user4.id] } } });
    });

    it('should reject request with less than 2 days in advance', async () => {
      const user1 = await prisma.user.create({
        data: {
          name: 'Test User 1',
          email: `test1-${Date.now()}@example.com`,
          type: 'MEMBER',
        },
      });

      const user2 = await prisma.user.create({
        data: {
          name: 'Test User 2',
          email: `test2-${Date.now()}@example.com`,
          type: 'MEMBER',
        },
      });

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 1); // 1 day in advance

      const requestData = {
        userId: user1.id,
        date: targetDate,
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds: [user1.id, user2.id],
      };

      await expect(service.createRequest(requestData)).rejects.toThrow(
        'Booking requests must be made between 5 and 2 days in advance'
      );

      // Cleanup
      await prisma.user.deleteMany({ where: { id: { in: [user1.id, user2.id] } } });
    });

    it('should reject request with more than 5 days in advance', async () => {
      const user1 = await prisma.user.create({
        data: {
          name: 'Test User 1',
          email: `test1-${Date.now()}@example.com`,
          type: 'MEMBER',
        },
      });

      const user2 = await prisma.user.create({
        data: {
          name: 'Test User 2',
          email: `test2-${Date.now()}@example.com`,
          type: 'MEMBER',
        },
      });

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 6); // 6 days in advance

      const requestData = {
        userId: user1.id,
        date: targetDate,
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds: [user1.id, user2.id],
      };

      await expect(service.createRequest(requestData)).rejects.toThrow(
        'Booking requests must be made between 5 and 2 days in advance'
      );

      // Cleanup
      await prisma.user.deleteMany({ where: { id: { in: [user1.id, user2.id] } } });
    });

    it('should reject request with less than 2 players', async () => {
      const user1 = await prisma.user.create({
        data: {
          name: 'Test User 1',
          email: `test1-${Date.now()}@example.com`,
          type: 'MEMBER',
        },
      });

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3);

      const requestData = {
        userId: user1.id,
        date: targetDate,
        timeSlot: '10:00',
        numberOfPlayers: 1,
        participantIds: [user1.id],
      };

      await expect(service.createRequest(requestData)).rejects.toThrow(
        'Number of players must be between 2 and 4'
      );

      // Cleanup
      await prisma.user.delete({ where: { id: user1.id } });
    });

    it('should reject request with more than 4 players', async () => {
      const users = await Promise.all([
        prisma.user.create({
          data: { name: 'User 1', email: `test1-${Date.now()}@example.com`, type: 'MEMBER' },
        }),
        prisma.user.create({
          data: { name: 'User 2', email: `test2-${Date.now()}@example.com`, type: 'MEMBER' },
        }),
        prisma.user.create({
          data: { name: 'User 3', email: `test3-${Date.now()}@example.com`, type: 'MEMBER' },
        }),
        prisma.user.create({
          data: { name: 'User 4', email: `test4-${Date.now()}@example.com`, type: 'MEMBER' },
        }),
        prisma.user.create({
          data: { name: 'User 5', email: `test5-${Date.now()}@example.com`, type: 'MEMBER' },
        }),
      ]);

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3);

      const requestData = {
        userId: users[0].id,
        date: targetDate,
        timeSlot: '10:00',
        numberOfPlayers: 5,
        participantIds: users.map(u => u.id),
      };

      await expect(service.createRequest(requestData)).rejects.toThrow(
        'Number of players must be between 2 and 4'
      );

      // Cleanup
      await prisma.user.deleteMany({ where: { id: { in: users.map(u => u.id) } } });
    });
  });

  describe('cancelRequest', () => {
    it('should cancel a pending request', async () => {
      const users = await Promise.all([
        prisma.user.create({
          data: { name: 'User 1', email: `test1-${Date.now()}@example.com`, type: 'MEMBER' },
        }),
        prisma.user.create({
          data: { name: 'User 2', email: `test2-${Date.now()}@example.com`, type: 'MEMBER' },
        }),
      ]);

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3);

      const request = await repository.create({
        userId: users[0].id,
        date: targetDate,
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds: users.map(u => u.id),
        status: BookingStatus.REQUESTED,
      });

      await service.cancelRequest(request.id);

      const deletedRequest = await repository.findById(request.id);
      expect(deletedRequest).toBeNull();

      // Cleanup
      await prisma.user.deleteMany({ where: { id: { in: users.map(u => u.id) } } });
    });

    it('should reject cancellation of non-existent request', async () => {
      await expect(service.cancelRequest('non-existent-id')).rejects.toThrow(
        'Booking request not found'
      );
    });
  });

  describe('getRequestsByUser', () => {
    it('should return all requests for a user', async () => {
      const users = await Promise.all([
        prisma.user.create({
          data: { name: 'User 1', email: `test1-${Date.now()}@example.com`, type: 'MEMBER' },
        }),
        prisma.user.create({
          data: { name: 'User 2', email: `test2-${Date.now()}@example.com`, type: 'MEMBER' },
        }),
        prisma.user.create({
          data: { name: 'User 3', email: `test3-${Date.now()}@example.com`, type: 'MEMBER' },
        }),
        prisma.user.create({
          data: { name: 'User 4', email: `test4-${Date.now()}@example.com`, type: 'MEMBER' },
        }),
      ]);

      const targetDate1 = new Date();
      targetDate1.setDate(targetDate1.getDate() + 3);

      const targetDate2 = new Date();
      targetDate2.setDate(targetDate2.getDate() + 4);

      const request1 = await repository.create({
        userId: users[0].id,
        date: targetDate1,
        timeSlot: '10:00',
        numberOfPlayers: 4,
        participantIds: users.map(u => u.id),
      });

      const request2 = await repository.create({
        userId: users[0].id,
        date: targetDate2,
        timeSlot: '11:00',
        numberOfPlayers: 2,
        participantIds: [users[0].id, users[1].id],
      });

      const requests = await service.getRequestsByUser(users[0].id);

      expect(requests.length).toBeGreaterThanOrEqual(2);
      expect(requests.some(r => r.id === request1.id)).toBe(true);
      expect(requests.some(r => r.id === request2.id)).toBe(true);

      // Cleanup
      await prisma.bookingRequest.deleteMany({ where: { userId: users[0].id } });
      await prisma.user.deleteMany({ where: { id: { in: users.map(u => u.id) } } });
    });
  });

  describe('getPendingRequestsForDate', () => {
    it('should return pending requests for a specific date and time slot', async () => {
      const users = await Promise.all([
        prisma.user.create({
          data: { name: 'User 1', email: `test1-${Date.now()}@example.com`, type: 'MEMBER' },
        }),
        prisma.user.create({
          data: { name: 'User 2', email: `test2-${Date.now()}@example.com`, type: 'MEMBER' },
        }),
      ]);

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3);

      const request = await repository.create({
        userId: users[0].id,
        date: targetDate,
        timeSlot: '10:00',
        numberOfPlayers: 2,
        participantIds: users.map(u => u.id),
        status: BookingStatus.REQUESTED,
      });

      const requests = await service.getPendingRequestsForDate(targetDate, '10:00');

      expect(requests.length).toBeGreaterThanOrEqual(1);
      expect(requests.some(r => r.id === request.id)).toBe(true);

      // Cleanup
      await prisma.bookingRequest.delete({ where: { id: request.id } });
      await prisma.user.deleteMany({ where: { id: { in: users.map(u => u.id) } } });
    });

    it('should reject invalid time slot format', async () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3);

      await expect(service.getPendingRequestsForDate(targetDate, 'invalid')).rejects.toThrow(
        'Time slot must be in HH:mm format'
      );
    });
  });
});
