import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixManager() {
  const manager = await prisma.user.updateMany({
     where: { role: 'OUTLET_MANAGER', name: 'Dash Padel Manager' },
     data: { managedLocationId: 'loc-2' }
  })
  console.log("Updated rows:", manager.count);
}

fixManager().finally(() => prisma.$disconnect())
