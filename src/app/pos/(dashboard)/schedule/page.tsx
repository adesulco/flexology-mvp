import { prisma } from "@/lib/prisma";
import OperationsTimeline from "@/app/admin/components/OperationsTimeline";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function PosScheduleView() {
  const session = await getSession();
  if (!session || !['SUPER_ADMIN', 'OUTLET_MANAGER', 'OUTLET_ADMIN'].includes(session.role as string)) {
    redirect("/pos/login");
  }

  const isRestricted = session.role === 'OUTLET_MANAGER' || session.role === 'OUTLET_ADMIN';
  const locationBound = isRestricted ? session.managedLocationId : undefined;

  const tenant = await getTenant();

  // Fetch Core Data Pipeline
  const [rawBookings, flexologists, locations] = await Promise.all([
     prisma.booking.findMany({
        where: locationBound ? { locationId: locationBound as string, tenantId: tenant?.id } : { tenantId: tenant?.id },
        include: {
           user: true,
           service: true,
           location: true,
           flexologist: true
        },
        orderBy: {
           scheduledDate: 'asc'
        }
     }),
     prisma.flexologist.findMany({
        where: locationBound ? { locationId: locationBound as string, tenantId: tenant?.id } : { tenantId: tenant?.id },
        orderBy: { name: 'asc' }
     }),
     prisma.location.findMany({
        where: locationBound ? { id: locationBound as string, isActive: true, tenantId: tenant?.id } : { isActive: true, tenantId: tenant?.id },
        orderBy: { name: 'asc' }
     })
  ]);

  // Serialize strict Date objects into generic ISO Strings before sending to the Client component
  // to avoid Next.js Server->Client strict warnings.
  const serializedBookings = rawBookings.map(b => ({
     ...b,
     totalPrice: Number(b.totalPrice),
     scheduledDate: b.scheduledDate.toISOString(),
     createdAt: b.createdAt.toISOString(),
     updatedAt: b.updatedAt.toISOString(),
     user: {
        ...b.user,
        createdAt: b.user.createdAt.toISOString(),
        updatedAt: b.user.updatedAt.toISOString(),
     }
  }));

  return (
    <div className="flex-1 overflow-hidden bg-gray-50 flex flex-col">
       <div className="p-8 pb-4 shrink-0 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Schedule Operations</h1>
          <p className="text-sm text-gray-500">Manage bookings, view staff availability, and update status in real-time.</p>
       </div>
       <div className="flex-1 overflow-y-auto">
          <OperationsTimeline 
            initialBookings={serializedBookings as any}
            flexologists={flexologists as any}
            locations={locations as any}
            session={{
              role: session.role,
              managedLocationId: session.managedLocationId
            }}
          />
       </div>
    </div>
  );
}
