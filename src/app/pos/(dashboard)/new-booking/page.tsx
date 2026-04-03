import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTenant } from "@/lib/tenant";
import NewBookingClient from "./NewBookingClient";

export default async function PosNewBookingPage() {
  const session = await getSession();
  if (!session || !['OUTLET_ADMIN', 'OUTLET_MANAGER', 'SUPER_ADMIN'].includes(session.role as string)) {
      redirect("/pos/login");
  }

  const tenant = await getTenant();
  const locationBound = session.role === "OUTLET_MANAGER" || session.role === "OUTLET_ADMIN" 
     ? session.managedLocationId : undefined;

  const [locations, services, flexologists] = await Promise.all([
    prisma.location.findMany({ 
       where: locationBound ? { id: locationBound, isActive: true, tenantId: tenant?.id } : { isActive: true, tenantId: tenant?.id },
       orderBy: { name: 'asc' }
    }),
    prisma.service.findMany({ 
       where: { isActive: true, tenantId: tenant?.id },
       orderBy: { price: 'asc' }
    }),
    prisma.flexologist.findMany({
       where: locationBound ? { locationId: locationBound, tenantId: tenant?.id } : { tenantId: tenant?.id },
       orderBy: { name: 'asc' } 
    })
  ]);

  return (
    <div className="flex-1 overflow-hidden bg-gray-50 flex flex-col">
       <div className="p-8 pb-4 shrink-0 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">New POS Booking</h1>
          <p className="text-sm text-gray-500">Log a walk-in, call-in, or desk reservation.</p>
       </div>
       <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
             <NewBookingClient 
                locations={locations as any} 
                services={services as any} 
                flexologists={flexologists as any} 
                sessionLocationId={session.managedLocationId}
             />
          </div>
       </div>
    </div>
  );
}
