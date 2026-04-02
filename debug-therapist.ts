import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugTherapist() {
  const allTherapists = await prisma.flexologist.findMany({ include: { location: true } })
  console.log("All Therapists:", JSON.stringify(allTherapists, null, 2))
}

debugTherapist().finally(() => prisma.$disconnect())
