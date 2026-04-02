const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Tenant Data Migration...");

  // 1. Ensure the primary "Flex" Tenant exists
  const flexTenant = await prisma.tenant.upsert({
    where: { slug: 'flex' },
    update: {},
    create: {
      slug: 'flex',
      name: 'Flexology',
      primaryColor: '#0E7070',
      logoUrl: '/logo.png', // Default
    }
  });

  console.log(`Flex Tenant Verified with ID: ${flexTenant.id}`);

  // 2. Backfill Services
  const updatedServices = await prisma.service.updateMany({
    where: { tenantId: null },
    data: { tenantId: flexTenant.id }
  });
  console.log(`Linked ${updatedServices.count} Services to Flex`);

  // 3. Backfill Locations
  const updatedLocations = await prisma.location.updateMany({
    where: { tenantId: null },
    data: { tenantId: flexTenant.id }
  });
  console.log(`Linked ${updatedLocations.count} Locations to Flex`);

  // 4. Backfill Flexologists
  const updatedStaff = await prisma.flexologist.updateMany({
    where: { tenantId: null },
    data: { tenantId: flexTenant.id }
  });
  console.log(`Linked ${updatedStaff.count} Staff to Flex`);

  // 5. Backfill Bookings
  const updatedBookings = await prisma.booking.updateMany({
    where: { tenantId: null },
    data: { tenantId: flexTenant.id }
  });
  console.log(`Linked ${updatedBookings.count} Bookings to Flex`);

  // 6. Backfill Transactions
  const updatedLedger = await prisma.paymentTransaction.updateMany({
    where: { tenantId: null },
    data: { tenantId: flexTenant.id }
  });
  console.log(`Linked ${updatedLedger.count} Transactions to Flex`);

  console.log("Migration Complete! 🎉");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
