import { User, UserType } from '@prisma/client';
import { UserRepository, UserRegistrationData, UserWithUsageCounter } from '../repositories/UserRepository';
import { UserNotFoundError } from '../errors';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Register a new user with validation of user type
   * Validates: Requirements 1.1
   */
  async registerUser(userData: UserRegistrationData): Promise<User> {
    // Validate user type is either MEMBER or NON_MEMBER
    if (!Object.values(UserType).includes(userData.type)) {
      throw new Error(`Invalid user type: ${userData.type}`);
    }

    // Validate required fields
    if (!userData.name || userData.name.trim().length === 0) {
      throw new Error('User name is required');
    }

    if (!userData.email || userData.email.trim().length === 0) {
      throw new Error('User email is required');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    return this.userRepository.create(userData);
  }

  /**
   * Get user by ID
   * Validates: Requirements 1.2
   */
  async getUserById(userId: string): Promise<UserWithUsageCounter | null> {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    return this.userRepository.findById(userId);
  }

  /**
   * Update user type (admin operation)
   * Validates: Requirements 1.4
   */
  async updateUserType(userId: string, type: UserType): Promise<User> {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    // Validate user type is either MEMBER or NON_MEMBER
    if (!Object.values(UserType).includes(type)) {
      throw new Error(`Invalid user type: ${type}`);
    }

    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    return this.userRepository.updateUserType(userId, type);
  }

  /**
   * Get user usage count
   * Validates: Requirements 1.1
   */
  async getUserUsageCount(userId: string): Promise<number> {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Get usage count from UsageCounter if it exists
    if (user.usageCounter) {
      return user.usageCounter.count;
    }

    return 0;
  }

  /**
   * Update user information
   * Validates: Requirements 1.2
   */
  async updateUser(userId: string, data: Partial<UserRegistrationData>): Promise<User> {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Validate user type if provided
    if (data.type && !Object.values(UserType).includes(data.type)) {
      throw new Error(`Invalid user type: ${data.type}`);
    }

    // Check if email is being changed and if it already exists
    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }

    return this.userRepository.update(userId, data);
  }
}
