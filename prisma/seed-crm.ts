import { PrismaClient, TierRank } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CRM Configuration & Tier Engine...");

  // 1. Seed Registration Bonus
  const regBonus = await prisma.systemSetting.upsert({
    where: { key: 'REGISTRATION_BONUS' },
    update: {},
    create: {
       key: 'REGISTRATION_BONUS',
       value: '10000'
    }
  });
  console.log("Registration Bonus set to: 10000");

  // 2. Seed FLEX Tier
  await prisma.membershipTier.upsert({
     where: { rank: 'FLEX' },
     update: {},
     create: {
        rank: 'FLEX',
        name: 'FLEX',
        price: 0,
        discountPercent: 0,
        pointMultiplier: 1.0,
        benefits: ["Standard Booking Access", "Standard 1x FLX Point Earn Rate"]
     }
  });

  // 3. Seed FLEX PLUS Tier
  await prisma.membershipTier.upsert({
     where: { rank: 'FLEX_PLUS' },
     update: {},
     create: {
        rank: 'FLEX_PLUS',
        name: 'FLEX PLUS',
        price: 399000,
        discountPercent: 10,
        pointMultiplier: 1.5,
        benefits: ["10% OFF all bookings forever", "1.5x Multiplier (150 PTS per 100k)", "24hr Priority Therapist Matching"]
     }
  });

  // 4. Seed VIP Tier
  await prisma.membershipTier.upsert({
     where: { rank: 'PREMIUM' },
     update: {},
     create: {
        rank: 'PREMIUM',
        name: 'FLEX VIP',
        price: 699000,
        discountPercent: 15,
        pointMultiplier: 2.0,
        benefits: ["15% OFF all bookings forever", "2.0x Multiplier (200 PTS per 100k)", "Private Dedicated Flexologist Line"]
     }
  });

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
