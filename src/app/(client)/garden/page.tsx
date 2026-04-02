import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { redirect } from "next/navigation";
import { ChevronLeft, Share, Leaf, Sparkles, Droplets } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default async function ZenGardenPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { points: true, currentStreak: true, longestStreak: true, name: true }
  });

  if (!user) redirect("/login");

  const points = user.points;
  const streak = user.currentStreak;

  // Determine stage based on XP
  let stageName = "Zen Seed";
  let stageDescription = "Your journey has just begun. Keep recovering to grow your sanctuary.";
  let stageLevel = 1;

  if (points > 500) {
    stageName = "Flex Sapling";
    stageDescription = "Your body is starting to adapt. The roots are taking hold.";
    stageLevel = 2;
  }
  if (points > 2000) {
    stageName = "Recovery Bonsai";
    stageDescription = "A master of balance and endurance. You are in peak condition.";
    stageLevel = 3;
  }
  if (points > 5000) {
    stageName = "Eternal Willow";
    stageDescription = "An unbreakable foundation. Your wellness journey is legendary.";
    stageLevel = 4;
  }

  return (
    <div className="flex flex-col min-h-full bg-[#050B08] text-white overflow-hidden relative">
      {/* Dynamic Background Aura based on streak */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-40 transition-all duration-1000"
        style={{ 
          background: streak > 1 
            ? `radial-gradient(circle, rgba(12,242,212,0.${Math.min(streak + 2, 8)}), transparent 70%)` 
            : 'radial-gradient(circle, rgba(30,50,45,0.8), transparent 70%)' 
        }}
      />

      <Header points={user.points} />
      
      <div className="px-6 py-6 pb-24 max-w-lg mx-auto w-full relative z-10 flex flex-col h-full flex-1">
         <div className="mb-8 flex justify-between items-center">
            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm font-bold">
               <ChevronLeft className="w-4 h-4 mr-1" /> Dashboard
            </Link>
            <button className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-md transition-colors border border-white/10">
               <Share className="w-4 h-4" />
            </button>
         </div>

         <div className="text-center mb-12">
            <span className="text-[10px] text-flx-teal uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 mb-2">
               <Leaf className="w-3 h-3" /> Level {stageLevel} Sanctuary
            </span>
            <h1 className="text-4xl font-black tracking-tighter text-white leading-none mb-3">Your Zen Garden</h1>
            <p className="text-gray-400 text-sm max-w-[280px] mx-auto leading-relaxed">{stageDescription}</p>
         </div>

         {/* The Growth Visualizer Canvas */}
         <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] relative mb-12">
            
            {/* The Soil */}
            <div className="absolute bottom-0 w-48 h-12 bg-gradient-to-t from-[#1A1A1A] to-[#252525] rounded-[100%] border-t border-white/5 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-0" />
            
            {/* Stage 1: Seed */}
            {stageLevel === 1 && (
               <div className="relative z-10 animate-pulse flex items-center justify-center h-full w-full">
                  <div className="w-4 h-4 bg-flx-teal rounded-full shadow-[0_0_20px_rgba(12,242,212,0.8)] translate-y-24" />
               </div>
            )}

            {/* Stage 2: Sapling */}
            {stageLevel === 2 && (
               <div className="relative z-10 flex flex-col items-center justify-end h-full w-full pb-4">
                  <div className="w-16 h-16 bg-gradient-to-tr from-flx-teal to-green-400 rounded-full opacity-80 blur-md absolute bottom-12" />
                  <div className="w-2 h-16 bg-gradient-to-t from-[#4f3a2b] to-[#6a4f3a] rounded-t-full relative z-10" />
                  <div className="w-12 h-12 bg-flx-teal/90 rounded-t-full rounded-bl-full rotate-45 border border-white/20 absolute bottom-24 shadow-[0_0_30px_rgba(12,242,212,0.5)]" />
               </div>
            )}

            {/* Stage 3: Bonsai */}
            {stageLevel >= 3 && (
               <div className="relative z-10 flex flex-col items-center justify-end h-full w-full pb-4 shrink-0 scale-125 origin-bottom">
                  <div className="w-32 h-32 bg-flx-teal/20 rounded-full opacity-80 blur-xl absolute bottom-16 -z-10" />
                  {/* Trunk */}
                  <div className="w-4 h-24 bg-gradient-to-t from-[#36271c] to-[#4f3a2b] rounded-t-lg relative z-0">
                     <div className="absolute top-4 -right-6 w-8 h-2 bg-[#4f3a2b] rotate-12 rounded-full" />
                     <div className="absolute top-10 -left-6 w-8 h-2 bg-[#4f3a2b] -rotate-12 rounded-full" />
                  </div>
                  {/* Leaves */}
                  <div className="absolute bottom-24 flex items-center justify-center z-20">
                     <div className="w-16 h-16 bg-flx-teal rounded-full border border-white/20 absolute -translate-x-8 -translate-y-4 shadow-[0_0_20px_rgba(12,242,212,0.4)]" />
                     <div className="w-20 h-20 bg-[#0affd6] rounded-full border border-white/20 absolute shadow-[0_0_30px_rgba(10,255,214,0.6)]" />
                     <div className="w-16 h-16 bg-flx-teal rounded-full border border-white/20 absolute translate-x-8 -translate-y-2 shadow-[0_0_20px_rgba(12,242,212,0.4)]" />
                  </div>
               </div>
            )}

         </div>

         {/* Gamification Stats */}
         <div className="grid grid-cols-2 gap-4 mt-auto">
             <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
                 <div className="flex items-center gap-2 mb-2 text-flx-text-muted">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Total XP</span>
                 </div>
                 <h2 className="text-3xl font-mono font-black text-white">{points.toLocaleString()}</h2>
             </div>
             
             <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
                 <div className="flex items-center gap-2 mb-2 text-flx-text-muted">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">Wellness Streak</span>
                 </div>
                 <h2 className="text-3xl font-mono font-black text-white flex items-baseline gap-1">
                    {streak} <span className="text-[10px] text-gray-500 font-sans tracking-widest uppercase">Weeks</span>
                 </h2>
             </div>
         </div>
         
         {/* Share Button Placeholder */}
         <button className="w-full mt-6 bg-transparent border-2 border-white/10 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
            Share to Instagram Story
         </button>

      </div>
    </div>
  );
}
