import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAndCleanLocations() {
  const locations = await prisma.location.findMany()
  console.log("ALL LOCATIONS:")
  console.log(JSON.stringify(locations, null, 2))

  const dashPadelWrong = locations.find(l => l.name.toLowerCase() === 'dash padel')
  
  if (dashPadelWrong) {
     console.log(`Found duplicate 'dash padel' (ID: ${dashPadelWrong.id}). Deleting...`);
     await prisma.location.delete({ where: { id: dashPadelWrong.id } })
     console.log("Deleted.");
  } else {
     console.log("No duplicate 'dash padel' found exactly with that name.");
  }
}

checkAndCleanLocations().finally(() => prisma.$disconnect())
