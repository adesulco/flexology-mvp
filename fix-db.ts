import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const locations = await prisma.location.findMany();
  const pondok = locations.find(l => l.name.toLowerCase().includes('pondok'));
  console.log("Pondok Indah ID:", pondok?.id);
  
  await prisma.flexologist.updateMany({
    where: { name: 'indra' },
    data: { name: 'Indra', locationId: pondok?.id }
  });
  
  await prisma.flexologist.updateMany({
    where: { name: 'Widi' },
    data: { locationId: pondok?.id }
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
