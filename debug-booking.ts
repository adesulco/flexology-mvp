import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugBooking() {
  const user = await prisma.user.findFirst({ where: { phoneNumber: "081319009000" } })
  console.log("User:", user?.id, user?.name);

  if (user) {
     const bookings = await prisma.booking.findMany({ 
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 3
     });
     console.log("Recent Bookings:", JSON.stringify(bookings, null, 2))
  }

  const manager = await prisma.user.findFirst({ 
     where: { role: 'OUTLET_MANAGER', managedLocation: { name: { contains: 'Dash' } } },
     include: { managedLocation: true }
  })
  console.log("Dash Manager:", manager?.id, manager?.name, "Managing Location:", manager?.managedLocationId, manager?.managedLocation?.name)
}

debugBooking().finally(() => prisma.$disconnect())
