import { PrismaClient, UserType } from '@prisma/client';
import { UserService } from '../UserService';
import { UserRepository } from '../../repositories/UserRepository';

describe('UserService Unit Tests', () => {
  let prisma: PrismaClient;
  let userRepository: UserRepository;
  let userService: UserService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    userRepository = new UserRepository(prisma);
    userService = new UserService(userRepository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up database before each test - order matters due to foreign keys
    await prisma.bookingParticipant.deleteMany();
    await prisma.requestParticipant.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.bookingRequest.deleteMany();
    await prisma.usageCounter.deleteMany();
    await prisma.court.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('registerUser', () => {
    it('should register a user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      const user = await userService.registerUser(userData);

      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.type).toBe(userData.type);
    });

    it('should reject registration with empty name', async () => {
      const userData = {
        name: '',
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      await expect(userService.registerUser(userData)).rejects.toThrow('User name is required');
    });

    it('should reject registration with empty email', async () => {
      const userData = {
        name: 'Test User',
        email: '',
        type: UserType.MEMBER,
      };

      await expect(userService.registerUser(userData)).rejects.toThrow('User email is required');
    });

    it('should reject registration with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      await userService.registerUser(userData);
      await expect(userService.registerUser(userData)).rejects.toThrow('User with this email already exists');
    });
  });

  describe('getUserById', () => {
    it('should retrieve user by ID', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      const createdUser = await userService.registerUser(userData);
      const retrievedUser = await userService.getUserById(createdUser.id);

      expect(retrievedUser).toBeDefined();
      expect(retrievedUser!.id).toBe(createdUser.id);
      expect(retrievedUser!.name).toBe(userData.name);
    });

    it('should return null for non-existent user', async () => {
      const user = await userService.getUserById('non-existent-id');
      expect(user).toBeNull();
    });

    it('should reject empty user ID', async () => {
      await expect(userService.getUserById('')).rejects.toThrow('User ID is required');
    });
  });

  describe('updateUserType', () => {
    it('should update user type from MEMBER to NON_MEMBER', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      const user = await userService.registerUser(userData);
      const updatedUser = await userService.updateUserType(user.id, UserType.NON_MEMBER);

      expect(updatedUser.type).toBe(UserType.NON_MEMBER);
    });

    it('should update user type from NON_MEMBER to MEMBER', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.NON_MEMBER,
      };

      const user = await userService.registerUser(userData);
      const updatedUser = await userService.updateUserType(user.id, UserType.MEMBER);

      expect(updatedUser.type).toBe(UserType.MEMBER);
    });

    it('should reject update for non-existent user', async () => {
      await expect(userService.updateUserType('non-existent-id', UserType.MEMBER))
        .rejects.toThrow('Usuari no trobat');
    });

    it('should reject empty user ID', async () => {
      await expect(userService.updateUserType('', UserType.MEMBER))
        .rejects.toThrow('User ID is required');
    });
  });

  describe('getUserUsageCount', () => {
    it('should return 0 for user without usage counter', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      const user = await userService.registerUser(userData);
      const usageCount = await userService.getUserUsageCount(user.id);

      expect(usageCount).toBe(0);
    });

    it('should return usage count when counter exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        type: UserType.MEMBER,
      };

      const user = await userService.registerUser(userData);
      
      // Create usage counter
      await prisma.usageCounter.create({
        data: {
          userId: user.id,
          count: 5,
        },
      });

      const usageCount = await userService.getUserUsageCount(user.id);
      expect(usageCount).toBe(5);
    });

    it('should reject request for non-existent user', async () => {
      await expect(userService.getUserUsageCount('non-existent-id'))
        .rejects.toThrow('Usuari no trobat');
    });

    it('should reject empty user ID', async () => {
      await expect(userService.getUserUsageCount(''))
        .rejects.toThrow('User ID is required');
    });
  });
});
