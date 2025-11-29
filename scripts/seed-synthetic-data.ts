import { PrismaClient, TimeSlotType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Noms catalans per generar usuaris
const firstNames = [
  'Marc', 'Anna', 'Jordi', 'Laura', 'David', 'Maria', 'Pau', 'Marta',
  'Albert', 'Clara', 'Roger', 'Núria', 'Sergi', 'Carla', 'Joan', 'Sara',
  'Oriol', 'Laia', 'Arnau', 'Emma', 'Pol', 'Julia', 'Gerard', 'Berta'
];

const lastNames = [
  'Garcia', 'Martínez', 'López', 'Sánchez', 'Pérez', 'Fernández',
  'González', 'Rodríguez', 'Romero', 'Vila', 'Puig', 'Serra',
  'Roca', 'Soler', 'Vidal', 'Pujol', 'Ferrer', 'Camps'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(daysFromNow: number, daysRange: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow + getRandomInt(0, daysRange));
  date.setHours(0, 0, 0, 0);
  return date;
}

async function main() {
  console.log('🌱 Iniciant generació de dades sintètiques...\n');

  // 1. Crear usuaris
  console.log('👥 Creant usuaris...');
  const password = await bcrypt.hash('password123', 10);
  const users = [];

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@padel.com' },
    update: {},
    create: {
      name: 'Admin Pàdel',
      email: 'admin@padel.com',
      password,
      type: 'MEMBER',
      isAdmin: true,
    },
  });
  users.push(admin);
  console.log(`  ✓ Admin: ${admin.email}`);

  // Crear 15 socis
  for (let i = 1; i <= 15; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const user = await prisma.user.upsert({
      where: { email: `soci${i}@padel.com` },
      update: {},
      create: {
        name: `${firstName} ${lastName}`,
        email: `soci${i}@padel.com`,
        password,
        type: 'MEMBER',
        isAdmin: false,
      },
    });
    users.push(user);
  }
  console.log(`  ✓ ${15} socis creats`);

  // Crear 10 no socis
  for (let i = 1; i <= 10; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const user = await prisma.user.upsert({
      where: { email: `user${i}@padel.com` },
      update: {},
      create: {
        name: `${firstName} ${lastName}`,
        email: `user${i}@padel.com`,
        password,
        type: 'NON_MEMBER',
        isAdmin: false,
      },
    });
    users.push(user);
  }
  console.log(`  ✓ ${10} no socis creats`);

  // 2. Crear pistes
  console.log('\n🎾 Creant pistes...');
  const courts = [];
  const courtNames = [
    { name: 'Pista 1', description: 'Pista exterior amb il·luminació LED' },
    { name: 'Pista 2', description: 'Pista exterior coberta' },
    { name: 'Pista 3', description: 'Pista interior climatitzada' },
    { name: 'Pista 4', description: 'Pista exterior panoràmica' },
  ];

  for (const courtData of courtNames) {
    // Check if court already exists by name
    const existingCourt = await prisma.court.findFirst({
      where: { name: courtData.name },
    });

    const court = existingCourt || await prisma.court.create({
      data: {
        name: courtData.name,
        description: courtData.description,
        isActive: true,
      },
    });
    courts.push(court);
    console.log(`  ✓ ${court.name}`);
  }

  // 3. Crear franges horàries
  console.log('\n⏰ Creant franges horàries...');
  const timeSlots = [];

  // Franges horàries de dilluns a divendres
  const weekdaySlots = [
    { start: '08:00', end: '09:30', type: 'OFF_PEAK' },
    { start: '09:30', end: '11:00', type: 'OFF_PEAK' },
    { start: '11:00', end: '12:30', type: 'OFF_PEAK' },
    { start: '12:30', end: '14:00', type: 'OFF_PEAK' },
    { start: '14:00', end: '15:30', type: 'OFF_PEAK' },
    { start: '15:30', end: '17:00', type: 'OFF_PEAK' },
    { start: '17:00', end: '18:30', type: 'PEAK' },
    { start: '18:30', end: '20:00', type: 'PEAK' },
    { start: '20:00', end: '21:30', type: 'PEAK' },
    { start: '21:30', end: '23:00', type: 'PEAK' },
  ];

  // Franges horàries de cap de setmana
  const weekendSlots = [
    { start: '08:00', end: '09:30', type: 'PEAK' },
    { start: '09:30', end: '11:00', type: 'PEAK' },
    { start: '11:00', end: '12:30', type: 'PEAK' },
    { start: '12:30', end: '14:00', type: 'PEAK' },
    { start: '14:00', end: '15:30', type: 'OFF_PEAK' },
    { start: '15:30', end: '17:00', type: 'OFF_PEAK' },
    { start: '17:00', end: '18:30', type: 'PEAK' },
    { start: '18:30', end: '20:00', type: 'PEAK' },
    { start: '20:00', end: '21:30', type: 'PEAK' },
    { start: '21:30', end: '23:00', type: 'OFF_PEAK' },
  ];

  // Crear franges per cada dia de la setmana
  for (let day = 1; day <= 5; day++) {
    for (const slot of weekdaySlots) {
      const timeSlot = await prisma.timeSlot.create({
        data: {
          dayOfWeek: day,
          startTime: slot.start,
          endTime: slot.end,
          duration: 90,
          type: slot.type as TimeSlotType,
        },
      });
      timeSlots.push(timeSlot);
    }
  }

  // Cap de setmana (dissabte i diumenge)
  for (let day = 0; day <= 6; day += 6) {
    for (const slot of weekendSlots) {
      const timeSlot = await prisma.timeSlot.create({
        data: {
          dayOfWeek: day,
          startTime: slot.start,
          endTime: slot.end,
          duration: 90,
          type: slot.type as TimeSlotType,
        },
      });
      timeSlots.push(timeSlot);
    }
  }
  console.log(`  ✓ ${timeSlots.length} franges horàries creades`);

  // 4. Crear comptadors d'ús per usuaris
  console.log('\n📊 Creant comptadors d\'ús...');
  for (const user of users) {
    if (!user.isAdmin) {
      await prisma.usageCounter.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          count: getRandomInt(0, 5),
          lastResetDate: new Date(),
        },
      });
    }
  }
  console.log(`  ✓ Comptadors creats per ${users.length - 1} usuaris`);

  // 5. Crear reserves passades (completades)
  console.log('\n📅 Creant reserves passades...');
  const pastBookingsCount = 20;
  for (let i = 0; i < pastBookingsCount; i++) {
    const user = getRandomElement(users.filter(u => !u.isAdmin));
    const court = getRandomElement(courts);
    const slot = getRandomElement(weekdaySlots);
    const date = getRandomDate(-30, 20); // Últims 30 dies
    const numberOfPlayers = getRandomInt(2, 4);

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        courtId: court.id,
        date,
        timeSlot: slot.start,
        numberOfPlayers,
        status: 'COMPLETED',
        completedAt: new Date(date.getTime() + 90 * 60 * 1000),
      },
    });

    // Afegir participants
    const otherUsers = users.filter(u => u.id !== user.id && !u.isAdmin);
    const participantsCount = numberOfPlayers - 1;
    const selectedParticipants: string[] = [];
    for (let j = 0; j < participantsCount && j < otherUsers.length; j++) {
      const participant = otherUsers[getRandomInt(0, otherUsers.length - 1)];
      if (!selectedParticipants.includes(participant.id)) {
        selectedParticipants.push(participant.id);
        await prisma.bookingParticipant.create({
          data: {
            bookingId: booking.id,
            userId: participant.id,
          },
        });
      }
    }
  }
  console.log(`  ✓ ${pastBookingsCount} reserves passades creades`);

  // 6. Crear reserves futures (confirmades)
  console.log('\n📅 Creant reserves futures...');
  const futureBookingsCount = 15;
  for (let i = 0; i < futureBookingsCount; i++) {
    const user = getRandomElement(users.filter(u => !u.isAdmin));
    const court = getRandomElement(courts);
    const slot = getRandomElement([...weekdaySlots, ...weekendSlots]);
    const date = getRandomDate(1, 14); // Pròxims 14 dies
    const numberOfPlayers = getRandomInt(2, 4);

    try {
      const booking = await prisma.booking.create({
        data: {
          userId: user.id,
          courtId: court.id,
          date,
          timeSlot: slot.start,
          numberOfPlayers,
          status: 'CONFIRMED',
        },
      });

      // Afegir participants
      const otherUsers = users.filter(u => u.id !== user.id && !u.isAdmin);
      const participantsCount = numberOfPlayers - 1;
      const selectedParticipants: string[] = [];
      for (let j = 0; j < participantsCount && j < otherUsers.length; j++) {
        const participant = otherUsers[getRandomInt(0, otherUsers.length - 1)];
        if (!selectedParticipants.includes(participant.id)) {
          selectedParticipants.push(participant.id);
          await prisma.bookingParticipant.create({
            data: {
              bookingId: booking.id,
              userId: participant.id,
            },
          });
        }
      }
    } catch (error) {
      // Ignorar errors de duplicats
    }
  }
  console.log(`  ✓ Reserves futures creades`);

  // 7. Crear sol·licituds pendents
  console.log('\n📝 Creant sol·licituds pendents...');
  const requestsCount = 10;
  for (let i = 0; i < requestsCount; i++) {
    const user = getRandomElement(users.filter(u => !u.isAdmin));
    const slot = getRandomElement([...weekdaySlots, ...weekendSlots]);
    const date = getRandomDate(15, 7); // Entre 15 i 22 dies
    const numberOfPlayers = getRandomInt(2, 4);

    const request = await prisma.bookingRequest.create({
      data: {
        userId: user.id,
        date,
        timeSlot: slot.start,
        numberOfPlayers,
        status: 'REQUESTED',
        weight: Math.random() * 10,
      },
    });

    // Afegir participants
    const otherUsers = users.filter(u => u.id !== user.id && !u.isAdmin);
    const participantsCount = numberOfPlayers - 1;
    const selectedParticipants: string[] = [];
    for (let j = 0; j < participantsCount && j < otherUsers.length; j++) {
      const participant = otherUsers[getRandomInt(0, otherUsers.length - 1)];
      if (!selectedParticipants.includes(participant.id)) {
        selectedParticipants.push(participant.id);
        await prisma.requestParticipant.create({
          data: {
            requestId: request.id,
            userId: participant.id,
          },
        });
      }
    }
  }
  console.log(`  ✓ ${requestsCount} sol·licituds pendents creades`);

  // Resum final
  console.log('\n✅ Dades sintètiques generades correctament!');
  console.log('\n📊 Resum:');
  console.log(`  • ${users.length} usuaris (1 admin, 15 socis, 10 no socis)`);
  console.log(`  • ${courts.length} pistes`);
  console.log(`  • ${timeSlots.length} franges horàries`);
  console.log(`  • ${pastBookingsCount} reserves passades`);
  console.log(`  • Reserves futures confirmades`);
  console.log(`  • ${requestsCount} sol·licituds pendents`);
  console.log('\n🔑 Credencials:');
  console.log('  Admin: admin@padel.com / password123');
  console.log('  Socis: soci1@padel.com ... soci15@padel.com / password123');
  console.log('  Usuaris: user1@padel.com ... user10@padel.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error generant dades sintètiques:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
