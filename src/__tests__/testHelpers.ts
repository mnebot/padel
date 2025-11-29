import { PrismaClient } from '@prisma/client';

/**
 * Comprehensive database cleanup that respects foreign key constraints
 * Order is critical: delete children before parents
 */
export async function cleanupDatabase(prisma: PrismaClient): Promise<void> {
  // Delete in correct order to respect foreign key constraints
  await prisma.bookingParticipant.deleteMany();
  await prisma.requestParticipant.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.bookingRequest.deleteMany();
  await prisma.usageCounter.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.court.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * Create a test user with unique email
 */
export async function createTestUser(
  prisma: PrismaClient,
  data: { name: string; email: string; type: 'MEMBER' | 'NON_MEMBER' }
): Promise<any> {
  const uniqueEmail = `${Date.now()}-${Math.random()}-${data.email}`;
  return prisma.user.create({
    data: {
      ...data,
      email: uniqueEmail,
    },
  });
}

/**
 * Create a test court with unique name
 */
export async function createTestCourt(
  prisma: PrismaClient,
  data: { name: string; description: string; isActive?: boolean }
): Promise<any> {
  const uniqueName = `${Date.now()}-${Math.random()}-${data.name}`;
  return prisma.court.create({
    data: {
      ...data,
      name: uniqueName,
      isActive: data.isActive ?? true,
    },
  });
}
