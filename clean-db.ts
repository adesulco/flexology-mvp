import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanData() {
  const staff = await prisma.flexologist.findMany();
  for (const s of staff) {
     const up = {
        shiftStart: s.shiftStart.replace('.', ':'),
        shiftEnd: s.shiftEnd.replace('.', ':'),
        bio: s.bio?.replace('sports masasge', 'sports massage')
     };
     await prisma.flexologist.update({ where: { id: s.id }, data: up });
  }

  const locs = await prisma.location.findMany();
  for (const l of locs) {
     await prisma.location.update({ 
        where: { id: l.id }, 
        data: {
          openTime: l.openTime.replace('.', ':'),
          closeTime: l.closeTime.replace('.', ':')
        } 
     });
  }
  
  console.log("DB cleaned!");
}

cleanData();
