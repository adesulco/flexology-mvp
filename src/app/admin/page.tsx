import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Activity, DollarSign, Users, Target } from "lucide-react";
import { getTenant } from "@/lib/tenant";
import { formatCurrency } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function ExecutiveDashboard() {
  const session = await getSession();
  if (!session || !['SUPER_ADMIN', 'GLOBAL_MANAGER'].includes(session.role as string)) {
    redirect("/admin/schedule");
  }

  const tenant = await getTenant();

  // 1. Fetch Aggregated Bookings First
  const bookings = await prisma.booking.findMany({
     where: { tenantId: tenant?.id },
     include: {
        location: true,
        service: true
     }
  });

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === "CONFIRMED" || b.status === "COMPLETED").length;
  const voidedBookings = bookings.filter(b => b.status === "CANCELLED").length;

  // 2. Calculate Gross Revenue from the EXACT same dataset as Leaderboard
  const totalRevenue = bookings
     .filter(b => b.status !== "CANCELLED")
     .reduce((acc: number, curr: any) => acc + (curr.totalPrice || 0), 0);

  // 3. Outlet Leaderboard Math
  const outletMap: Record<string, { name: string, volume: number, count: number }> = {};
  bookings.forEach(b => {
     if (b.status === "CANCELLED") return; // Don't count voided for leaderboard
     
     const id = b.location?.id || "HOME";
     const name = b.location?.name || "Home Service";

     if (!outletMap[id]) outletMap[id] = { name, volume: 0, count: 0 };
     outletMap[id].count += 1;
     // Note: we approximate revenue via service price if PaymentTransactions aren't strictly linked, 
     // or just use `b.totalPrice`. We'll use booking's totalPrice.
     outletMap[id].volume += b.totalPrice;
  });

  const leaderboard = Object.values(outletMap).sort((a, b) => b.volume - a.volume);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
       <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Executive Dashboard</h2>
          <p className="text-gray-500">Global platform intelligence and financial analytics.</p>
       </div>

       {/* Top KPI Row */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border text-sm border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-green-50 rounded-xl text-green-600"><DollarSign className="w-6 h-6" /></div>
             </div>
             <div>
               <p className="text-gray-500 font-bold mb-1">Gross Settled Revenue</p>
               <h3 className="text-3xl font-black text-gray-900">{formatCurrency(totalRevenue)}</h3>
             </div>
          </div>

          <div className="bg-white border text-sm border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Activity className="w-6 h-6" /></div>
             </div>
             <div>
               <p className="text-gray-500 font-bold mb-1">Total Lifetime Bookings</p>
               <h3 className="text-3xl font-black text-gray-900">{totalBookings.toLocaleString()}</h3>
             </div>
          </div>

          <div className="bg-white border text-sm border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Target className="w-6 h-6" /></div>
             </div>
             <div>
               <p className="text-gray-500 font-bold mb-1">Confirmed Sessions</p>
               <h3 className="text-3xl font-black text-gray-900">{confirmedBookings.toLocaleString()}</h3>
             </div>
          </div>

          <div className="bg-white border text-sm border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-red-50 rounded-xl text-red-600"><Users className="w-6 h-6" /></div>
             </div>
             <div>
               <p className="text-gray-500 font-bold mb-1">Voided / Cancelled</p>
               <h3 className="text-3xl font-black text-gray-900">{voidedBookings.toLocaleString()}</h3>
             </div>
          </div>
       </div>

       {/* Outlet Leaderboard */}
       <h3 className="text-xl font-bold tracking-tight text-gray-900 mt-12 mb-4">Outlet Performance Leaderboard</h3>
       <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
             <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
               <tr>
                 <th className="px-6 py-4">Rank</th>
                 <th className="px-6 py-4">Location</th>
                 <th className="px-6 py-4">Total Sessions</th>
                 <th className="px-6 py-4">Gross Intake Volume</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {leaderboard.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No operational data recorded yet.</td></tr>
               ) : leaderboard.map((l, index) => (
                  <tr key={l.name} className="hover:bg-gray-50 transition-colors">
                     <td className="px-6 py-4 font-black text-gray-400">#{index + 1}</td>
                     <td className="px-6 py-4 font-bold text-gray-900">{l.name}</td>
                     <td className="px-6 py-4 font-medium text-gray-600">{l.count}</td>
                     <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(l.volume)}</td>
                  </tr>
               ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}
