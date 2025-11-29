import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function main() {
  console.log('🌱 Generant sol·licituds per la setmana de l\'1 de desembre de 2025...\n');

  // Get all users (excluding admin)
  const users = await prisma.user.findMany({
    where: {
      isAdmin: false,
    },
  });

  if (users.length === 0) {
    console.error('❌ No hi ha usuaris al sistema. Executa primer el seed principal.');
    return;
  }

  console.log(`👥 Trobats ${users.length} usuaris`);

  // Get all time slots
  const timeSlots = await prisma.timeSlot.findMany();

  if (timeSlots.length === 0) {
    console.error('❌ No hi ha franges horàries al sistema. Executa primer el seed principal.');
    return;
  }

  console.log(`⏰ Trobades ${timeSlots.length} franges horàries`);

  // Define the week: December 1-7, 2025
  const startDate = new Date('2025-12-01');
  const dates = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }

  console.log(`📅 Generant sol·licituds per ${dates.length} dies\n`);

  let totalRequests = 0;

  for (const date of dates) {
    const dayOfWeek = date.getDay();
    
    // Get time slots for this day of week
    const daySlotsData = timeSlots.filter(slot => slot.dayOfWeek === dayOfWeek);
    
    if (daySlotsData.length === 0) {
      console.log(`⚠️  No hi ha franges horàries per ${date.toISOString().split('T')[0]} (dia ${dayOfWeek})`);
      continue;
    }

    console.log(`📆 ${date.toISOString().split('T')[0]} - Generant mínim 30 sol·licituds...`);

    // Generate at least 30 requests for this day, distributed across time slots
    const requestsPerDay = getRandomInt(30, 45);
    let dayRequests = 0;

    for (let i = 0; i < requestsPerDay; i++) {
      const user = getRandomElement(users);
      const slot = getRandomElement(daySlotsData);
      const numberOfPlayers = getRandomInt(2, 4);

      // Select random participants (including the user)
      const availableParticipants = users.filter(u => u.id !== user.id);
      const participantsCount = numberOfPlayers - 1; // -1 because we already have the main user
      const selectedParticipants: string[] = [user.id];

      for (let j = 0; j < participantsCount && j < availableParticipants.length; j++) {
        const participant = availableParticipants[getRandomInt(0, availableParticipants.length - 1)];
        if (!selectedParticipants.includes(participant.id)) {
          selectedParticipants.push(participant.id);
        }
      }

      try {
        // Check if this user already has a request for this date/time
        const existing = await prisma.bookingRequest.findFirst({
          where: {
            userId: user.id,
            date: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999)),
            },
            timeSlot: slot.startTime,
            status: 'REQUESTED',
          },
        });

        if (existing) {
          continue; // Skip if user already has a request for this slot
        }

        await prisma.bookingRequest.create({
          data: {
            userId: user.id,
            date: new Date(date.setHours(0, 0, 0, 0)),
            timeSlot: slot.startTime,
            numberOfPlayers,
            status: 'REQUESTED',
            participants: {
              create: selectedParticipants.map(participantId => ({
                userId: participantId,
              })),
            },
          },
        });

        dayRequests++;
        totalRequests++;
      } catch (error) {
        // Skip duplicates or errors
        continue;
      }
    }

    console.log(`  ✓ ${dayRequests} sol·licituds creades`);
  }

  console.log(`\n✅ Total: ${totalRequests} sol·licituds creades per la setmana`);
  console.log('\n📊 Resum per dia:');

  for (const date of dates) {
    const count = await prisma.bookingRequest.count({
      where: {
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        status: 'REQUESTED',
      },
    });

    const dayName = date.toLocaleDateString('ca-ES', { weekday: 'long' });
    console.log(`  ${date.toISOString().split('T')[0]} (${dayName}): ${count} sol·licituds`);
  }

  console.log('\n🎉 Dades generades correctament!');
  console.log('\n💡 Ara pots executar sortejos per aquestes dates des de l\'admin-app');
}

main()
  .catch((e) => {
    console.error('❌ Error generant dades:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
