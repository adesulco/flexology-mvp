"use client";

import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { Trophy, Star, Gift, Crown, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

export default function Rewards() {
  const points = 1250;
  const nextTarget = 2000;
  const progress = (points / nextTarget) * 100;

  return (
    <div className="flex flex-col min-h-full">
      <Header />
      
      <motion.div 
        className="px-6 py-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8 p-6 rounded-3xl bg-white border border-flx-border relative overflow-hidden shadow-sm">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-black/5 blur-[50px] rounded-full" />
           <p className="text-xs uppercase tracking-widest text-flx-text-muted font-bold mb-2">Available Balance</p>
           <div className="flex items-end gap-2 mb-6">
             <h2 className="text-5xl font-mono font-bold text-black tracking-tighter">{points.toLocaleString()}</h2>
             <span className="text-flx-teal font-bold mb-1">FLX</span>
           </div>

           <div>
             <div className="flex justify-between text-xs text-flx-text-muted mb-2">
                <span>Silver Tier</span>
                <span>{nextTarget.toLocaleString()} to Gold</span>
             </div>
             <div className="h-2.5 w-full bg-black/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-black rounded-full relative"
                >
                   <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/20 blur-sm" />
                </motion.div>
             </div>
           </div>
        </div>

        <h3 className="text-lg font-bold text-black mb-4">How to earn</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-10">
          <div className="bg-flx-card border border-flx-border rounded-2xl p-4 flex flex-col gap-3">
             <div className="w-10 h-10 rounded-full bg-white border border-flx-border flex items-center justify-center text-black">
                <Trophy className="w-5 h-5" />
             </div>
             <div>
                <h4 className="font-bold text-sm text-black">Book Sessions</h4>
                <p className="text-[10px] text-flx-text-muted">1 point per 10k IDR spent</p>
             </div>
          </div>
          <div className="bg-flx-card border border-flx-border rounded-2xl p-4 flex flex-col gap-3">
             <div className="w-10 h-10 rounded-full bg-white border border-flx-border flex items-center justify-center text-black">
                <Gift className="w-5 h-5" />
             </div>
             <div>
                <h4 className="font-bold text-sm text-black">Refer Friends</h4>
                <p className="text-[10px] text-flx-text-muted">100 points per referral</p>
             </div>
          </div>
        </div>

        <div className="flex justify-between items-end mb-4">
           <h3 className="text-lg font-bold text-black">Membership Tiers</h3>
        </div>

        <div className="flex flex-col gap-4">
           {/* Tier 1 */}
           <div className="p-5 rounded-2xl bg-white border border-flx-border shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-3">
                 <h4 className="font-bold text-lg font-mono tracking-tight text-gray-500">FLEX</h4>
                 <span className="text-sm font-bold text-black">199K<span className="text-[10px] text-flx-text-muted">/mo</span></span>
              </div>
              <ul className="text-xs text-gray-600 space-y-2 mb-4">
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-gray-400" /> 1x 30-min session</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-gray-400" /> 10% off all bookings</li>
              </ul>
              <button className="w-full py-2.5 rounded-xl border border-flx-border text-xs font-bold text-black hover:bg-gray-50 transition-colors">Current Tier</button>
           </div>

           {/* Tier 2 */}
           <div className="p-1 rounded-2xl bg-black relative">
              <div className="absolute top-0 right-5 transform -translate-y-1/2 bg-white text-black text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-black shadow">Most Popular</div>
              <div className="p-5 rounded-xl bg-black">
                <div className="flex justify-between items-center mb-3">
                   <h4 className="font-bold text-lg font-mono tracking-tight text-white flex items-center gap-2"><Zap className="w-4 h-4 text-white fill-white" /> FLEX PLUS</h4>
                   <span className="text-sm font-bold text-white">399K<span className="text-[10px] text-gray-400">/mo</span></span>
                </div>
                <ul className="text-xs text-gray-300 space-y-2 mb-5">
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white" /> <strong className="text-white">2x 45-min sessions</strong></li>
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white" /> 15% off all bookings</li>
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white" /> 2x Points Multiplier</li>
                   <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white" /> 24hr Priority Booking</li>
                </ul>
                <button className="w-full py-2.5 rounded-xl bg-white text-black text-xs font-bold shadow-lg hover:bg-gray-200 active:scale-[0.98] transition-all border border-black/10">Upgrade Now</button>
              </div>
           </div>

           {/* Tier 3 */}
           <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-3">
                 <h4 className="font-bold text-lg font-mono tracking-tight text-black flex items-center gap-2"><Crown className="w-4 h-4" /> PREMIUM</h4>
                 <span className="text-sm font-bold text-black">699K<span className="text-[10px] text-flx-text-muted">/mo</span></span>
              </div>
              <ul className="text-xs text-gray-600 space-y-2 mb-4">
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-black" /> 4x 60-min sessions</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-black" /> 25% off all bookings</li>
              </ul>
              <button className="w-full py-2.5 rounded-xl bg-white text-black text-xs font-bold border border-flx-border hover:bg-gray-50 active:scale-[0.98] transition-all">View Details</button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
