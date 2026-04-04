import { prisma } from "@/lib/prisma";
import { Copyleft, UserPlus, MapPin, Activity, Clock } from "lucide-react";
import { createFlexologist, toggleFlexologistDuty } from "@/app/actions/adminActions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTenant } from "@/lib/tenant";

export default async function StaffManagement() {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "OUTLET_MANAGER" && session.role !== "GLOBAL_MANAGER")) {
    redirect("/login");
  }
  const tenant = await getTenant();

  const staff = await prisma.flexologist.findMany({
    where: session.role === "OUTLET_MANAGER" 
      ? { locationId: session.managedLocationId as string, tenantId: tenant?.id } 
      : { tenantId: tenant?.id },
    include: { location: true },
    orderBy: { name: "asc" }
  });

  const locations = await prisma.location.findMany({
    where: { isActive: true, tenantId: tenant?.id }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Staff Management</h2>
        <p className="text-gray-500">Add new therapists and assign them to Home Service or a specific physical Outlet.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Creation Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
           <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-flx-teal/10 rounded-lg">
                <UserPlus className="w-5 h-5 text-flx-teal" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Add Therapist</h3>
           </div>

           <form action={createFlexologist} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</label>
                <input type="text" name="name" required className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" placeholder="Enter full name" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Specialty / Bio</label>
                <input type="text" name="specialty" required className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" placeholder="Sports Massage, Recovery" />
              </div>
              
              <hr className="border-gray-200" />
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Shift Start</label>
                   <input type="time" name="shiftStart" defaultValue="09:00" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Shift End</label>
                   <input type="time" name="shiftEnd" defaultValue="20:00" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" />
                 </div>
              </div>
              
              <div>
                 <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Assigned Outlet</label>
                 {session.role === "SUPER_ADMIN" ? (
                   <select name="locationId" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all text-sm">
                      <option value="">None (Global)</option>
                      {locations.map(loc => (
                         <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                   </select>
                 ) : (
                   <input 
                     type="text" 
                     className="w-full mt-1 p-3 bg-gray-200 text-gray-500 border border-gray-200 rounded-xl outline-none font-bold" 
                     readOnly 
                     disabled
                     value={locations.find(l => l.id === session.managedLocationId)?.name || "Your Outlet"} 
                   />
                 )}
              </div>

              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                 <input type="checkbox" name="canHomeService" className="w-5 h-5 accent-black router-checkbox" />
                 <div>
                    <p className="font-bold text-sm text-gray-900 leading-tight">Can perform At-Home setup</p>
                    <p className="text-xs text-gray-500">Therapist is authorized to dispatch to client homes.</p>
                 </div>
              </label>

              <button type="submit" className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-black/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4">
                 Create Profile
              </button>
           </form>
        </div>

        {/* Right Side: Active Roster */}
        <div className="lg:col-span-2">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {staff.length === 0 ? (
                <div className="col-span-2 p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                   <p className="text-gray-500 font-medium">No therapists in the system yet.</p>
                   <p className="text-sm text-gray-400">Use the form to create your staff registry.</p>
                </div>
              ) : staff.map((member) => (
                 <div key={member.id} className={`bg-white p-5 rounded-2xl shadow-sm border flex flex-col justify-between ${member.isOnDuty ? 'border-gray-200' : 'border-gray-300 bg-gray-50/50 grayscale-[0.2]'}`}>
                    <div className="flex items-start gap-4 mb-4">
                       <div className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500 border border-gray-300 text-2xl uppercase shadow-inner">
                          {member.name.charAt(0)}
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-start">
                             <h4 className={`font-bold text-lg leading-tight mb-1 ${member.isOnDuty ? 'text-gray-900' : 'text-gray-500 line-through'}`}>{member.name}</h4>
                             <form action={toggleFlexologistDuty}>
                                <input type="hidden" name="flexId" value={member.id} />
                                <input type="hidden" name="isOnDuty" value={member.isOnDuty ? "false" : "true"} />
                                <button type="submit" className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full transition-all border ${member.isOnDuty ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>
                                   {member.isOnDuty ? '🟢 On Duty' : '🔴 Off Duty'}
                                </button>
                             </form>
                          </div>
                          <span className="inline-flex items-center gap-1.5 text-xs text-flx-teal font-semibold px-2 py-0.5 bg-flx-teal/10 rounded-full mt-1 border border-flx-teal/20">
                            <Activity className="w-3 h-3" /> {member.bio}
                          </span>
                       </div>
                    </div>
                    <div className="space-y-2 text-sm font-medium border-t border-gray-100 pt-3 mt-1">
                       <div className="flex justify-between items-center text-gray-600 mb-2">
                          <p className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Shift</span></p>
                          <p className="font-mono text-xs font-bold bg-white px-2 py-1 rounded border border-gray-200 text-gray-900">{member.shiftStart} - {member.shiftEnd}</p>
                       </div>
                       {member.locationId ? (
                         <p className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4 text-gray-400" /> {member.location?.name}</p>
                       ) : (
                         <p className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4 text-gray-400" /> Float (All Outlets)</p>
                       )}
                       {member.canHomeService && (
                         <p className="flex items-center gap-2 text-blue-600"><Copyleft className="w-4 h-4" /> Dispatched for Home Service</p>
                       )}
                       <div className="pt-2 mt-2 border-t border-gray-100 flex justify-end">
                          <a href={`/therapist/${member.id}`} target="_blank" className="text-[10px] uppercase font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-1">
                             View Public Profile ↗
                          </a>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
