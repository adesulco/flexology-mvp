import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTenant } from "@/lib/tenant";
import WalkInClient from "./WalkInClient";

export const dynamic = "force-dynamic";

export default async function WalkInQueuePage() {
  const session = await getSession();
  if (!session || !['OUTLET_ADMIN', 'OUTLET_MANAGER', 'SUPER_ADMIN'].includes(session.role as string)) {
      redirect("/pos/login");
  }

  const tenant = await getTenant();
  const outletId = session.managedLocationId as string;

  const [waitlist, flexologists, services] = await Promise.all([
     prisma.walkInQueue.findMany({
        where: { outletId, status: "waiting" },
        orderBy: { checkInTime: 'asc' }
     }),
     prisma.flexologist.findMany({
        where: { locationId: outletId, tenantId: tenant?.id, isOnDuty: true },
        orderBy: { name: 'asc' }
     }),
     prisma.service.findMany({
        where: { isActive: true, tenantId: tenant?.id },
        orderBy: { price: 'asc' }
     })
  ]);

  const serializedWaitlist = waitlist.map(w => ({
     ...w,
     checkInTime: w.checkInTime.toISOString(),
     estimatedTime: w.estimatedTime?.toISOString() || null,
     createdAt: w.createdAt.toISOString(),
     updatedAt: w.updatedAt.toISOString(),
  }));

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
       <div className="p-8 pb-4 shrink-0 bg-white border-b border-gray-200">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Walk-In Queue</h1>
          <p className="text-sm text-gray-500">Manage the waitlist and deploy active resources.</p>
       </div>
       
       <div className="flex-1 overflow-y-auto p-8">
          <WalkInClient 
             waitlist={serializedWaitlist}
             flexologists={flexologists as any}
             services={services as any}
          />
       </div>
    </div>
  );
}
