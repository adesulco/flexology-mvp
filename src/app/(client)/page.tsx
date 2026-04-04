import { getSession } from "@/lib/auth";
import { LandingPageUI } from '@/components/LandingPageUI';
import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import dynamic from 'next/dynamic';

const AppHomepageUI = dynamic(() => import('@/components/AppHomepageUI').then(mod => mod.AppHomepageUI), {
  ssr: false,
  loading: () => <div className="min-h-[100dvh] w-full flex items-center justify-center animate-pulse bg-gray-50"><div className="w-12 h-12 rounded-full bg-gray-200" /></div>
});

const MarketplaceHomepageUI = dynamic(() => import('@/components/MarketplaceHomepageUI').then(mod => mod.MarketplaceHomepageUI), {
  ssr: false,
  loading: () => <div className="min-h-screen w-full flex items-center justify-center animate-pulse bg-gray-50"><div className="w-12 h-12 rounded-full bg-gray-200" /></div>
});

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
      
      return <MarketplaceHomepageUI brands={allBrands} services={allServices} />;
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
       
       return <AppHomepageUI user={user} lastBooking={lastBooking} tenant={tenant} />;
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
