import { PrismaClient, User, UserType, Prisma } from '@prisma/client';

export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  type: UserType;
  isAdmin?: boolean;
}

export type UserWithUsageCounter = Prisma.UserGetPayload<{
  include: { usageCounter: true };
}>;

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userData: UserRegistrationData): Promise<User> {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async findById(userId: string): Promise<UserWithUsageCounter | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        usageCounter: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateUserType(userId: string, type: UserType): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { type },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        isAdmin: false, // Exclude admin users from the list
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async update(userId: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
