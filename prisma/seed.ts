import { PrismaClient } from '@prisma/client'
import { MOCK_LOCATIONS, MOCK_SERVICES, MOCK_FLEXOLOGISTS } from '../src/lib/mockData'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Seed Locations
  for (const loc of MOCK_LOCATIONS) {
    await prisma.location.upsert({
      where: { id: loc.id },
      update: {},
      create: {
        id: loc.id,
        name: loc.name,
        address: loc.address,
        mapLink: loc.mapLink,
      },
    })
  }

  // Seed Services
  for (const srv of MOCK_SERVICES) {
    await prisma.service.upsert({
      where: { id: srv.id },
      update: {},
      create: {
        id: srv.id,
        name: srv.name,
        description: srv.description,
        duration: srv.duration,
        price: srv.price,
      },
    })
  }

  // Seed Flexologists
  for (const flex of MOCK_FLEXOLOGISTS) {
    await prisma.flexologist.upsert({
      where: { id: flex.id },
      update: {},
      create: {
        id: flex.id,
        name: flex.name,
        rating: flex.rating,
        bio: flex.specialty.join(", "),
        imageUrl: flex.imageUrl,
      },
    })
  }

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
