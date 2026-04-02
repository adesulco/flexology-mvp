import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugManagers() {
  const managers = await prisma.user.findMany({ 
     where: { role: 'OUTLET_MANAGER' },
  })
  console.log("ALL MANAGERS:", JSON.stringify(managers, null, 2))
}

debugManagers().finally(() => prisma.$disconnect())
