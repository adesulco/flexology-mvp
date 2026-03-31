import { prisma } from "@/lib/prisma";
import { Copyleft, UserPlus, MapPin, Activity } from "lucide-react";
import { createFlexologist } from "@/app/actions/adminActions";

export default async function StaffManagement() {
  const staff = await prisma.flexologist.findMany({
    include: { location: true },
    orderBy: { name: "asc" }
  });

  const locations = await prisma.location.findMany({
    where: { isActive: true }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Staff Roster Setup</h2>
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
                <input type="text" name="name" required className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" placeholder="Sarah Jenkins" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Specialty / Bio</label>
                <input type="text" name="specialty" required className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" placeholder="Sports Massage, Recovery" />
              </div>
              
              <hr className="border-gray-200" />
              
              <div>
                 <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Assigned Outlet</label>
                 <select name="locationId" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all text-sm">
                    <option value="">None (Global)</option>
                    {locations.map(loc => (
                       <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                 </select>
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
                 <div key={member.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
                    <div className="flex items-start gap-4 mb-4">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={member.imageUrl || ""} alt={member.name} className="w-16 h-16 rounded-full border border-gray-200 object-cover" />
                       <div>
                          <h4 className="font-bold text-lg text-gray-900 leading-tight mb-1">{member.name}</h4>
                          <span className="inline-flex items-center gap-1.5 text-xs text-flx-teal font-semibold px-2 py-0.5 bg-flx-teal/10 rounded-full">
                            <Activity className="w-3 h-3" /> {member.bio}
                          </span>
                       </div>
                    </div>
                    <div className="space-y-2 text-sm font-medium">
                       {member.locationId ? (
                         <p className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4 text-gray-400" /> {member.location?.name}</p>
                       ) : (
                         <p className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4 text-gray-400" /> Float (All Outlets)</p>
                       )}
                       {member.canHomeService && (
                         <p className="flex items-center gap-2 text-blue-600"><Copyleft className="w-4 h-4" /> Dispatched for Home Service</p>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
