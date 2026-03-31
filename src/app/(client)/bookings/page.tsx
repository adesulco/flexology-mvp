"use client";

import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { CalendarClock, MapPin, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Bookings() {
  return (
    <div className="flex flex-col min-h-full">
      <Header />
      
      <motion.div 
        className="px-6 py-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold tracking-tight text-black">My Bookings</h2>
           <div className="bg-flx-card rounded-full p-1 border border-flx-border flex items-center">
              <button className="px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold transition-all shadow-sm">Upcoming</button>
              <button className="px-4 py-1.5 rounded-full text-flx-text-muted hover:text-black text-xs font-bold transition-all">Past</button>
           </div>
        </div>

        <div className="flex flex-col gap-4">
           {/* Empty State */}
           <div className="bg-white border border-flx-border border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center mt-4">
               <div className="w-16 h-16 rounded-full bg-flx-card border border-flx-border flex items-center justify-center mb-4">
                 <CalendarClock className="w-8 h-8 text-black" />
               </div>
               <h3 className="text-lg font-bold text-black mb-2">No upcoming sessions</h3>
               <p className="text-sm text-flx-text-muted max-w-[200px] mb-6">Book a session to start your recovery journey today.</p>
               <Link href="/book">
                  <button className="bg-black text-white font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 hover:bg-black/90 transition-colors shadow-lg active:scale-[0.98]">
                     Book Now <ArrowRight className="w-4 h-4 -mr-1" />
                  </button>
               </Link>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
