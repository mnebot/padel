import fc from 'fast-check';
import { PrismaClient, UserType } from '@prisma/client';
import { UserService } from '../UserService';
import { UserRepository } from '../../repositories/UserRepository';

describe('UserService Property-Based Tests', () => {
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
    // Clean up database before each test
    await prisma.booking.deleteMany();
    await prisma.bookingRequest.deleteMany();
    await prisma.usageCounter.deleteMany();
    await prisma.user.deleteMany();
  });

  // **Feature: gestio-reserves-padel, Property 1: Persistència del tipus d'usuari**
  test('user type persists after registration', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress(),
          type: fc.constantFrom(UserType.MEMBER, UserType.NON_MEMBER),
        }),
        async (userData) => {
          const user = await userService.registerUser(userData);
          const retrieved = await userService.getUserById(user.id);
          
          expect(retrieved).not.toBeNull();
          expect(retrieved!.type).toBe(userData.type);
          expect(retrieved!.name).toBe(userData.name);
          expect(retrieved!.email).toBe(userData.email);
        }
      ),
      { numRuns: 10 }
    );
  }, 60000); // 60 second timeout for property test

  // **Feature: gestio-reserves-padel, Property 2: Actualització del tipus d'usuari**
  test('user type update applies to future operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress(),
          initialType: fc.constantFrom(UserType.MEMBER, UserType.NON_MEMBER),
          newType: fc.constantFrom(UserType.MEMBER, UserType.NON_MEMBER),
        }),
        async ({ name, email, initialType, newType }) => {
          // Register user with initial type
          const user = await userService.registerUser({
            name,
            email,
            type: initialType,
          });

          // Update user type
          const updatedUser = await userService.updateUserType(user.id, newType);

          // Verify the update was persisted
          expect(updatedUser.type).toBe(newType);

          // Verify future operations use the new type
          const retrievedUser = await userService.getUserById(user.id);
          expect(retrievedUser).not.toBeNull();
          expect(retrievedUser!.type).toBe(newType);

          // Verify that the new type persists across multiple retrievals
          const finalCheck = await userService.getUserById(user.id);
          expect(finalCheck).not.toBeNull();
          expect(finalCheck!.type).toBe(newType);
        }
      ),
      { numRuns: 10 }
    );
  }, 60000); // 60 second timeout for property test
});
