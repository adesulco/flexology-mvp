import { getSession } from "@/lib/auth";
import { LandingPageUI } from '@/components/LandingPageUI';
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import dynamic from 'next/dynamic';

import { DynamicAppHomepageUI } from '@/components/DynamicAppHomepageUI';

import { DynamicMarketplaceHomepageUI } from '@/components/DynamicMarketplaceHomepageUI';

export const revalidate = 60;

export default async function Home() {
  const session = await getSession();
  const tenant = await getTenant();

  // ROUTING BIFURCATION: Master Platform vs Tenant App
  if (!tenant) {
      const [allBrands, allServices] = await Promise.all([
          prisma.tenant.findMany({ where: { isActive: true }, take: 10 }),
          prisma.service.findMany({ where: { isActive: true }, include: { tenant: true }, take: 10, orderBy: { price: 'desc' } })
      ]);
      
      return <DynamicMarketplaceHomepageUI brands={allBrands} services={allServices} />;
  }

  // If the user has a valid login cookie, show the Mobile App Booking Dashboard
  if (session && session.userId) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: {
         id: true,
         name: true,
         points: true,
         tier: true,
         currentStreak: true,
         longestStreak: true,
         badges: true
      }
    });
    
    if (user) {
       const lastBooking = await prisma.booking.findFirst({
          where: { userId: user.id, tenantId: tenant?.id, status: { in: ['COMPLETED', 'CONFIRMED'] } },
          orderBy: { scheduledDate: 'desc' },
          include: { service: true, location: true, flexologist: true }
       });
       
       return <DynamicAppHomepageUI user={user} lastBooking={lastBooking} tenant={tenant} />;
    }
  }

  // If they are not logged in, show the Preliminary Landing Page 
  const services = await prisma.service.findMany({
     where: { tenantId: tenant?.id, isActive: true },
     take: 6,
     orderBy: { price: 'asc' }
  });

  return <LandingPageUI services={services} tenant={tenant} />;
}
