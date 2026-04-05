import { prisma } from "@/lib/prisma";
import { Copyleft, MapPin, Building, ShieldCheck, Mail, Star } from "lucide-react";
import { createLocation, createOutletManager, createGlobalManager, updateLocationSettings } from "@/app/actions/adminActions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTenant } from "@/lib/tenant";

export default async function OutletsManagement() {
  const session = await getSession();
  // Allow SUPER_ADMIN and GLOBAL_MANAGER
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "GLOBAL_MANAGER")) {
    redirect("/admin"); // Bounce lower-level admins down to bookings securely 
  }

  const tenant = await getTenant();

  const locations = await prisma.location.findMany({
    where: { ...(tenant ? { tenantId: tenant.id } : {}) },
    orderBy: { name: "asc" }
  });

  const outletAdmins = await prisma.user.findMany({
    where: { 
       OR: [
          { role: "OUTLET_MANAGER" },
          { role: "GLOBAL_MANAGER" }
       ],
       managedLocation: {
          tenantId: tenant?.id
       }
    },
    include: { managedLocation: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Outlets Management</h2>
        <p className="text-gray-500">Global control center: Provision physical locations and deploy authorized Managers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Creation Forms */}
        <div className="lg:col-span-1 space-y-6">
           
           {/* Section A: Create Physical Location */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-black rounded-lg">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-none">New Physical Outlet</h3>
             </div>

             <form action={createLocation} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Outlet Name</label>
                  <input type="text" name="name" required className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" placeholder="e.g. SCBD Premium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Physical Address</label>
                  <input type="text" name="address" required className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" placeholder="Full street address..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Open Time</label>
                     <input type="time" name="openTime" defaultValue="08:00" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Close Time</label>
                     <input type="time" name="closeTime" defaultValue="22:00" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" />
                   </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Google Maps Link (Optional)</label>
                  <input type="text" name="mapLink" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" placeholder="https://maps.google.com/..." />
                </div>
                <button type="submit" className="w-full py-3.5 bg-black text-white font-bold rounded-xl hover:bg-black/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2">
                   Deploy Outlet
                </button>
             </form>
           </div>

           {/* Section B: Create Account Admin */}
           <div className="bg-gradient-to-br from-flx-teal/10 to-teal-50 p-6 rounded-2xl shadow-sm border border-flx-teal/30">
             <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-flx-teal rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-none">Assign Outlet Manager</h3>
             </div>

             <form action={createOutletManager} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Manager Full Name</label>
                  <input type="text" name="name" required className="w-full mt-1 p-3 bg-white border border-teal-200 rounded-xl focus:ring-1 focus:ring-flx-teal outline-none transition-all" placeholder="David Schmidt" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Work Email Address</label>
                  <input type="email" name="email" required className="w-full mt-1 p-3 bg-white border border-teal-200 rounded-xl focus:ring-1 focus:ring-flx-teal outline-none transition-all" placeholder="david@flexology.com" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Temporary Password</label>
                  <input type="text" name="password" required className="w-full mt-1 p-3 bg-white border border-teal-200 rounded-xl focus:ring-1 focus:ring-flx-teal outline-none transition-all" placeholder="Type a strong password..." />
                </div>
                <hr className="border-teal-200/50 my-1" />
                <div>
                   <label className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Assigned Base Station</label>
                   <select name="locationId" required className="w-full mt-1 p-3 bg-white border border-teal-200 rounded-xl focus:ring-1 focus:ring-flx-teal outline-none transition-all text-sm font-medium">
                      <option value="">Select an outlet...</option>
                      {locations.map(loc => (
                         <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                   </select>
                </div>

                <div>
                   <label className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">System Access Clearance</label>
                   <select name="accessLevel" required className="w-full mt-1 p-3 bg-white border border-teal-200 rounded-xl focus:ring-1 focus:ring-flx-teal outline-none transition-all text-sm font-medium">
                      <option value="OUTLET_MANAGER">Full Outlet Manager (Admin Panel + POS)</option>
                      <option value="OUTLET_ADMIN">Local POS Terminal Operations Only</option>
                   </select>
                </div>

                <div className="bg-white/50 p-3 rounded-lg border border-teal-200 text-xs text-teal-900 font-medium">
                   This user will instantly gain total administrative, booking, and staff-assignment control exclusively over their selected Base Station.
                </div>

                <button type="submit" className="w-full py-4 bg-flx-teal text-black font-extrabold tracking-tight rounded-xl shadow-[0_8px_16px_rgba(40,240,190,0.2)] hover:bg-[#20e0b0] active:scale-[0.98] transition-all flex items-center justify-center mt-2">
                   Generate Manager Credentials
                </button>
             </form>
           </div>

           {/* Section C: Create Corporate Executive */}
           {session.role === "SUPER_ADMIN" && (
           <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl shadow-xl border border-gray-800">
             <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white leading-none">Provision Corporate Executive</h3>
             </div>

             <form action={createGlobalManager} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Executive Full Name</label>
                  <input type="text" name="name" required className="w-full mt-1 p-3 bg-white/5 border border-gray-700 text-white rounded-xl focus:ring-1 focus:ring-yellow-400 outline-none transition-all placeholder:text-gray-600" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mobile Number (Login ID)</label>
                  <input type="tel" name="phoneNumber" required className="w-full mt-1 p-3 bg-white/5 border border-gray-700 text-white rounded-xl focus:ring-1 focus:ring-yellow-400 outline-none transition-all placeholder:text-gray-600" placeholder="0812-XXXX-XXXX" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Temporary Password</label>
                  <input type="text" name="password" required className="w-full mt-1 p-3 bg-white/5 border border-gray-700 text-white rounded-xl focus:ring-1 focus:ring-yellow-400 outline-none transition-all placeholder:text-gray-600" placeholder="Secure Password" />
                </div>

                <div className="bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20 text-xs text-yellow-200 font-medium leading-relaxed">
                   This user gains GLOBAL Booking & Staff assignment control equal to Head Office, but is restricted from editing System Economics.
                </div>

                <button type="submit" className="w-full py-4 bg-yellow-400 text-black font-extrabold tracking-tight rounded-xl shadow-[0_8px_16px_rgba(250,204,21,0.2)] hover:bg-yellow-300 active:scale-[0.98] transition-all flex items-center justify-center mt-2">
                   Generate Executive Credentials
                </button>
             </form>
           </div>
           )}
        </div>

        {/* Right Side: Visual Rosters */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Active Outlets Grid */}
           <div>
             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-gray-400" /> Active Global Outlets ({locations.length})</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {locations.length === 0 ? (
                  <div className="col-span-2 p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                     <p className="text-gray-500 font-medium text-sm">No active outlets found. Deploy an outlet to begin expansion.</p>
                  </div>
                ) : locations.map((loc) => (
                   <div key={loc.id} className={`bg-white p-5 rounded-2xl shadow-sm border flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden ${loc.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50'}`}>
                      <div className="mb-4">
                         <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-bold text-lg leading-tight ${loc.isActive ? 'text-gray-900' : 'text-red-900'}`}>{loc.name}</h4>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${loc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                               {loc.isActive ? 'Active' : 'Closed'}
                            </span>
                         </div>
                         <p className="text-xs text-gray-500 line-clamp-2 mb-3">{loc.address}</p>
                         {loc.mapLink ? (
                            <a href={loc.mapLink} target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase font-bold text-blue-600 hover:underline tracking-wide bg-blue-50 px-2 py-1 rounded-md">View on Maps →</a>
                         ) : null}
                      </div>
                      
                      <div className="pt-4 border-t border-gray-100">
                         <form action={updateLocationSettings} className="space-y-3">
                            <input type="hidden" name="locationId" value={loc.id} />
                            <div className="grid grid-cols-2 gap-2">
                               <div>
                                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Open</label>
                                 <input type="time" name="openTime" defaultValue={loc.openTime} className="w-full mt-0.5 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-700 outline-none focus:border-black" />
                               </div>
                               <div>
                                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Close</label>
                                 <input type="time" name="closeTime" defaultValue={loc.closeTime} className="w-full mt-0.5 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-700 outline-none focus:border-black" />
                               </div>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2">
                               <select name="isActive" defaultValue={loc.isActive ? "true" : "false"} className={`p-2 border rounded-lg text-xs font-bold outline-none ${loc.isActive ? 'bg-gray-50 border-gray-200 text-gray-700' : 'bg-red-100 border-red-200 text-red-900'}`}>
                                  <option value="true">Operative</option>
                                  <option value="false">Temp Closed</option>
                               </select>
                               <button type="submit" className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:shadow-lg active:scale-95 transition-all">Save</button>
                            </div>
                         </form>
                      </div>
                   </div>
                ))}
             </div>
           </div>

           {/* Active Managers Grid */}
           <div>
             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Copyleft className="w-5 h-5 text-gray-400" /> Authorized Admin Delegates ({outletAdmins.length})</h3>
             <div className="grid grid-cols-1 gap-4">
                {outletAdmins.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                     <p className="text-gray-500 font-medium text-sm">Head Office is currently managing everything.</p>
                  </div>
                ) : outletAdmins.map((admin) => (
                   <div key={admin.id} className="bg-white p-1 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-flx-teal to-blue-500" />
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                         
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500 border border-gray-300">
                               {admin.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                  {admin.name} 
                                  <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full tracking-widest uppercase font-bold">Admin</span>
                               </h4>
                               <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {admin.email}</p>
                            </div>
                         </div>
                         
                         <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl min-w-[180px]">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5 text-right w-full">Assigned Territory</p>
                            <p className="text-sm font-bold text-gray-900 text-right w-full flex items-center justify-end gap-1"><Building className="w-4 h-4 text-flx-teal" /> {admin.managedLocation?.name}</p>
                         </div>

                      </div>
                   </div>
                ))}
             </div>
           </div>

        </div>
      </div>
    </div>
  );
}
