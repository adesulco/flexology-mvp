"use client";

import { useState, useMemo } from "react";
import { format, addDays, subDays, isSameDay, startOfDay, endOfDay } from "date-fns";
import { CheckCircle2, Clock, MapPin, Activity, X, Settings2, Calendar, List, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { adjustBooking, voidBooking } from "@/app/actions/adminActions";
import { formatCurrency } from "@/lib/formatters";

const START_HOUR = 8; // 8:00 AM
const END_HOUR = 22; // 10:00 PM
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

export default function OperationsTimeline({ 
  initialBookings, 
  flexologists, 
  locations,
  session
}: { 
  initialBookings: any[],
  flexologists: any[],
  locations: any[],
  session: any
}) {
  const [selectedOutletId, setSelectedOutletId] = useState<string>(session.managedLocationId || (locations[0]?.id || ""));
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Multi-Modal View State
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");
  const [dateRangeMode, setDateRangeMode] = useState<"DAILY" | "WEEKLY" | "RANGE">("DAILY");
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 7));

  // Filter Bookings strictly to the Selected Outlet & Date Range
  const visibleBookings = useMemo(() => {
    return initialBookings.filter(b => {
      // 1. Strict Outlet Check
      if (b.location?.id && b.location.id !== selectedOutletId) return false;
      
      // 2. Temporal Check
      const bDate = new Date(b.scheduledDate);
      if (viewMode === "GRID" && dateRangeMode === "DAILY") {
         return isSameDay(bDate, selectedDate);
      } else if (viewMode === "TABLE" && dateRangeMode === "DAILY") {
         return isSameDay(bDate, selectedDate);
      } else if (dateRangeMode === "WEEKLY") {
         return bDate >= startOfDay(selectedDate) && bDate <= endOfDay(addDays(selectedDate, 7));
      } else {
         return bDate >= startOfDay(selectedDate) && bDate <= endOfDay(endDate);
      }
    });
  }, [initialBookings, selectedOutletId, selectedDate, endDate, viewMode, dateRangeMode]);

  // Filter Flexologists specifically mapped to this Outlet
  const outletFlexologists = useMemo(() => {
     return flexologists.filter(f => f.locationId === selectedOutletId);
  }, [flexologists, selectedOutletId]);

  const getStyleForBooking = (b: any) => {
     const date = new Date(b.scheduledDate);
     const hours = date.getHours();
     const mins = date.getMinutes();
     
     // Cap calculations inside the visible grid
     let offsetMinutes = ((hours - START_HOUR) * 60) + mins;
     if (offsetMinutes < 0) offsetMinutes = 0;

     const topPct = (offsetMinutes / TOTAL_MINUTES) * 100;
     const durPct = (b.service.duration / TOTAL_MINUTES) * 100;

     return {
        top: `${topPct}%`,
        height: `${durPct}%`
     };
  };

  const getStyleForGap = (startMs: number, durMins: number) => {
     const date = new Date(startMs);
     let offsetMinutes = ((date.getHours() - START_HOUR) * 60) + date.getMinutes();
     if (offsetMinutes < 0) offsetMinutes = 0;
     return {
        top: `${(offsetMinutes / TOTAL_MINUTES) * 100}%`,
        height: `${(durMins / TOTAL_MINUTES) * 100}%`
     };
  };

  const hoursKeys = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  const isWeeklyGrid = viewMode === "GRID" && dateRangeMode === "WEEKLY";

  const gridColumns = useMemo(() => {
     if (isWeeklyGrid) {
        return Array.from({ length: 7 }, (_, i) => {
           const d = addDays(selectedDate, i);
           return {
              id: `day-${i}`,
              type: 'DAY',
              date: d,
              title: format(d, "EEEE"),
              subtitle: format(d, "MMM do")
           };
        });
     } else {
        return outletFlexologists.map(f => ({
           id: f.id,
           type: 'FLEXOLOGIST',
           data: f,
           title: f.name,
           subtitle: f.specialty
        }));
     }
  }, [isWeeklyGrid, selectedDate, outletFlexologists]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
       
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Operations Pipeline</h2>
            <p className="text-gray-500 text-sm">Real-time resource schedule and operational table.</p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto items-center">
             
             {/* Mode Toggles */}
             <div className="flex bg-gray-100 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode("GRID")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'GRID' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                >
                   <Calendar className="w-4 h-4" /> Grid
                </button>
                <button 
                  onClick={() => setViewMode("TABLE")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'TABLE' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                >
                   <List className="w-4 h-4" /> Pipeline
                </button>
             </div>

             {/* Outlet Selector / Indicator */}
             {(session.role === "SUPER_ADMIN" || session.role === "GLOBAL_MANAGER") ? (
                <select 
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-1 focus:ring-black"
                  value={selectedOutletId}
                  onChange={(e) => setSelectedOutletId(e.target.value)}
                >
                  {locations.map(loc => (
                     <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
             ) : (
                <div className="px-5 py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 cursor-not-allowed">
                   <div className="w-2 h-2 rounded-full bg-flx-teal animate-pulse" />
                   {locations.find(l => l.id === selectedOutletId)?.name || "Assigned Outlet"}
                </div>
             )}
          </div>
       </div>

       {/* Adaptive Time Range Controllers */}
       <div className="bg-white border text-sm border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-4 justify-between items-center z-20 relative">
          
          <div className="flex items-center gap-2">
             <button onClick={() => {
                const step = (dateRangeMode === "WEEKLY") ? 7 : 1;
                setSelectedDate(subDays(selectedDate, step));
             }} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-95 transition-all text-gray-600">
                <ChevronLeft className="w-4 h-4" />
             </button>
             
             <div className="px-4 py-2 border border-gray-200 rounded-lg font-bold text-gray-900 min-w-[140px] text-center bg-gray-50">
                {format(selectedDate, "dd MMM yyyy")}
                {dateRangeMode === "WEEKLY" && (
                   <span className="text-gray-400 font-mono text-xs ml-2 border-l border-gray-300 pl-2">7 Days</span>
                )}
             </div>

             <button onClick={() => {
                const step = (dateRangeMode === "WEEKLY") ? 7 : 1;
                setSelectedDate(addDays(selectedDate, step));
             }} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-95 transition-all text-gray-600">
                <ChevronRight className="w-4 h-4" />
             </button>
          </div>

          {/* Extended Time Controls */}
          <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
             <select 
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold shadow-sm outline-none focus:ring-1 focus:ring-black"
                  value={dateRangeMode}
                  onChange={(e) => setDateRangeMode(e.target.value as any)}
                >
                  <option value="DAILY">Daily Mode</option>
                  <option value="WEEKLY">7-Day Weekly</option>
                  <option value="RANGE">Custom Range</option>
                </select>

                {dateRangeMode === "RANGE" && (
                   <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-bold text-xs uppercase">To</span>
                      <input 
                         type="date" 
                         className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium outline-none"
                         value={format(endDate, "yyyy-MM-dd")}
                         onChange={(e) => setEndDate(new Date(e.target.value))}
                      />
                   </div>
                )}
             </div>
          {viewMode === "GRID" && (
             <div className="text-xs text-flx-teal font-bold tracking-widest uppercase flex items-center gap-2">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-flx-teal opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-flx-teal"></span></span>
                Live Matrix Active
             </div>
          )}
       </div>

       {viewMode === "GRID" ? (
          <div className="bg-white border text-sm border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
             
             {/* Timeline Header Columns */}
             <div className="flex border-b border-gray-200 bg-gray-50">
                <div className="w-20 shrink-0 border-r border-gray-200 flex items-center justify-center p-3">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</span>
                </div>
                
                <div className="flex-1 flex min-w-[800px]">
                   {gridColumns.map(col => (
                      <div key={col.id} className="flex-1 min-w-[150px] border-r border-gray-200 p-3 text-center bg-white">
                         <h4 className="font-bold text-gray-900 text-sm truncate">{col.title}</h4>
                         <p className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">{col.subtitle}</p>
                      </div>
                   ))}
                    {gridColumns.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white border border-gray-100 rounded-xl m-4 text-center">
                       <UserPlus className="w-8 h-8 text-gray-300 mb-3" />
                       <h3 className="text-gray-900 font-bold mb-1">No Staff Assigned Here</h3>
                       <p className="text-sm text-gray-500">There are no flexologists assigned to this outlet. Please add staff in the Roster Setup.</p>
                    </div>
                 ) : null}
                </div>
             </div>

             {/* Timeline Body Matrix */}
             <div className="flex relative h-[800px] bg-white overflow-x-auto">
                <div className="w-20 shrink-0 border-r border-gray-200 flex flex-col relative bg-gray-50/30">
                   {hoursKeys.map(h => (
                      <div key={h} className="flex-1 border-b border-gray-100 p-2 text-right relative min-h-[40px]">
                         <span className="text-[10px] font-bold text-gray-500 absolute -top-2 right-2 bg-gray-50/30 px-1">{format(new Date().setHours(h, 0), 'HH:mm')}</span>
                      </div>
                   ))}
                </div>

                <div className="flex-1 flex relative min-w-[800px]">
                   <div className="absolute inset-0 flex flex-col pointer-events-none">
                      {hoursKeys.map(h => (
                         <div key={`guide-${h}`} className="flex-1 border-b border-gray-100/50 w-full min-h-[40px]"></div>
                      ))}
                   </div>

                   {gridColumns.map(col => {
                      const matchingBookings = col.type === 'FLEXOLOGIST' 
                         ? visibleBookings.filter(b => b.flexologistId === col.id)
                         : visibleBookings.filter(b => isSameDay(new Date(b.scheduledDate), (col as any).date as Date));

                      // Calendar Gap Optimization (Fresha Model)
                      // Sort bookings to identify orphaned gaps
                      const sortedBookings = [...matchingBookings].sort((a,b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
                      const gaps = [];
                      for (let i = 0; i < sortedBookings.length - 1; i++) {
                         const current = sortedBookings[i];
                         const next = sortedBookings[i + 1];
                         const endOfCurrent = new Date(current.scheduledDate).getTime() + (current.service.duration * 60000);
                         const startOfNext = new Date(next.scheduledDate).getTime();
                         const diffMins = (startOfNext - endOfCurrent) / 60000;
                         
                         // If gap is between 15 to 59 minutes, it's a dead slot!
                         if (diffMins > 0 && diffMins < 60) {
                             gaps.push({ startMs: endOfCurrent, durationMins: diffMins });
                         }
                      }

                      return (
                         <div key={`lane-${col.id}`} className="flex-1 min-w-[150px] border-r border-gray-100 relative group transition-colors duration-300">
                            <div className="absolute inset-0 bg-blue-50/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            {/* Render Dead orphaned gaps */}
                            {gaps.map((gap, i) => (
                               <div 
                                 key={`gap-${i}`}
                                 style={{ ...getStyleForGap(gap.startMs, gap.durationMins) }}
                                 className="absolute left-1 right-1 bg-red-100/50 border border-red-300 border-dashed rounded flex flex-col items-center justify-center p-1 pointer-events-none z-0 overflow-hidden"
                               >
                                  <span className="text-[10px] uppercase font-bold text-red-600 tracking-tighter leading-none">{gap.durationMins}m Dead Zone</span>
                                  <span className="text-[8px] text-red-400 font-medium">Shift adjacent bookings!</span>
                               </div>
                            ))}

                            {matchingBookings.map(b => {
                               const isConfirmed = b.status === "CONFIRMED";
                               
                               // Phase 3 Temporary Hold logic: If a booking is PENDING but its expiration passed, it is effectively Void.
                               const isExpiredHold = b.status === "PENDING" && b.expiresAt && new Date(b.expiresAt).getTime() < new Date().getTime();
                               const isVoid = b.status === "VOIDED" || b.status === "CANCELLED" || isExpiredHold;
                               
                               return (
                                  <div 
                                    key={b.id} 
                                    onClick={() => setSelectedBooking(b)}
                                    style={{ ...getStyleForBooking(b) }}
                                    className={`absolute left-1 right-1 rounded-lg border shadow-sm p-2 overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:z-10 hover:shadow-md
                                        ${isVoid ? 'bg-red-50 border-red-200 opacity-50' : 
                                          isConfirmed ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'} z-10`}
                                  >
                                     <div className={`w-1 absolute left-0 top-0 bottom-0 ${isVoid ? 'bg-red-400' : isConfirmed ? 'bg-blue-400' : 'bg-yellow-400'}`} />
                                     <div className="pl-1">
                                       <div className="flex justify-between items-start gap-1 mb-1">
                                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isVoid ? 'text-red-700' : isConfirmed ? 'text-blue-700' : 'text-yellow-700'}`}>{b.start_time || format(new Date(b.scheduledDate), "HH:mm")}</span>
                                          {isConfirmed && <CheckCircle2 className="w-3 h-3 text-blue-500" />}
                                          {!isConfirmed && !isVoid && <Clock className="w-3 h-3 text-yellow-600" />}
                                       </div>
                                       <p className="text-xs font-bold text-gray-900 truncate leading-tight">{b.user?.name}</p>
                                       <p className="text-[10px] text-gray-600 truncate">{b.service?.name}</p>
                                       {col.type === 'DAY' && (
                                          <p className="text-[10px] font-bold mt-1 text-gray-800">{b.flexologist?.name || '⚠️ Unassigned'}</p>
                                       )}
                                       {b.status === "CONFIRMED" && (
                                           <div className="mt-2 text-[8px] uppercase tracking-wider font-bold text-blue-600/70 opacity-0 group-hover:opacity-100 transition-opacity">
                                              Click to manage
                                           </div>
                                       )}
                                       {isExpiredHold && (
                                           <div className="mt-1 text-[8px] uppercase tracking-wider font-bold text-red-600/70">
                                              HOLD EXPIRED
                                           </div>
                                       )}
                                     </div>
                                  </div>
                               );
                            })}
                         </div>
                      );
                   })}

                   {/* Unassigned Float Lane (Only in Daily Flexologist Grid) */}
                   {!isWeeklyGrid && (
                      <div className="flex-1 min-w-[200px] bg-red-50/20 border-r border-gray-100 relative border-l-2 border-l-red-200">
                         <div className="absolute -top-10 left-0 right-0 p-2 text-center">
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-1 rounded border border-red-100">Unassigned / Orphans</span>
                         </div>
                         
                         {hoursKeys.map(h => (
                            <div key={`guide-orphan-${h}`} className="border-b border-gray-100/50 w-full min-h-[40px] pointer-events-none absolute left-0 right-0" style={{top: `${((h - START_HOUR) / (END_HOUR - START_HOUR)) * 100}%`}}></div>
                         ))}

                         {visibleBookings.filter(b => !b.flexologistId).map(b => (
                            <div 
                               key={b.id} 
                               onClick={() => setSelectedBooking(b)}
                               style={{ ...getStyleForBooking(b) }}
                               className={`absolute left-1 right-1 rounded-lg border shadow-sm p-2 overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:z-10 bg-yellow-100 border-yellow-300 animate-pulse`}
                             >
                                <div className={`w-1 absolute left-0 top-0 bottom-0 bg-yellow-500`} />
                                <div className="pl-1">
                                  <h4 className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider mb-0.5">⚠️ Pending Match</h4>
                                  <p className="text-xs font-bold text-gray-900 truncate leading-tight">{b.user.name}</p>
                                  <p className="text-[10px] text-gray-600 truncate">{b.service.name}</p>
                                  <p className="text-[10px] font-mono text-gray-500 mt-1">{format(new Date(b.scheduledDate), "HH:mm")}</p>
                                </div>
                             </div>
                         ))}
                      </div>
                   )}
                </div>
             </div>
          </div>
       ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm whitespace-nowrap">
                 <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                   <tr>
                     <th className="px-6 py-4">Status & Time</th>
                     <th className="px-6 py-4">Client</th>
                     <th className="px-6 py-4">Service Details</th>
                     <th className="px-6 py-4">Location</th>
                     <th className="px-6 py-4">Assigned To</th>
                     <th className="px-6 py-4 text-center">Manage</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {visibleBookings.length === 0 ? (
                     <tr>
                       <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                         No operational data found for this period. Try extending the Date Range.
                       </td>
                     </tr>
                   ) : visibleBookings.map((b) => (
                     <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-2 mb-1">
                           {b.status === 'CONFIRMED' ? (
                             <span className="inline-flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                               <CheckCircle2 className="w-3 h-3" /> Confirmed
                             </span>
                           ) : b.status === "VOIDED" || b.status === "CANCELLED" ? (
                             <span className="inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                               <X className="w-3 h-3" /> Cancelled
                             </span>
                           ) : (
                             <span className="inline-flex items-center gap-1 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                               <Clock className="w-3 h-3" /> {b.status}
                             </span>
                           )}
                         </div>
                         <p className="font-semibold text-gray-900">{format(new Date(b.scheduledDate), "MMM do, HH:mm")}</p>
                       </td>
                       <td className="px-6 py-4">
                         <p className="font-semibold text-gray-900">{b.user?.name || "Unknown"}</p>
                         <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{b.user?.tier || "BRONZE"} TIER</p>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           <Activity className="w-4 h-4 text-flx-teal opacity-70" />
                           <div>
                              <p className="font-semibold text-gray-900">{b.service?.name || "Service"}</p>
                              <p className="text-[10px] font-mono text-emerald-600 font-bold">{formatCurrency(b.totalPrice)} &nbsp;•&nbsp; <span className="text-gray-500">{b.service?.duration || 60} mins</span></p>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         {b.mode === 'OUTLET' ? (
                           <div>
                             <p className="font-semibold text-gray-900">{b.location?.name}</p>
                             <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Base Station</p>
                           </div>
                         ) : (
                           <div>
                             <p className="font-semibold text-gray-900">Home Deploy</p>
                             <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{b.homeAddress}</p>
                           </div>
                         )}
                       </td>
                       <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${b.flexologist ? 'text-gray-900' : 'text-red-500 font-bold animate-pulse'}`}>
                             {b.flexologist?.name || '⚠️ Unassigned'}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => setSelectedBooking(b)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 hover:bg-white hover:border-black hover:shadow-sm active:scale-95 transition-all inline-flex items-center gap-2 font-bold text-xs"
                          >
                             <Settings2 className="w-3 h-3" /> Adjust
                          </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
       )}

       {/* Floating Adjustment Pane */}
       {selectedBooking && (
           <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-end">
              <div className="bg-white w-full max-w-md h-full md:h-auto md:min-h-screen shadow-2xl overflow-y-auto animate-in slide-in-from-right flex flex-col">
                 <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                    <div>
                       <h3 className="text-xl font-bold tracking-tight">Mission Control</h3>
                       <p className="text-sm text-gray-500 font-mono">ID: {selectedBooking.id}</p>
                    </div>
                    <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                       <X className="w-6 h-6 text-gray-700" />
                    </button>
                 </div>
                 
                 <div className="p-6 space-y-6 flex-1">
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                       <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3">Client Manifest</h4>
                       <p className="text-lg font-black text-gray-900 mb-1">{selectedBooking.user?.name}</p>
                       <div className="flex items-center gap-2 text-sm text-gray-600 font-mono mb-2">
                          <span>{selectedBooking.user?.phoneNumber}</span>
                       </div>
                       <div className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-md border text-xs font-bold text-gray-700 shadow-sm mt-1">
                          {selectedBooking.user?.tier} TIER
                       </div>
                    </div>

                     {/* Phase 5: WhatsApp Abandonment Concierge */}
                     {selectedBooking.status === "PENDING" && selectedBooking.expiresAt && new Date(selectedBooking.expiresAt).getTime() < new Date().getTime() && (
                         <div className="bg-gradient-to-r from-red-50 to-orange-50 p-5 rounded-2xl border border-red-200 mb-6 shadow-sm">
                             <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <h4 className="text-xs font-bold text-red-800 uppercase tracking-widest">Cart Abandoned</h4>
                             </div>
                             <p className="text-sm font-medium text-red-900 mb-4 leading-relaxed">
                               This guest started the checkout process but did not complete the payment. The 10-minute hold has expired.
                             </p>
                             
                             <a 
                                href={`https://wa.me/62${(selectedBooking.user?.phoneNumber || "").replace(/^0+/, '')}?text=${encodeURIComponent(`Hi ${selectedBooking.user?.name || ''}! We noticed you were trying to book a ${selectedBooking.service?.name} session with Flex but didn't finish checkout. Need help grabbing that slot?`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-xl font-bold shadow-lg hover:-translate-y-0.5 hover:shadow-[#25D366]/30 transition-all text-sm tracking-wide"
                             >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                   <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                                Recover via WhatsApp
                             </a>
                         </div>
                     )}

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                       <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Service Details</h4>
                       <div className="flex justify-between items-start">
                          <div>
                             <p className="font-bold text-gray-900">{selectedBooking.service?.name}</p>
                             <p className="text-sm text-gray-500">{selectedBooking.service?.duration} Minutes</p>
                          </div>
                          <p className="font-mono font-bold text-emerald-700">{formatCurrency(selectedBooking.totalPrice)}</p>
                       </div>
                    </div>

                    <form action={async (formData) => {
                       const assignedId = formData.get("flexologistId") as string;
                       const newStatus = formData.get("status") as string;
                       if ((newStatus === 'CONFIRMED' || newStatus === 'COMPLETED') && !assignedId) {
                          alert("❌ Please designate a local Therapist from the registry before confirming this session.");
                          return;
                       }
                       formData.append('bookingId', selectedBooking.id);
                       formData.append('scheduledDate', selectedBooking.scheduledDate);
                       formData.append('totalPrice', selectedBooking.totalPrice);
                       formData.append('homeAddress', selectedBooking.homeAddress || "");
                       
                       const res = await adjustBooking(formData) as any;
                       if(res?.success) {
                          alert("Assignment updated successfully!");
                          window.location.reload();
                       }
                    }} className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Reassign Therapist</label>
                          <select name="flexologistId" defaultValue={selectedBooking.flexologistId || ""} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-black outline-none font-medium">
                             <option value="">[ Pending Assignment ]</option>
                             {outletFlexologists.map(flex => (
                                <option key={flex.id} value={flex.id}>{flex.name} - {flex.specialty}</option>
                             ))}
                          </select>
                       </div>

                       <div className="space-y-1">
                          <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Override Status</label>
                          <select name="status" defaultValue={selectedBooking.status} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-black outline-none font-medium text-blue-700">
                             <option value="PENDING">PENDING</option>
                             <option value="CONFIRMED">CONFIRMED ✅</option>
                             <option value="COMPLETED">COMPLETED</option>
                          </select>
                       </div>

                       <button type="submit" className="w-full py-4 mt-4 bg-black text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm tracking-wide">
                          UPDATE ASSIGNMENT
                       </button>
                    </form>

                 </div>

                 <div className="p-6 bg-red-50/30 border-t border-red-100 mt-auto">
                    <form action={async (formData) => {
                       if(confirm("DANGER: This will void the booking and refund the credit immediately. Proceed?")) {
                          formData.append('bookingId', selectedBooking.id);
                          await voidBooking(formData);
                          window.location.reload();
                       }
                    }}>
                       <button className="w-full py-3 border border-red-200 text-red-600 bg-white rounded-xl font-bold hover:bg-red-50 transition-colors text-sm">
                          VOID / CANCEL TICKET
                       </button>
                    </form>
                 </div>
              </div>
           </div>
       )}
    </div>
  );
}
