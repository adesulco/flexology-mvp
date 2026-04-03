"use client";

import { useState } from "react";
import { format } from "date-fns";
import { searchPosCustomer, createPosBooking } from "@/app/actions/posActions";
import { Search, UserCheck, Flame, UserPlus, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewBookingClient({ locations, services, flexologists, sessionLocationId }: any) {
  const router = useRouter();
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Selection State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>("");
  
  // Manual Registration State
  const [isManualGuest, setIsManualGuest] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Booking Flow State
  const [selectedLocation, setSelectedLocation] = useState(sessionLocationId || (locations[0]?.id || ""));
  const [selectedService, setSelectedService] = useState("");
  const [selectedFlexologist, setSelectedFlexologist] = useState("any");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedTime, setSelectedTime] = useState(format(new Date(), "HH:00"));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeFlexologists = flexologists.filter((f: any) => f.locationId === selectedLocation);

  const handleSearch = async (val: string) => {
     setSearchQuery(val);
     if (val.length >= 3) {
        setIsSearching(true);
        try {
           const results = await searchPosCustomer(val);
           setSearchResults(results);
        } catch(e) { console.error(e); }
        setIsSearching(false);
     } else {
        setSearchResults([]);
     }
  };

  const wrapTimeWithDate = () => {
     try {
       const [h, m] = selectedTime.split(':');
       const d = new Date(selectedDate);
       d.setHours(parseInt(h), parseInt(m), 0, 0);
       return d.toISOString();
     } catch {
       return new Date().toISOString();
     }
  }

  const handleSubmit = async () => {
     if (!selectedService) return setError("Please select a service.");
     if (!selectedCustomerId && !isManualGuest) return setError("Please select or register a customer.");
     if (isManualGuest && (!guestName || !guestPhone)) return setError("Guest name and phone required.");

     setError("");
     setIsSubmitting(true);

     const formData = new FormData();
     formData.append("serviceId", selectedService);
     formData.append("flexologistId", selectedFlexologist);
     formData.append("scheduledDate", wrapTimeWithDate());
     formData.append("locationId", selectedLocation);
     
     if (selectedCustomerId) {
        formData.append("customerId", selectedCustomerId);
     } else {
        formData.append("guestName", guestName);
        formData.append("guestPhone", guestPhone);
     }

     try {
        const res = await createPosBooking(formData);
        if (res.error) throw new Error(res.error);
        
        // Success
        router.push(`/pos/schedule`);
     } catch (err: any) {
        setError(err.message || "Failed to finalize booking");
        setIsSubmitting(false);
     }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
       
       <div className="p-8 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">1. Customer Identification</h2>
          
          {!selectedCustomerId && !isManualGuest ? (
             <div className="space-y-4">
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className={`w-5 h-5 ${isSearching ? 'text-flx-teal animate-pulse' : 'text-gray-400'}`} />
                   </div>
                   <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search phone number, email, or name..." 
                      className="w-full p-4 pl-12 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all shadow-sm"
                   />
                </div>

                {searchResults.length > 0 && (
                   <div className="bg-white border text-sm border-gray-200 rounded-xl shadow-lg overflow-hidden divide-y divide-gray-100 max-h-48 overflow-y-auto">
                      {searchResults.map(u => (
                         <button 
                           key={u.id}
                           onClick={() => { setSelectedCustomerId(u.id); setSelectedCustomerName(u.name); }}
                           className="w-full flex items-center justify-between p-3 flex-col hover:bg-gray-50 text-left transition-colors"
                         >
                            <div className="font-bold text-gray-900 w-full">{u.name} <span className="text-flx-teal font-medium ml-2 text-xs">{u.tier}</span></div>
                            <div className="text-gray-500 text-xs w-full mt-1">{u.phoneNumber} • {u.email}</div>
                         </button>
                      ))}
                   </div>
                )}

                <div className="flex items-center gap-4 py-2">
                   <div className="h-px bg-gray-200 flex-1" />
                   <span className="text-xs font-bold text-gray-400 uppercase">OR</span>
                   <div className="h-px bg-gray-200 flex-1" />
                </div>

                <button 
                  onClick={() => setIsManualGuest(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-bold hover:bg-gray-50 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
                >
                   <UserPlus className="w-5 h-5" /> Walk-In Guest Registration
                </button>
             </div>
          ) : (
             <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-flx-teal/10 border border-flx-teal/30 rounded-xl">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-flx-teal rounded-lg"><UserCheck className="w-5 h-5 text-black" /></div>
                    <div>
                       <p className="text-xs font-bold text-teal-800 uppercase tracking-widest">Active Target</p>
                       <p className="text-lg font-black text-gray-900">{isManualGuest ? "New Guest Walk-in" : selectedCustomerName}</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => { setSelectedCustomerId(null); setIsManualGuest(false); setSearchQuery(""); }}
                    className="text-xs font-bold text-gray-500 hover:text-red-500 underline mt-2 sm:mt-0"
                 >Change Customer</button>
             </div>
          )}

          {isManualGuest && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 border border-gray-200 rounded-xl bg-white">
                <div>
                   <label className="text-xs font-bold text-gray-600">GUEST FULL NAME</label>
                   <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-600">WHATSAPP / PHONE NUMBER</label>
                   <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black" />
                </div>
             </div>
          )}
       </div>

       <div className="p-8 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">2. Operations Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1 mb-2 block">Location</label>
                <select 
                  value={selectedLocation} 
                  onChange={e => setSelectedLocation(e.target.value)} 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-black font-semibold text-gray-900 shadow-sm"
               >
                  {locations.map((loc: any) => (
                     <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
               </select>
             </div>

             <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1 mb-2 block">Service Vector</label>
                <select 
                  value={selectedService} 
                  onChange={e => setSelectedService(e.target.value)} 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-black font-semibold text-gray-900 shadow-sm"
               >
                  <option value="">-- Select Service --</option>
                  {services.map((s: any) => (
                     <option key={s.id} value={s.id}>{s.name} ({s.duration}m) - Rp {s.price.toLocaleString('id-ID')}</option>
                  ))}
               </select>
             </div>

             <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1 mb-2 block">Specialist Assignment</label>
                <select 
                  value={selectedFlexologist} 
                  onChange={e => setSelectedFlexologist(e.target.value)} 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-black font-semibold text-gray-900 shadow-sm"
               >
                  <option value="any">Any Available Specialist</option>
                  {activeFlexologists.map((f: any) => (
                     <option key={f.id} value={f.id}>{f.name} {f.isOnDuty ? '' : '(Off Duty)'}</option>
                  ))}
               </select>
             </div>

             <div className="grid grid-cols-2 gap-2">
                <div>
                   <label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1 mb-2 block">Date</label>
                   <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-black font-semibold text-gray-900 shadow-sm" />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1 mb-2 block">Time</label>
                   <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-black font-semibold text-gray-900 shadow-sm" />
                </div>
             </div>
          </div>
       </div>

       <div className="p-8 bg-gray-50 flex items-center justify-between">
          <div className="text-red-500 font-bold text-sm w-1/2">{error}</div>
          <button 
             onClick={handleSubmit} 
             disabled={isSubmitting}
             className="w-1/2 py-4 bg-black text-white font-black tracking-widest uppercase rounded-xl hover:bg-black/80 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/20"
          >
             {isSubmitting ? "Executing..." : "Lock Booking Entry"}
          </button>
       </div>

    </div>
  );
}
