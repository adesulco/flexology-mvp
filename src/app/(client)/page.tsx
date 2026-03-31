"use client";

import { Header } from "@/components/Header";
import { motion, Variants } from "framer-motion";
import { MapPin, Home as HomeIcon, ChevronRight, CalendarClock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/useBookingStore";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
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

export default function Home() {
  const router = useRouter();
  const { setMode } = useBookingStore();
  
  const handleBookingSelect = (mode: 'outlet' | 'home') => {
    setMode(mode);
    router.push("/book");
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header />
      
      <motion.div 
        className="px-6 py-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Quick Actions / Modes */}
        <section className="mb-8">
          <motion.h2 variants={itemVariants} className="text-xl tracking-tight font-semibold text-flx-text mb-4">
            How would you like to recover?
          </motion.h2>
          
          <div className="flex flex-col gap-3">
            <motion.div 
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBookingSelect('outlet')}
              className="bg-black text-white rounded-2xl p-5 flex items-center justify-between shadow-xl relative overflow-hidden group cursor-pointer block focus:outline-none focus-visible:ring-2 focus-visible:ring-flx-teal"
            >
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none group-hover:from-white/20 transition-colors" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-flx-border">
                    <MapPin className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-0.5">Book at Outlet</h3>
                    <p className="text-xs text-gray-400">Visit a partner studio or clinic</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white backdrop-blur-md flex items-center justify-center border border-flx-border relative z-10">
                  <ChevronRight className="w-4 h-4 text-black" />
                </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBookingSelect('home')}
              className="bg-flx-dark border border-flx-border rounded-2xl p-5 flex items-center justify-between opacity-100 cursor-pointer hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-flx-card border border-flx-border flex items-center justify-center">
                  <HomeIcon className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-flx-text mb-0.5">At-Home Service</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-flx-text-muted">Therapist dispatched to you</p>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
            </motion.div>
          </div>
        </section>

        {/* Upcoming Bookings */}
        <section className="mb-8">
          <motion.div variants={itemVariants} className="flex justify-between items-end mb-4">
            <h2 className="text-xl tracking-tight font-semibold text-flx-text">Upcoming</h2>
            <Link href="/bookings" className="text-xs text-black font-bold uppercase tracking-wider hover:underline inline-flex items-center">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-flx-card border border-flx-border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 rounded-full bg-flx-dark border border-flx-border flex items-center justify-center mb-3">
               <CalendarClock className="w-5 h-5 text-black" />
             </div>
             <p className="text-sm font-bold text-flx-text mb-1">No upcoming sessions</p>
             <p className="text-xs text-flx-text-muted max-w-[200px]">Book a session to start your recovery journey today.</p>
          </motion.div>
        </section>

        {/* Memberships */}
        <section>
          <motion.div variants={itemVariants} className="flex justify-between items-end mb-4">
             <h2 className="text-xl tracking-tight font-semibold text-flx-text">Membership</h2>
          </motion.div>
          <motion.div 
            variants={itemVariants}
            className="rounded-2xl p-6 relative overflow-hidden bg-black border border-flx-border"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 blur-3xl rounded-full translate-x-10 -translate-y-10" />
            <div className="relative z-10">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 block">Unlock Perks</span>
              <h3 className="text-2xl font-bold text-white mb-2 font-mono tracking-tight">FLEX PLUS</h3>
              <p className="text-sm text-gray-300 mb-6 max-w-[80%]">Get 2x 45-min sessions monthly & 15% off all retail and add-on services.</p>
              
              <Link href="/rewards">
                <button className="bg-white text-black text-sm font-bold px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors w-full flex items-center justify-center shadow-lg border border-black/10">
                  Explore Tiers
                </button>
              </Link>
            </div>
          </motion.div>
        </section>
        
      </motion.div>
    </div>
  );
}
