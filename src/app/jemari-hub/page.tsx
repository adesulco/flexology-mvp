import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Activity, DollarSign, Users, Building2, PlusCircle, Network } from "lucide-react";
import Link from "next/link";
import { provisionTenant } from "@/app/actions/platformActions";

export const dynamic = "force-dynamic";

export default async function PlatformHub() {
  const session = await getSession();
  if (session?.role !== 'PLATFORM_OWNER') {
    redirect("/");
  }

  // PLATFORM LEVEL ANALYTICS (No tenant filter!)
  const [tenants, allBookings, allPayments] = await Promise.all([
    prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.booking.findMany({ include: { tenant: true } }),
    prisma.paymentTransaction.findMany({ where: { status: 'SUCCESS' }, include: { tenant: true } })
  ]);

  const totalRevenue = allPayments.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const mrr = tenants.length * 500000; // Fake SaaS MRR logic (500k per tenant)

  // Leaderboard Calculation
  const tenantMap: Record<string, { name: string, color: string, volume: number }> = {};
  
  allPayments.forEach(p => {
     if (!p.tenantId || !p.tenant) return;
     if (!tenantMap[p.tenantId]) {
         tenantMap[p.tenantId] = { name: p.tenant.name, color: p.tenant.primaryColor, volume: 0 };
     }
     tenantMap[p.tenantId].volume += p.totalAmount;
  });

  const leaderboard = Object.values(tenantMap).sort((a, b) => b.volume - a.volume);

  return (
    <div className="min-h-screen bg-black text-white p-8">
       <div className="max-w-7xl mx-auto space-y-12">
          
          <header className="flex justify-between items-end border-b border-gray-800 pb-6">
             <div>
                <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                   <Network className="w-8 h-8 text-blue-500" />
                   Jemari <span className="text-gray-500 font-light">Hub</span>
                </h1>
                <p className="text-gray-400 mt-2 font-mono text-sm">GLOBAL COMMAND CENTER • SAAS INFRASTRUCTURE</p>
             </div>
             
             {/* Fake Root Admin Profile */}
             <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 p-2 pr-6 rounded-full">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center font-bold">
                   JD
                </div>
                <div className="text-sm">
                   <p className="font-bold leading-none">Jemari Director</p>
                   <p className="text-blue-400 text-xs font-mono mt-1">SUPER_ROOT</p>
                </div>
             </div>
          </header>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
                <div className="text-gray-500 mb-4"><Building2 className="w-6 h-6" /></div>
                <div>
                   <p className="text-sm font-bold text-gray-400 mb-1">Active Tenants</p>
                   <h3 className="text-4xl font-black">{tenants.length}</h3>
                </div>
             </div>
             <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
                <div className="text-blue-500 mb-4"><DollarSign className="w-6 h-6" /></div>
                <div>
                   <p className="text-sm font-bold text-gray-400 mb-1">Global GMV</p>
                   <h3 className="text-3xl font-black">Rp {totalRevenue.toLocaleString()}</h3>
                </div>
             </div>
             <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
                <div className="text-green-500 mb-4"><Activity className="w-6 h-6" /></div>
                <div>
                   <p className="text-sm font-bold text-gray-400 mb-1">Estimated MRR</p>
                   <h3 className="text-3xl font-black">Rp {mrr.toLocaleString()}</h3>
                </div>
             </div>
             <div className="bg-gradient-to-br from-indigo-900 to-black border border-indigo-800 p-6 rounded-2xl flex flex-col justify-between">
                <div className="text-indigo-400 mb-4"><Users className="w-6 h-6" /></div>
                <div>
                   <p className="text-sm font-bold text-indigo-300 mb-1">Platform Bookings</p>
                   <h3 className="text-4xl font-black text-white">{allBookings.length.toLocaleString()}</h3>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* Left Col: Tenant Provisioning */}
             <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                   
                   <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <PlusCircle className="w-5 h-5 text-blue-500" /> Deploy New Tenant
                   </h3>
                   
                   <form action={provisionTenant} className="space-y-4 relative z-10">
                      <div>
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Brand Name</label>
                         <input type="text" name="name" required placeholder="e.g. Sense by Jari Jari" className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-700 font-bold" />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Subdomain Routing (Slug)</label>
                         <div className="flex bg-black border border-gray-800 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                            <input type="text" name="slug" required placeholder="sense" className="flex-1 bg-transparent p-3 text-white outline-none placeholder:text-gray-700 font-mono text-sm text-right" />
                            <div className="bg-gray-900 border-l border-gray-800 p-3 text-gray-500 font-mono text-sm flex items-center select-none">
                               .jemariapp.com
                            </div>
                         </div>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Brand Primary Hex Color</label>
                         <div className="flex gap-2">
                            <input type="color" name="colorHex" defaultValue="#FE0373" className="w-14 h-12 rounded-lg cursor-pointer bg-black border border-gray-800 p-1" />
                            <input type="text" defaultValue="#FE0373" className="flex-1 bg-black border border-gray-800 rounded-xl p-3 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono" />
                         </div>
                      </div>
                      
                      <button type="submit" className="w-full py-4 mt-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                         Initialize Database Schema
                      </button>
                   </form>
                </div>
             </div>

             {/* Right Col: Active Brands Status */}
             <div className="lg:col-span-2">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                   <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-black/20">
                      <h3 className="font-bold">Active SaaS Tenants</h3>
                      <div className="flex gap-2">
                         <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                         <span className="text-xs text-green-500 font-mono">SYSTEMS NOMINAL</span>
                      </div>
                   </div>
                   
                   <div className="divide-y divide-gray-800">
                      {tenants.map(t => {
                         const stats = tenantMap[t.id] || { volume: 0 };
                         return (
                            <div key={t.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-black text-xl overflow-hidden shadow-inner" style={{ backgroundColor: t.primaryColor }}>
                                     {t.name.substring(0, 1)}
                                  </div>
                                  <div>
                                     <h4 className="font-bold text-lg">{t.name}</h4>
                                     <a href={`http://${t.slug}.jemariapp.com`} target="_blank" className="text-sm font-mono text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1">
                                        {t.slug}.jemariapp.com
                                     </a>
                                  </div>
                               </div>
                               
                               <div className="text-right">
                                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Generated Volume</p>
                                  <p className="font-mono text-lg font-bold">Rp {stats.volume.toLocaleString()}</p>
                               </div>
                               
                               <div className="pl-6 border-l border-gray-800">
                                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${t.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                     {t.isActive ? 'ONLINE' : 'SUSPENDED'}
                                  </span>
                               </div>
                            </div>
                         )
                      })}
                   </div>
                </div>
             </div>

          </div>
       </div>
    </div>
  );
}
