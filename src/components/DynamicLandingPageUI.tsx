"use client";


import dynamic from 'next/dynamic';
import Image from 'next/image';

function LandingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative overflow-hidden selection:bg-flx-teal selection:text-black">
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-[480px] mx-auto min-h-screen">
         <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(255,255,255,0.1)] border border-white/10">
            <Image src="/logo.png" alt="Flex Logo" width={80} height={80} className="w-[80%] h-auto object-contain" priority />
         </div>
         <div className="w-full flex flex-col items-center text-center mb-12">
           <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
             Unlock Your <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">True Potential</span>
           </h1>
           <div className="h-4 w-48 bg-white/20 rounded animate-pulse" />
         </div>
         <div className="w-full h-14 bg-white/10 rounded-full animate-pulse" />
      </main>
    </div>
  );
}

export const DynamicLandingPageUI = dynamic(
  () => import('./LandingPageUI').then(mod => mod.LandingPageUI),
  {
    ssr: false,
    loading: () => <LandingSkeleton />
  }
);
