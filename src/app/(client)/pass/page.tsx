import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { redirect } from "next/navigation";
import { Lock, Unlock, Diamond, Gift, Star, ChevronLeft, Hexagon } from "lucide-react";
import Link from "next/link";

export default async function WellnessPassPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { points: true, tier: true, name: true }
  });

  if (!user) redirect("/login");

  // Wellness Pass Engine Math
  // 1 Level = 200 FLX Points
  const MAX_LEVEL = 20;
  const POINTS_PER_LEVEL = 50000;
  const currentTotalPoints = user.points;
  const currentLevel = Math.min(Math.floor(currentTotalPoints / POINTS_PER_LEVEL) + 1, MAX_LEVEL);
  const pointsInCurrentLevel = currentTotalPoints % POINTS_PER_LEVEL;
  const progressToNext = (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;

  // Pass Rewards Track
  const passRewards = Array.from({ length: MAX_LEVEL }).map((_, i) => {
     const lvl = i + 1;
     let rewardType = "None";
     let rewardDescription = "Keep pushing forward.";
     
     if (lvl % 5 === 0) {
        rewardType = "Milestone";
        rewardDescription = "Unlock an exclusive Flex Avatar Badge";
     }
     
     if (lvl === 5) rewardDescription = "Free 15-Minute Theragun Add-On";
     if (lvl === 10) rewardDescription = "Exclusive 'Early Bird' Booking Rights";
     if (lvl === 15) rewardDescription = "Free 60-Minute Home Service Upgrade";
     if (lvl === 20) {
        rewardType = "Ultimate";
        rewardDescription = "Master Elite Care Package (Merch & 2 Free Sessions)";
     }

     return {
        level: lvl,
        requiredPoints: (lvl - 1) * POINTS_PER_LEVEL,
        isUnlocked: currentLevel >= lvl,
        isCurrent: currentLevel === lvl,
        rewardType,
        rewardDescription
     };
  });

  return (
    <div className="flex flex-col min-h-full bg-[#0a0a0a] text-white">
      <Header points={user.points} />
      
      <div className="px-6 py-6 pb-24 max-w-lg mx-auto w-full">
         <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4 text-sm font-bold">
               <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
            
            <div className="flex justify-between items-end mb-2">
               <div>
                 <span className="text-[10px] text-flx-teal uppercase tracking-widest font-bold">Evergreen Pass</span>
                 <h1 className="text-3xl font-black tracking-tight text-white leading-none mt-1">Recovery<br />Awakening</h1>
               </div>
               <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-center min-w-[80px]">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Level</span>
                  <span className="text-2xl font-mono font-bold text-white">{currentLevel}</span>
               </div>
            </div>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed max-w-[280px]">Earn FLX XP by booking sessions and completing wellness challenges. Unlock powerful rewards.</p>
         </div>

         {/* Current Progress Banner */}
         {currentLevel < MAX_LEVEL ? (
             <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-6 mb-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-flx-teal/10 blur-3xl rounded-full" />
                <div className="flex justify-between items-end mb-4 relative z-10">
                   <div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Next Reward Level</span>
                      <h3 className="text-xl font-bold mt-1">Level {currentLevel + 1}</h3>
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Remaining XP</span>
                      <h3 className="text-xl font-mono font-bold text-flx-teal mt-1">{POINTS_PER_LEVEL - pointsInCurrentLevel}</h3>
                   </div>
                </div>
                
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden relative z-10">
                   <div 
                      className="h-full bg-flx-teal rounded-full relative"
                      style={{ width: `${progressToNext}%` }}
                   >
                      <div className="absolute inset-0 bg-white/30 truncate" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}></div>
                   </div>
                </div>
                <div className="flex justify-between items-center mt-3 relative z-10">
                   <span className="text-[10px] font-mono text-gray-500">Lvl {currentLevel}</span>
                   <span className="text-[10px] font-mono text-gray-500">Lvl {currentLevel + 1}</span>
                </div>
             </div>
         ) : (
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 border border-yellow-300/50 rounded-3xl p-6 mb-10 shadow-[0_0_30px_rgba(234,179,8,0.2)] text-black text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-2xl rounded-full" />
               <Star className="w-10 h-10 mx-auto mb-2 text-white" />
               <h3 className="text-2xl font-black uppercase tracking-tight">Recovery Mastered</h3>
               <p className="text-xs font-medium mt-1 text-yellow-900">You have conquered the highest echelon of the Recovery Pass.</p>
            </div>
         )}

         <h2 className="text-lg font-bold mb-6 tracking-tight flex items-center gap-2"><Hexagon className="w-5 h-5 text-flx-teal" /> Battle Pass Rewards</h2>
         
         {/* The Track Path */}
         <div className="relative pl-6">
            {/* Connecting Vertical Line */}
            <div className="absolute top-8 bottom-8 left-[39px] w-[2px] bg-white/10" />

            {passRewards.slice().reverse().map((r, i) => {
               const isSpecial = r.rewardType !== "None";
               return (
                  <div key={r.level} className={`flex gap-6 relative mb-8 ${r.isUnlocked ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                     
                     {/* Node */}
                     <div className="relative z-10 pt-1 shrink-0">
                        {r.isCurrent && (
                           <div className="absolute -inset-2 bg-flx-teal/20 rounded-full animate-ping" />
                        )}
                        <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center font-black font-mono text-xs
                            ${r.isUnlocked ? (isSpecial ? 'bg-yellow-400 border-black text-black' : 'bg-flx-teal border-black text-black') : 'bg-[#111] border-[#333] text-gray-500'}`}
                        >
                           {r.level}
                        </div>
                     </div>
                     
                     {/* Content */}
                     <div className={`flex-1 rounded-2xl p-5 border ${r.isUnlocked ? 'bg-white/5 border-white/20' : 'bg-transparent border-[#333]'} ${isSpecial && r.isUnlocked ? 'shadow-[0_0_20px_rgba(255,255,255,0.05)]' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                           <span className={`text-[10px] font-bold uppercase tracking-widest ${r.isUnlocked ? (isSpecial ? 'text-yellow-400' : 'text-flx-teal') : 'text-gray-600'}`}>
                              {isSpecial ? r.rewardType : 'Base Reward'}
                           </span>
                           {r.isUnlocked ? <Unlock className="w-3 h-3 text-gray-400" /> : <Lock className="w-3 h-3 text-[#333]" />}
                        </div>
                        <h4 className="font-bold text-sm tracking-tight mb-2 text-white leading-snug">{r.rewardDescription}</h4>
                        <span className="text-[10px] font-mono text-gray-500">{r.requiredPoints} XP Required</span>
                     </div>
                  </div>
               )
            })}
         </div>

      </div>
    </div>
  );
}
