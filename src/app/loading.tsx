"use client";


import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-md z-[9999] flex flex-col items-center justify-center min-h-[100dvh]">
      <div className="relative flex flex-col items-center justify-center animate-pulse">
         {/* Using the CSS variable injected by layout.tsx! */}
         <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--color-brand)' }}>
            <div className="absolute inset-0 bg-black/10"></div>
            <Activity className="w-10 h-10 text-white relative z-10 animate-bounce" />
         </div>
         <div className="mt-6 font-black tracking-widest uppercase text-xs text-gray-400">Loading Jemari...</div>
      </div>
    </div>
  );
}
