"use client";

import { motion, Variants } from "framer-motion";
import { Copyleft, ArrowRight, Activity, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export function LandingPageUI({ services = [], tenant }: { services?: any[], tenant?: any }) {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative overflow-hidden selection:bg-flx-teal selection:text-black">
      
      {/* Cinematic Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-flx-teal/20 via-black to-black opacity-60 pointer-events-none" />
      <div className="absolute top-10 right-10 w-64 h-64 bg-flx-teal/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-[480px] mx-auto min-h-screen">
         
         <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(255,255,255,0.1)] border border-white/10"
         >
            <img src="/logo.png" alt="Flex Logo" className="w-[80%] h-auto object-contain" />
         </motion.div>

         <motion.div
           variants={containerVariants}
           initial="hidden"
           animate="visible"
           className="w-full flex flex-col items-center text-center mb-12"
         >
           <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
             Unlock Your <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">True Potential</span>
           </motion.h1>
           <motion.p variants={itemVariants} className="text-gray-400 font-medium text-sm md:text-base max-w-[300px]">
             Premium sports recovery, targeted massage, and elite physical therapy.
           </motion.p>
         </motion.div>

         <motion.div 
           className="w-full space-y-4"
           variants={containerVariants}
           initial="hidden"
           animate="visible"
         >
           <motion.div variants={itemVariants}>
              <Link href="/book" className="w-full h-14 bg-white text-black font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] text-lg uppercase tracking-wide">
                 Book a Session
              </Link>
           </motion.div>
           <motion.div variants={itemVariants} className="flex gap-3 mt-4">
              <Link href="/register" className="w-1/2 h-12 bg-white/10 text-white font-bold text-sm rounded-xl flex items-center justify-center hover:bg-white/20 active:scale-[0.98] transition-all shadow-md">
                 Sign Up
              </Link>
              <Link href="/login" className="w-1/2 h-12 bg-transparent border border-white/20 text-white font-bold text-sm rounded-xl flex items-center justify-center hover:bg-white/5 active:scale-[0.98] transition-all">
                 Log In
              </Link>
           </motion.div>
         </motion.div>

         {/* Pre-Login Service Carousel Component */}
         {services.length > 0 && (
           <motion.div 
             className="w-full mt-12 mb-4"
             variants={containerVariants}
             initial="hidden"
             animate="visible"
           >
              <motion.div variants={itemVariants} className="flex items-center justify-between mb-4 w-full px-2">
                 <h2 className="text-white text-lg font-bold tracking-tight">Featured Services</h2>
                 <Link href="/book" className="text-[10px] text-flx-teal uppercase tracking-widest font-bold hover:underline">See All</Link>
              </motion.div>
              
              <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scrollbars -mx-6 px-6 sm:mx-0 sm:px-0">
                 {services.map((service, idx) => (
                    <motion.div 
                       key={service.id} 
                       variants={itemVariants}
                       className="snap-center shrink-0 w-[240px] bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md hover:bg-white/10 transition-colors group cursor-pointer"
                       onClick={() => router.push(`/book?service=${service.id}`)}
                    >
                       <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mb-4 relative overflow-hidden">
                          <div className="absolute inset-0 bg-flx-teal/20 group-hover:bg-flx-teal/40 transition-colors" />
                          <Activity className="w-5 h-5 text-flx-teal relative z-10" />
                       </div>
                       <h3 className="text-white font-bold text-lg mb-1 leading-tight">{service.name}</h3>
                       <div className="flex items-center gap-2 mb-4">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-400 font-medium">{service.duration} Min</span>
                       </div>
                       <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                          <span className="text-sm font-bold text-white font-mono">IDR {(service.price / 1000).toFixed(0)}K</span>
                          <ArrowRight className="w-4 h-4 text-flx-teal opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                       </div>
                    </motion.div>
                 ))}
              </div>
           </motion.div>
         )}

         {/* Feature Highlights */}
         <motion.div 
           className="w-full grid grid-cols-3 gap-2 mt-16"
           variants={containerVariants}
           initial="hidden"
           animate="visible"
         >
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
               <Activity className="w-5 h-5 text-flx-teal mb-2" />
               <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Recovery</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
               <MapPin className="w-5 h-5 text-flx-teal mb-2" />
               <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Studios</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
               <Sparkles className="w-5 h-5 text-flx-teal mb-2" />
               <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">At-Home</span>
            </motion.div>
         </motion.div>

      </main>
    </div>
  );
}
