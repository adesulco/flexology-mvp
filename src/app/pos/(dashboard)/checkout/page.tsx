import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";
import { getTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function PosCheckoutPage() {
  const session = await getSession();
  if (!session || !['OUTLET_ADMIN', 'OUTLET_MANAGER', 'SUPER_ADMIN'].includes(session.role as string)) {
      redirect("/pos/login");
  }

  const tenant = await getTenant();
  const locationBound = session.role === "OUTLET_MANAGER" || session.role === "OUTLET_ADMIN" 
     ? session.managedLocationId : undefined;

  // Retrieve all unpaid bookings for this outlet today and past
  const unpaidBookings = await prisma.booking.findMany({
     where: {
        locationId: locationBound ? locationBound : undefined,
        isPaid: false,
        status: { notIn: ["CANCELLED"] },
        tenantId: tenant?.id
     },
     include: {
        user: true,
        service: true,
        flexologist: true
     },
     orderBy: {
        scheduledDate: 'asc'
     }
  });

  // Serialize to avoid Server -> Client boundary warnings
  const serializedBookings = unpaidBookings.map(b => ({
     ...b,
     totalPrice: Number(b.totalPrice),
     scheduledDate: b.scheduledDate.toISOString(),
     createdAt: b.createdAt.toISOString(),
     updatedAt: b.updatedAt.toISOString(),
     user: {
        ...b.user,
        createdAt: b.user.createdAt.toISOString(),
        updatedAt: b.user.updatedAt.toISOString()
     }
  }));

  const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
       <div className="p-8 pb-4 shrink-0 bg-white border-b border-gray-200">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Terminal Checkout</h1>
          <p className="text-sm text-gray-500">Settle unpaid bookings via Cash Drawer or Digital Gateway.</p>
       </div>
       
       <div className="flex-1 overflow-y-auto p-8">
          <CheckoutClient 
             unpaidBookings={serializedBookings as any} 
             sessionData={{ id: session.userId, locationId: session.managedLocationId }}
             midtransClientKey={midtransClientKey || ""}
          />
       </div>
    </div>
  );
}
