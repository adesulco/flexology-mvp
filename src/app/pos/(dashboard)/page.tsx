import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CalendarClock, TrendingUp, Users, UserCheck, CalendarPlus, UserPlus, Search } from "lucide-react";
import Link from "next/link";
import { startOfDay, endOfDay } from "date-fns";

export default async function PosDashboard() {
  const session = await getSession();
  if (!session || (session.role !== "OUTLET_ADMIN" && session.role !== "OUTLET_MANAGER" && session.role !== "SUPER_ADMIN")) {
      redirect("/pos/login");
  }

  // Filter scoped to Outlet Manager / Admin, bypass for Super Admin
  const targetOutletId = session.role === "SUPER_ADMIN" ? undefined : (session.managedLocationId as string | undefined);
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  // Queries
  const todaysBookings = await prisma.booking.count({ 
     where: { 
        scheduledDate: { gte: todayStart, lte: todayEnd },
        locationId: targetOutletId,
        status: { not: "CANCELLED" }
     }
  });

  const staffOnDuty = await prisma.flexologist.count({
     where: { 
        locationId: targetOutletId,
        isOnDuty: true 
     }
  });

  const walkInQueue = await prisma.walkInQueue.count({
     where: {
        outletId: targetOutletId || undefined,
        status: "waiting"
     }
  });
  
  // Aggregate today's revenue (posTransactions)
  const posSales = await prisma.posTransaction.aggregate({
     where: {
         outletId: targetOutletId || undefined,
         createdAt: { gte: todayStart, lte: todayEnd },
         paymentStatus: "completed"
     },
     _sum: { total: true }
  });
  const revenueToday = posSales._sum.total || 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
       <div className="p-8 pb-4 shrink-0">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Today's Operations</h1>
          <p className="text-sm text-gray-500">Live feed for currently active POS terminal operations.</p>
       </div>

       <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-8">
          
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-start justify-between shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Today's Load</p>
                  <p className="text-3xl font-black tracking-tighter text-gray-900">{todaysBookings}</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                   <CalendarClock className="w-5 h-5" />
                </div>
             </div>

             <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-start justify-between shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Collected Revenue</p>
                  <p className="text-2xl font-black tracking-tighter text-gray-900 pt-1">
                     Rp {revenueToday.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                   <TrendingUp className="w-5 h-5" />
                </div>
             </div>

             <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-start justify-between shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Queue Size</p>
                  <p className="text-3xl font-black tracking-tighter text-gray-900">{walkInQueue}</p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                   <Users className="w-5 h-5" />
                </div>
             </div>

             <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-start justify-between shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Staff Matrix</p>
                  <p className="text-3xl font-black tracking-tighter text-gray-900">{staffOnDuty}</p>
                </div>
                <div className="p-3 bg-flx-teal/10 text-flx-teal rounded-xl">
                   <UserCheck className="w-5 h-5" />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* Left Column: Quick Actions & Timeline */}
             <div className="lg:col-span-2 space-y-8">
                
                {/* Rapid Action Bar */}
                <div className="grid grid-cols-3 gap-4">
                  <Link href="/pos/new-booking" className="flex flex-col items-center justify-center gap-3 bg-black text-white p-6 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10">
                     <CalendarPlus className="w-8 h-8 text-flx-teal" />
                     <span className="font-bold tracking-wide">New Booking</span>
                  </Link>
                  <Link href="/pos/walk-ins" className="flex flex-col items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 p-6 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
                     <UserPlus className="w-8 h-8 text-flx-teal" />
                     <span className="font-bold tracking-wide">Add Walk-In</span>
                  </Link>
                  <Link href="/pos/customers" className="flex flex-col items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 p-6 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
                     <Search className="w-8 h-8 text-gray-400" />
                     <span className="font-bold tracking-wide">Customer Lookup</span>
                  </Link>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                   <h3 className="font-bold text-gray-900 mb-6">Upcoming Execution Timeline</h3>
                   <div className="flex flex-col items-center justify-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                      <p className="text-sm font-bold text-gray-500">Timeline engine arriving in Sprint 2</p>
                      <p className="text-xs text-gray-400 mt-1">Requires /pos/schedule mapping completion.</p>
                   </div>
                </div>

             </div>

             {/* Right Column: Context Panel */}
             <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
                <h3 className="font-bold text-gray-900 mb-6">Recent POS Activity</h3>
                <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                   <div className="text-center">
                     <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse mb-3" />
                     <p className="text-sm font-bold text-gray-900">Waiting for live transactions</p>
                     <p className="text-xs text-gray-500 mt-1">Settle a payment to track the real-time stream.</p>
                   </div>
                </div>
             </div>

          </div>
       </div>
    </div>
  );
}
