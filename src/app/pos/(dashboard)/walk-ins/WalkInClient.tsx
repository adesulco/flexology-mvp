"use client";

import { useState } from "react";
import { addWalkIn, assignWalkInToBooking, cancelWalkIn } from "@/app/actions/posWalkinActions";
import { Clock, UserPlus, X, Check, Activity, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function WalkInClient({ waitlist, flexologists, services }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Assign Modal
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedFlexologist, setSelectedFlexologist] = useState("");
  const [selectedTime, setSelectedTime] = useState(format(new Date(), "HH:mm"));

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      try {
         await addWalkIn(formData);
         setShowAdd(false);
      } catch(err) { console.error(err); }
      setLoading(false);
  };

  const handleAssign = async () => {
      if (!assigningId || !selectedFlexologist) return;
      setLoading(true);
      
      const d = new Date();
      const [h, m] = selectedTime.split(':');
      d.setHours(parseInt(h), parseInt(m), 0, 0);

      try {
         await assignWalkInToBooking(assigningId, selectedFlexologist, d.toISOString());
         setAssigningId(null);
      } catch(err) { console.error(err); }
      setLoading(false);
  };

  return (
     <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Clock className="w-5 h-5"/></div>
              <div>
                 <p className="text-sm font-bold text-gray-900">Live Active Queue</p>
                 <p className="text-xs text-gray-500">{waitlist.length} clients waiting</p>
              </div>
           </div>
           <button onClick={() => setShowAdd(!showAdd)} className="bg-black text-white px-4 py-2 text-sm font-bold rounded-xl active:scale-95 transition-all flex items-center gap-2 hover:bg-black/80">
              {showAdd ? <X className="w-4 h-4"/> : <UserPlus className="w-4 h-4"/>}
              {showAdd ? 'Cancel' : 'New Walk-In'}
           </button>
        </div>

        {showAdd && (
           <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4">
              <h3 className="font-bold text-gray-900 mb-4">Register Front-Desk Walk-In</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500">Name</label>
                    <input name="customerName" required type="text" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500">Phone</label>
                    <input name="customerPhone" type="text" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500">Target Service</label>
                    <select name="serviceId" required className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none">
                       <option value="">-- Select Service --</option>
                       {services.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                 <button disabled={loading} type="submit" className="bg-flx-teal text-black px-6 py-3 font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-flx-teal/20">
                    {loading ? 'Adding...' : 'Add to Queue'}
                 </button>
              </div>
           </form>
        )}

        <div className="grid grid-cols-1 gap-4">
           {waitlist.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-400">
                 Waiting room is empty.
              </div>
           ) : waitlist.map((w: any) => {
              const service = services.find((s: any) => s.id === w.serviceId);
              const queueTimeMins = Math.floor((new Date().getTime() - new Date(w.checkInTime).getTime()) / 60000);
              
              return (
                 <div key={w.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:shadow-md transition-shadow">
                    
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full border border-gray-200 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                          <span className="text-xs font-black leading-none">{format(new Date(w.checkInTime), "HH:mm")}</span>
                       </div>
                       <div>
                          <h4 className="font-bold text-gray-900 text-lg">{w.customerName}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                             <span>{w.customerPhone || 'Walk-In'}</span>
                             {service && <span className="flex items-center gap-1 text-flx-teal/80"><Activity className="w-3 h-3"/> {service.name}</span>}
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <p className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${queueTimeMins > 15 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          Waiting {queueTimeMins}m
                       </p>
                       <button onClick={() => setAssigningId(w.id)} disabled={loading} className="bg-black text-white px-4 py-2 font-bold rounded-lg hover:bg-black/80 active:scale-95 transition-all text-sm">Deploy</button>
                       <button onClick={async () => { setLoading(true); await cancelWalkIn(w.id); setLoading(false); }} disabled={loading} className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-4 h-4"/></button>
                    </div>

                 </div>
              )
           })}
        </div>

        {/* Assign Modal */}
        {assigningId && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
              <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
                 <h3 className="font-bold text-xl mb-4">Deploy to Schedule</h3>
                 
                 <div className="space-y-4">
                    <div>
                       <label className="text-xs font-bold text-gray-500 block mb-1">Flexologist Assignment</label>
                       <select value={selectedFlexologist} onChange={e => setSelectedFlexologist(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-black">
                          <option value="">-- Choose Staff --</option>
                          {flexologists.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-500 block mb-1">Session Start Time</label>
                       <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:border-black font-semibold text-gray-900" />
                    </div>
                 </div>

                 <div className="mt-6 flex gap-3">
                    <button onClick={() => setAssigningId(null)} className="flex-1 py-3 text-gray-500 font-bold border rounded-xl hover:bg-gray-50">Cancel</button>
                    <button onClick={handleAssign} disabled={loading || !selectedFlexologist} className="flex-1 py-3 bg-black text-white font-bold rounded-xl active:scale-95 disabled:opacity-50 inline-flex justify-center items-center gap-2">
                       {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/> : <><Check className="w-4 h-4"/> Confirm</>}
                    </button>
                 </div>
              </div>
           </div>
        )}

     </div>
  );
}
