"use client";


import { useState } from "react";
import { User, Settings, CheckCircle2, ChevronDown, ChevronUp, Copy, Share, ChevronRight, MessageCircle } from "lucide-react";
import { updateProfile } from "@/app/actions/clientActions";

export function ProfileEditor({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
     e.preventDefault();
     setLoading(true);
     setError("");
     const formData = new FormData(e.currentTarget);
     const res = await updateProfile(formData);
     if (res.error) setError(res.error);
     else setIsEditing(false);
     setLoading(false);
  }

  const copyToClipboard = () => {
     if (typeof navigator !== 'undefined' && user.referralCode) {
        navigator.clipboard.writeText(user.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
     }
  };

  return (
    <div className="space-y-6">
      <div className="bg-flx-card border border-flx-border rounded-2xl overflow-hidden shadow-sm">
         {/* Settings Section */}
         <button onClick={() => setExpandedSection(expandedSection === 'personal' ? null : 'personal')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
               <User className={`w-5 h-5 text-black`} />
               <span className="text-sm font-bold text-black">Personal Information</span>
            </div>
            {expandedSection === 'personal' ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
         </button>
         
         {expandedSection === 'personal' && (
           <div className="p-4 border-t border-flx-border bg-gray-50/50">
              {error && <div className="p-2 bg-red-50 text-red-500 text-xs rounded-lg mb-3 border border-red-100">{error}</div>}
              {isEditing ? (
                 <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                       <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Full Name</label>
                          <input name="name" defaultValue={user.name} required className="w-full mt-1 p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Mobile Number</label>
                          <input name="phone" type="tel" defaultValue={user.phoneNumber || ""} required className="w-full mt-1 p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" />
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                       <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Age</label>
                          <input name="age" type="number" defaultValue={user.age || ""} className="w-full mt-1 p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-black" placeholder="30" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Your Gender</label>
                          <select name="gender" defaultValue={user.gender || ""} className="w-full mt-1 p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-black">
                             <option value="">Prefer not to say</option>
                             <option value="MALE">Male</option>
                             <option value="FEMALE">Female</option>
                             <option value="OTHER">Other</option>
                          </select>
                       </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                       <h4 className="text-xs font-bold text-black mb-3"><Settings className="w-4 h-4 inline mr-1" /> Service Preferences</h4>
                       <div className="grid grid-cols-2 gap-3">
                          <div>
                             <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Therapist Gender</label>
                             <select name="prefGender" defaultValue={user.prefGender || "ANY"} className="w-full mt-1 p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-black">
                                <option value="ANY">No Preference</option>
                                <option value="MALE">Male Flexologist</option>
                                <option value="FEMALE">Female Flexologist</option>
                             </select>
                          </div>
                          <div>
                             <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Pressure Level</label>
                             <select name="prefPressure" defaultValue={user.prefPressure || "MEDIUM"} className="w-full mt-1 p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-black">
                                <option value="LIGHT">Light</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="FIRM">Firm / Deep Tissue</option>
                             </select>
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                       <button type="submit" disabled={loading} className="flex-1 bg-black text-white text-xs font-bold py-3 rounded-xl hover:bg-black/90 transition-colors">
                          {loading ? "Saving..." : "Save Profile"}
                       </button>
                       <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-3 bg-white border border-gray-200 text-black text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors">
                          Cancel
                       </button>
                    </div>
                 </form>
              ) : (
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-sm">
                       <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-0.5">Mobile Number</p>
                          <p className="font-semibold text-gray-900">{user.phoneNumber || "Not Set"}</p>
                       </div>
                       <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-0.5">Age & Gender</p>
                          <p className="font-semibold text-gray-900">{user.age ? `${user.age} yrs` : '-'}, {user.gender ? user.gender.toLowerCase() : '-'}</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-sm mt-2 pt-4 border-t border-gray-200">
                       <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-0.5">Pref. Therapist</p>
                          <p className="font-semibold text-gray-900 capitalize">{user.prefGender ? user.prefGender.toLowerCase() : "Any"}</p>
                       </div>
                       <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-0.5">Pref. Pressure</p>
                          <p className="font-semibold text-gray-900 capitalize">{user.prefPressure ? user.prefPressure.toLowerCase() : "Medium"}</p>
                       </div>
                    </div>

                    <button onClick={() => setIsEditing(true)} className="w-full mt-2 py-3 bg-white border border-gray-200 text-black text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors">
                       Edit Informartion
                    </button>
                 </div>
              )}
           </div>
         )}
      </div>

      <div className="bg-flx-card border border-flx-border rounded-2xl overflow-hidden shadow-sm">
         <div className="p-4 bg-flx-teal/10 border-b border-flx-teal/20 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <Share className="w-5 h-5 text-flx-teal" />
               <h3 className="text-sm font-bold text-flx-teal tracking-tight">Refer & Earn 50,000 Points</h3>
            </div>
         </div>
         <div className="p-5 text-center bg-white space-y-4">
            <p className="text-xs text-gray-600 leading-relaxed max-w-[250px] mx-auto">
               Give your friends your referral code! When they register an account, they get a 50,000 Level Up, and <strong className="text-flx-teal">you earn 50,000 FLX automatically!</strong>
            </p>
            
            <div className="relative">
               <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 font-mono font-bold text-black text-lg tracking-widest select-all">
                  {user.referralCode}
               </div>
            </div>

            <div className="flex flex-col gap-2">
               <button onClick={copyToClipboard} className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${copied ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}>
                  {copied ? <><CheckCircle2 className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Code</>}
               </button>
               
               <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`I'm gifting you 50,000 FLX points to try Flex! Use my invite link: flex.jemariapp.com/ref/${user.referralCode}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#1ebd59] active:scale-[0.98] transition-all shadow-[0_5px_15px_rgba(37,211,102,0.2)]"
               >
                  <MessageCircle className="w-4 h-4 fill-current" /> Share via WhatsApp
               </a>
            </div>
         </div>
      </div>
    </div>
  );
}
