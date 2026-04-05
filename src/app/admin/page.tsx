import { formatRate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Activity, DollarSign, Users, Target } from "lucide-react";
import { getTenant } from "@/lib/tenant";
import { formatRupiah } from "@/lib/format";

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_super_secret_flexology_string_for_local_dev");

export const dynamic = "force-dynamic";

export default async function ExecutiveDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('flex_session')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'admin' && payload.role !== 'superadmin' && payload.role !== 'SUPER_ADMIN' && payload.role !== 'GLOBAL_MANAGER') {
      redirect("/admin/schedule");
    }
  } catch {
    redirect('/login');
  }

  const session = await getSession();

  const tenant = await getTenant();

  // 1. Fetch Aggregated Bookings First
  const [bookings, allLocations] = await Promise.all([
    prisma.booking.findMany({
       where: { tenantId: tenant?.id },
       include: {
          location: true,
          service: true
       }
    }),
    prisma.location.findMany({ where: { tenantId: tenant?.id, isActive: true } })
  ]);

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === "CONFIRMED" || b.status === "COMPLETED").length;
  const voidedBookings = bookings.filter(b => b.status === "CANCELLED").length;

  // ONE query serves BOTH the KPI card and the leaderboard.
  // Using the exact transaction array filtered to valid business states
  const validBookings = bookings.filter(b => b.status === "COMPLETED" || b.status === "CONFIRMED");

  // KPI calculation — sum all totalPrice values.
  const totalRevenue = validBookings.reduce(
    (sum, b) => sum + (Number(b.totalPrice) || 0), 0
  );

  // Leaderboard calculation — group by outlet name.
  const outletMap = new Map<string, { sessions: number; revenue: number }>();
  
  // Pre-fill all active locations with 0
  allLocations.forEach(loc => {
    outletMap.set(loc.name, { sessions: 0, revenue: 0 });
  });

  validBookings.forEach(b => {
    const name = b.location?.name || 'Home Service';
    const current = outletMap.get(name) || { sessions: 0, revenue: 0 };
    current.sessions += 1;
    current.revenue += Number(b.totalPrice) || 0;
    outletMap.set(name, current);
  });

  const leaderboard = Array.from(outletMap.entries())
    .map(([name, data]) => ({ name, count: data.sessions, volume: data.revenue }))
    .sort((a, b) => b.volume - a.volume);

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
               <h3 className="text-3xl font-black text-gray-900">{formatRupiah(totalRevenue)}</h3>
             </div>
          </div>

          <div className="bg-white border text-sm border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Activity className="w-6 h-6" /></div>
             </div>
             <div>
               <p className="text-gray-500 font-bold mb-1">Total Lifetime Bookings</p>
               <h3 className="text-3xl font-black text-gray-900">{formatRate(totalBookings)}</h3>
             </div>
          </div>

          <div className="bg-white border text-sm border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Target className="w-6 h-6" /></div>
             </div>
             <div>
               <p className="text-gray-500 font-bold mb-1">Confirmed Sessions</p>
               <h3 className="text-3xl font-black text-gray-900">{formatRate(confirmedBookings)}</h3>
             </div>
          </div>

          <div className="bg-white border text-sm border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-red-50 rounded-xl text-red-600"><Users className="w-6 h-6" /></div>
             </div>
             <div>
               <p className="text-gray-500 font-bold mb-1">Voided / Cancelled</p>
               <h3 className="text-3xl font-black text-gray-900">{formatRate(voidedBookings)}</h3>
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
                     <td className="px-6 py-4 font-bold text-green-600">{formatRupiah(l.volume)}</td>
                  </tr>
               ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}
