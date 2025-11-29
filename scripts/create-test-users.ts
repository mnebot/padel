import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test users...');

  // Hash password
  const password = await bcrypt.hash('password123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@padel.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@padel.com',
      password,
      type: 'MEMBER',
      isAdmin: true,
    },
  });

  console.log('✓ Admin user created:', admin.email);

  // Create regular user (member)
  const member = await prisma.user.upsert({
    where: { email: 'member@padel.com' },
    update: {},
    create: {
      name: 'Member User',
      email: 'member@padel.com',
      password,
      type: 'MEMBER',
      isAdmin: false,
    },
  });

  console.log('✓ Member user created:', member.email);

  // Create non-member user
  const nonMember = await prisma.user.upsert({
    where: { email: 'user@padel.com' },
    update: {},
    create: {
      name: 'Regular User',
      email: 'user@padel.com',
      password,
      type: 'NON_MEMBER',
      isAdmin: false,
    },
  });

  console.log('✓ Non-member user created:', nonMember.email);

  console.log('\nTest users created successfully!');
  console.log('You can login with:');
  console.log('  Admin: admin@padel.com / password123');
  console.log('  Member: member@padel.com / password123');
  console.log('  User: user@padel.com / password123');
}

main()
  .catch((e) => {
    console.error('Error creating test users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
