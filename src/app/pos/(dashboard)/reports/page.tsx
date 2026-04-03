import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReportsClient from "./ReportsClient";

export const dynamic = "force-dynamic";

export default async function ReportsPage({ searchParams }: { searchParams: { date?: string } }) {
  const session = await getSession();
  if (!session || !['OUTLET_ADMIN', 'OUTLET_MANAGER', 'SUPER_ADMIN'].includes(session.role as string)) {
      redirect("/pos/login");
  }

  const outletId = session.managedLocationId as string;
  const targetDateStr = searchParams.date || new Date().toISOString().split('T')[0];
  const startOfDay = new Date(targetDateStr);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDateStr);
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Fetch POS Transactions for the day
  const posTx = await prisma.posTransaction.findMany({
     where: { 
        outletId,
        paymentStatus: 'completed',
        createdAt: { gte: startOfDay, lte: endOfDay }
     },
     include: {
        booking: { include: { service: true, user: true } }
     },
     orderBy: { createdAt: 'desc' }
  });

  // 2. Fetch all bookings related to outlet for the day (to compare source pos vs organic)
  const bookings = await prisma.booking.findMany({
     where: {
        locationId: outletId,
        scheduledDate: { gte: startOfDay, lte: endOfDay }
     }
  });

  // Calculate Metrics
  const totalCash = posTx.filter(t => t.paymentMethod === 'CASH').reduce((a, t) => a + t.total, 0);
  const totalDigital = posTx.filter(t => t.paymentMethod === 'DIGITAL_GATEWAY' || t.paymentMethod === 'DIGITAL').reduce((a, t) => a + t.total, 0);
  const totalEDC = posTx.filter(t => t.paymentMethod === 'EDC').reduce((a, t) => a + t.total, 0);
  const totalTransfer = posTx.filter(t => t.paymentMethod === 'TRANSFER').reduce((a, t) => a + t.total, 0);
  const grandTotal = totalCash + totalDigital + totalEDC + totalTransfer;

  const totalWalkins = bookings.filter(b => b.source === 'pos').length;
  const totalOrganic = bookings.filter(b => b.source !== 'pos').length;

  const serializedTx = posTx.map(t => ({
     ...t,
     createdAt: t.createdAt.toISOString(),
     updatedAt: t.updatedAt.toISOString(),
     booking: t.booking ? {
        ...t.booking,
        scheduledDate: t.booking.scheduledDate.toISOString()
     } : null
  }));

  const metrics = {
     totalCash, totalDigital, totalEDC, totalTransfer, grandTotal, totalWalkins, totalOrganic
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
       <div className="p-8 pb-4 shrink-0 bg-white border-b border-gray-200 flex justify-between items-end">
          <div>
             <h1 className="text-2xl font-bold tracking-tight text-gray-900">End-of-Day Ledger</h1>
             <p className="text-sm text-gray-500">Financial reconciliation and operational metrics.</p>
          </div>
       </div>
       
       <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          <ReportsClient tx={serializedTx} metrics={metrics} currentDate={targetDateStr} />
       </div>
    </div>
  );
}
