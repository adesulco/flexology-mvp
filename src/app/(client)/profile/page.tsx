"use client";

import { motion } from "framer-motion";
import { User, Settings, CreditCard, Shield, HelpCircle, LogOut, ChevronRight, Share } from "lucide-react";

export default function Profile() {
  const userInitial = "V";
  
  return (
    <div className="flex flex-col min-h-full bg-white pb-20">
      <header className="px-6 py-4 pt-10 sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-flx-border mb-6 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-black text-center">My Profile</h1>
      </header>

      <motion.div 
        className="px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-flx-teal to-blue-500 p-1 mb-4 shadow-md">
            <div className="w-full h-full rounded-full bg-white border-4 border-white overflow-hidden flex items-center justify-center">
               <span className="text-3xl font-bold text-black uppercase">{userInitial}</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-black tracking-tight" />
          <p className="text-flx-text-muted text-sm flex items-center gap-1.5 mt-1">
             <span className="w-2 h-2 rounded-full bg-flx-teal animate-pulse" /> Silver Member
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
           <div className="bg-flx-card border border-flx-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-mono text-black mb-1">12</span>
              <span className="text-xs text-flx-text-muted">Past Sessions</span>
           </div>
           <div className="bg-flx-card border border-flx-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-mono text-black mb-1">4</span>
              <span className="text-xs text-flx-text-muted">Reviews Left</span>
           </div>
        </div>

        <div className="bg-flx-card border border-flx-border rounded-2xl overflow-hidden mb-6">
          <ProfileLink icon={User} label="Personal Information" />
          <hr className="border-flx-border/50 ml-12" />
          <ProfileLink icon={CreditCard} label="Payment Methods" />
          <hr className="border-flx-border/50 ml-12" />
          <ProfileLink icon={Settings} label="Preferences" />
        </div>

        <div className="bg-flx-card border border-flx-border rounded-2xl overflow-hidden mb-6">
          <ProfileLink icon={Share} label="Refer a Friend" value="Earn 100 PTS" highlight />
          <hr className="border-flx-border/50 ml-12" />
          <ProfileLink icon={Shield} label="Trust & Safety" />
          <hr className="border-flx-border/50 ml-12" />
          <ProfileLink icon={HelpCircle} label="Help & Support" />
        </div>

        <button className="w-full p-4 rounded-2xl border border-red-500/30 bg-red-500/5 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors">
          <LogOut className="w-5 h-5" /> Sign Out
        </button>

      </motion.div>
    </div>
  );
}

function ProfileLink({ icon: Icon, label, value, highlight = false }: { icon: any, label: string, value?: string, highlight?: boolean }) {
  return (
    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors active:bg-gray-100">
      <div className="flex items-center gap-3">
         <Icon className={`w-5 h-5 ${highlight ? 'text-black' : 'text-flx-text-muted'}`} />
         <span className={`text-sm font-medium ${highlight ? 'text-black font-bold' : 'text-gray-700'}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
         {value && <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${highlight ? 'bg-black/5 text-black' : 'text-flx-text-muted'}`}>{value}</span>}
         <ChevronRight className="w-4 h-4 text-flx-text-muted" />
      </div>
    </button>
  );
}
