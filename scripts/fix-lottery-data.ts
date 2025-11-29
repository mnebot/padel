import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Arreglant dades del sorteig...\n');

  // Find all booking requests that have an associated booking
  const bookingsWithRequests = await prisma.booking.findMany({
    where: {
      requestId: {
        not: null,
      },
    },
    select: {
      requestId: true,
    },
  });

  const requestIdsWithBookings = bookingsWithRequests
    .map(b => b.requestId)
    .filter((id): id is string => id !== null);

  console.log(`📊 Trobades ${requestIdsWithBookings.length} sol·licituds amb reserves assignades`);

  if (requestIdsWithBookings.length === 0) {
    console.log('✅ No hi ha res a arreglar!');
    return;
  }

  // Update the status of these requests to CONFIRMED
  const result = await prisma.bookingRequest.updateMany({
    where: {
      id: {
        in: requestIdsWithBookings,
      },
      status: 'REQUESTED',
    },
    data: {
      status: 'CONFIRMED',
    },
  });

  console.log(`✅ Actualitzades ${result.count} sol·licituds a estat CONFIRMED`);
  console.log('\n🎉 Dades arreglades correctament!');
}

main()
  .catch((e) => {
    console.error('❌ Error arreglant dades:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
