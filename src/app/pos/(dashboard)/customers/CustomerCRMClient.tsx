"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, UserCircle, Phone, ArrowRight, History, Heart, FileText, Send, X, CheckCircle2, Clock } from "lucide-react";
import { addCustomerNote } from "@/app/actions/posCrmActions";

export default function CustomerCRMClient({ customers }: { customers: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [noteContent, setNoteContent] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = customers.filter(c => 
     c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.phoneNumber?.includes(searchTerm)
  );

  const handleAddNote = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!noteContent.trim() || !selectedUser) return;
     setLoading(true);
     try {
        await addCustomerNote(selectedUser.id, noteContent);
        setNoteContent("");
        setTimeout(() => window.location.reload(), 500); // Brute force refresh to catch relation in MVP
     } catch(e) { console.error(e); setLoading(false); }
  };

  return (
     <div className="flex gap-6 max-w-7xl mx-auto h-[70vh]">
        
        {/* Left List */}
        <div className="w-1/3 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
           <div className="p-4 border-b border-gray-100 flex-shrink-0">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                 <input 
                    type="text" 
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-black transition-colors"
                 />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-2">
              {filtered.map(c => (
                 <button 
                    key={c.id} 
                    onClick={() => setSelectedUser(c)}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors mb-1 ${selectedUser?.id === c.id ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
                 >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedUser?.id === c.id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                       {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <p className={`font-bold text-sm truncate ${selectedUser?.id === c.id ? 'text-white' : 'text-gray-900'}`}>{c.name}</p>
                       <p className={`text-[10px] uppercase tracking-widest ${selectedUser?.id === c.id ? 'text-gray-400' : 'text-gray-500'}`}>{c.tier || 'BRONZE'}</p>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${selectedUser?.id === c.id ? 'opacity-100' : 'opacity-0 text-gray-300'} transition-opacity`}/>
                 </button>
              ))}
           </div>
        </div>

        {/* Right Panel Detail */}
        <div className="w-2/3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
           {selectedUser ? (
              <>
                 <div className="p-8 border-b border-gray-100 shrink-0">
                    <div className="flex items-start justify-between mb-6">
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-flx-teal/20 text-flx-teal flex items-center justify-center font-black text-2xl border border-flx-teal/30">
                             {selectedUser.name.charAt(0)}
                          </div>
                          <div>
                             <h2 className="text-2xl font-black tracking-tight">{selectedUser.name}</h2>
                             <div className="flex items-center gap-4 mt-1 text-sm font-medium text-gray-500">
                                {selectedUser.phoneNumber && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> {selectedUser.phoneNumber}</span>}
                                {selectedUser.email && <span className="flex items-center gap-1">@ {selectedUser.email}</span>}
                             </div>
                          </div>
                       </div>
                       
                       <div className="text-right">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Lifetime Value</p>
                          <p className="text-2xl font-black text-emerald-600 font-mono tracking-tighter">Rp {(selectedUser.lifteTimeValue / 1000).toLocaleString()}K</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 gap-8">
                    
                    {/* Booking History */}
                    <div>
                       <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-gray-900 uppercase tracking-widest"><History className="w-4 h-4"/> Recent History</h3>
                       <div className="space-y-3">
                          {selectedUser.bookings?.length === 0 ? (
                             <p className="text-xs text-gray-400 italic">No bookings on record.</p>
                          ) : selectedUser.bookings?.map((b: any) => (
                             <div key={b.id} className="p-3 border border-gray-100 bg-gray-50 rounded-xl relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-[8px] font-bold uppercase tracking-widest ${b.status === "COMPLETED" ? 'bg-emerald-100 text-emerald-700' : b.status === "CONFIRMED" ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                                   {b.status}
                                </div>
                                <p className="text-xs font-bold text-gray-900">{b.service?.name || "Service"}</p>
                                <p className="text-[10px] text-gray-500 font-mono">{format(new Date(b.scheduledDate), "dd MMM yyyy, HH:mm")}</p>
                                <p className="text-[10px] mt-1 font-bold">
                                   {b.isPaid ? <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Paid</span> : <span className="text-amber-500 flex items-center gap-1"><Clock className="w-3 h-3"/> Pending Payment</span>}
                                </p>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="flex flex-col h-full">
                       <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-gray-900 uppercase tracking-widest"><FileText className="w-4 h-4"/> Medical Notes & CRM</h3>
                       
                       <div className="flex-1 border border-gray-200 rounded-xl bg-gray-50 p-4 overflow-y-auto space-y-4 mb-4 min-h-[200px]">
                          {selectedUser.CustomerNote?.length === 0 ? (
                             <p className="text-xs text-gray-400 italic text-center mt-4">No notes on file.</p>
                          ) : selectedUser.CustomerNote?.map((n: any) => (
                             <div key={n.id} className="bg-white p-3 border border-gray-100 rounded-lg shadow-sm">
                                <div className="flex justify-between items-start mb-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                   <span>{n.authorName}</span>
                                   <span>{format(new Date(n.createdAt), "MMM d, yyyy")}</span>
                                </div>
                                <p className="text-sm text-gray-800 break-words">{n.content}</p>
                             </div>
                          ))}
                       </div>

                       <form onSubmit={handleAddNote} className="flex flex-col gap-2 relative">
                          <textarea 
                             value={noteContent}
                             onChange={e => setNoteContent(e.target.value)}
                             required
                             placeholder="Add clinical observation..."
                             className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none h-20 outline-none focus:border-flx-teal transition-colors pr-12 shadow-sm"
                          />
                          <button disabled={loading} type="submit" className="absolute right-2 bottom-2 p-2 bg-black text-white rounded-lg hover:bg-black/80 disabled:opacity-50 active:scale-95 transition-all">
                             <Send className="w-3.5 h-3.5" />
                          </button>
                       </form>
                    </div>

                 </div>
              </>
           ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                 <UserCircle className="w-16 h-16 mb-4 text-gray-200" />
                 <p className="font-bold tracking-widest uppercase">No Profile Selected</p>
                 <p className="text-sm">Select a user to view full CRM history.</p>
              </div>
           )}
        </div>
     </div>
  );
}
