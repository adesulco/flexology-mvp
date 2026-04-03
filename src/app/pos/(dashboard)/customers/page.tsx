import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CustomerCRMClient from "./CustomerCRMClient";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const session = await getSession();
  if (!session || !['OUTLET_ADMIN', 'OUTLET_MANAGER', 'SUPER_ADMIN'].includes(session.role as string)) {
      redirect("/pos/login");
  }

  // Get basically all clients, ordering by latest booking or created date
  // For a scale app need pagination, but this is an MVP
  const customers = await prisma.user.findMany({
     where: { role: 'CLIENT' },
     include: {
        bookings: {
           orderBy: { scheduledDate: 'desc' },
           take: 5,
           include: { service: true }
        },
        CustomerNote: {
           orderBy: { createdAt: 'desc' }
        }
     },
     orderBy: { createdAt: 'desc' }
  });

  const staffDict = await prisma.user.findMany({
     where: { role: { in: ['OUTLET_ADMIN', 'OUTLET_MANAGER', 'SUPER_ADMIN'] } },
     select: { id: true, name: true }
  }).then(res => res.reduce((acc, obj) => ({ ...acc, [obj.id]: obj.name }), {} as Record<string, string>));

  const serializedCustomers = customers.map(c => ({
     ...c,
     createdAt: c.createdAt.toISOString(),
     CustomerNote: c.CustomerNote?.map(n => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
        authorName: staffDict[n.authorId] || 'Unknown Admin'
     })),
     lifteTimeValue: c.bookings.filter(b => b.status === "COMPLETED" || b.isPaid).reduce((acc, b) => acc + b.totalPrice, 0),
     bookings: c.bookings.map(b => ({
        ...b,
        scheduledDate: b.scheduledDate.toISOString()
     }))
  }));

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
       <div className="p-8 pb-4 shrink-0 bg-white border-b border-gray-200">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">CRM & Intelligence</h1>
          <p className="text-sm text-gray-500">Database of all Flexology clients and lifetime history.</p>
       </div>
       
       <div className="flex-1 overflow-y-auto p-8">
          <CustomerCRMClient customers={serializedCustomers} />
       </div>
    </div>
  );
}
