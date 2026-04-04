"use client";


import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { claimMysteryBox } from "@/app/actions/clientActions";
import confetti from "canvas-confetti";

export function MysteryBoxBanner({ count }: { count: number }) {
  const [loading, setLoading] = useState(false);
  const [won, setWon] = useState<{ name: string; points: number } | null>(null);

  async function handleClaim() {
    if (loading) return;
    setLoading(true);
    setWon(null);

    const res = await claimMysteryBox();
    if (res.success) {
      setWon({ name: res.rewardName!, points: res.rewardPoints! });
      
      // Fire confetti animation natively
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
    }
    
    setLoading(false);
  }

  if (won) {
     return (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-5 mb-6 shadow-xl border border-yellow-300 relative overflow-hidden animate-in zoom-in duration-500">
           <div className="text-center relative z-10">
              <span className="text-4xl block mb-2">🎉</span>
              <h3 className="text-white font-black text-2xl uppercase tracking-widest">{won.name}</h3>
              <p className="text-yellow-100 text-sm font-bold opacity-90 mt-1">Enjoy your new FLX points!</p>
           </div>
        </div>
     );
  }

  return (
    <button 
      onClick={handleClaim} 
      disabled={loading}
      className={`w-full text-left bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-4 mb-6 shadow-lg border border-purple-400/50 relative overflow-hidden flex items-center justify-between ${loading ? 'opacity-80' : 'cursor-pointer hover:scale-[1.02] active:scale-95'} transition-all`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none"></div>
      <div className="relative z-10 flex items-center gap-4">
         <div className={`text-3xl pt-1 ${loading ? 'animate-spin' : 'animate-bounce'}`}>{loading ? '🔮' : '🎁'}</div>
         <div>
            <h3 className="text-white font-black text-lg leading-tight uppercase tracking-wider">{loading ? 'Opening...' : 'Mystery Gift Unlocked!'}</h3>
            <p className="text-purple-100 text-xs mt-0.5">{loading ? 'Rolling the dice...' : `Tap to open (${count} available)`}</p>
         </div>
      </div>
      <ChevronRight className={`text-white w-6 h-6 opacity-70 ${loading ? 'hidden' : ''}`} />
    </button>
  );
}
