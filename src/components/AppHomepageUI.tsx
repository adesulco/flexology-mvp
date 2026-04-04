"use client";


import { Header } from "@/components/Header";
import { motion, Variants } from "framer-motion";
import { MapPin, Home as HomeIcon, ChevronRight, CalendarClock, ArrowRight, Flame, Trophy, Award, Zap, Leaf } from "lucide-react";
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

export function AppHomepageUI({ user, lastBooking, tenant }: { user?: any, lastBooking?: any, tenant?: any }) {
  const router = useRouter();
  const { setMode, setLocation, setService, setFlexologist, setHomeAddress } = useBookingStore();
  
  const handleBookingSelect = (mode: 'outlet' | 'home') => {
    setMode(mode);
    router.push("/book");
  };

  const handleQuickRebook = () => {
     if (!lastBooking) return;
     setMode(lastBooking.mode.toLowerCase() as any);
     if (lastBooking.location) setLocation(lastBooking.location);
     if (lastBooking.service) setService(lastBooking.service);
     if (lastBooking.flexologist) setFlexologist(lastBooking.flexologist);
     if (lastBooking.homeAddress) setHomeAddress(lastBooking.homeAddress, lastBooking.homeMapLink || undefined);
     
     router.push("/book?step=3"); // Target Date/Time directly
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header points={user?.points || 0} />
      
      <motion.div 
        className="px-6 py-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {user && (
           <section className="mb-8">
             <motion.div variants={itemVariants} className="flex gap-3 mb-6">
                
                {/* Streak Card */}
                <div className="flex-1 bg-white border border-flx-border rounded-3xl p-5 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 blur-2xl rounded-full translate-x-8 -translate-y-8" />
                   <div className="flex items-center gap-3 mb-2 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                         <Flame className={`w-5 h-5 ${user.currentStreak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
                      </div>
                      <div>
                         <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Wellness Streak</span>
                         <h3 className="text-xl font-bold font-mono tracking-tight text-black">{user.currentStreak || 0} <span className="text-sm font-sans text-gray-500 font-medium">Weeks</span></h3>
                      </div>
                   </div>
                   <div className="w-full h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden relative z-10">
                      <div className="h-full bg-orange-500 w-[60%]" style={{ width: user.currentStreak > 0 ? '100%' : '20%' }} />
                   </div>
                </div>

                {/* Trophy Card */}
                <div className="flex-1 bg-white border border-flx-border rounded-3xl p-5 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-flx-teal/20 blur-2xl rounded-full translate-x-8 -translate-y-8" />
                   <div className="flex items-center gap-3 mb-2 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-flx-teal/10 border border-flx-teal/20 flex items-center justify-center">
                         <Trophy className="w-5 h-5 text-flx-teal" />
                      </div>
                      <div>
                         <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Trophy Case</span>
                         <h3 className="text-xl font-bold font-mono tracking-tight text-black">{user.badges?.length || 0} <span className="text-sm font-sans text-gray-500 font-medium">Badges</span></h3>
                      </div>
                   </div>
                   <div className="flex gap-[-8px] mt-4 relative z-10 space-x-[-12px]">
                      {(user.badges?.length > 0 ? user.badges : ['locked', 'locked', 'locked']).slice(0, 3).map((b: string, i: number) => (
                         <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${b === 'locked' ? 'bg-gray-100' : 'bg-gradient-to-br from-yellow-300 to-yellow-500'}`}>
                            {b === 'locked' ? <div className="w-2 h-2 rounded-full bg-gray-300" /> : <Award className="w-4 h-4 text-white drop-shadow" />}
                         </div>
                      ))}
                      {user.badges?.length > 3 && (
                         <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm bg-gray-900 text-white text-[10px] font-bold">
                            +{user.badges.length - 3}
                         </div>
                      )}
                   </div>
                </div>

             </motion.div>
           </section>
        )}

        {/* Phase 3: Seasonal Wellness Pass Banner */}
        {user && (
           <section className="mb-8">
              <Link href="/pass">
                 <motion.div 
                    variants={itemVariants}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-[#111] to-black border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex items-center justify-between group cursor-pointer"
                 >
                    <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-gradient-to-l from-flx-teal/10 to-transparent pointer-events-none group-hover:from-flx-teal/20 transition-colors" />
                    
                    <div className="relative z-10">
                       <span className="text-[10px] text-flx-teal uppercase tracking-widest font-bold">Evergreen Pass</span>
                       <h3 className="text-xl font-bold tracking-tight text-white leading-none mt-1">Recovery Pass</h3>
                       <p className="text-xs text-gray-400 mt-2 font-medium">Level up. Earn exclusive rewards.</p>
                       
                       <div className="mt-4 flex items-center gap-3">
                          <div className="text-[10px] uppercase font-bold text-gray-500 bg-white/10 px-2 py-1 rounded">
                             {Math.floor((user?.points || 0) / 50000) + 1 >= 20 ? 'Lvl. MAX' : `Lvl. ${Math.floor((user?.points || 0) / 50000) + 1}`}
                          </div>
                          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-flx-teal" style={{ width: `${Math.min(((user?.points || 0) % 50000) / 50000 * 100, 100)}%` }} />
                          </div>
                       </div>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center relative z-10 group-hover:bg-white group-hover:text-black transition-all">
                       <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
                    </div>
                 </motion.div>
              </Link>
           </section>
        )}

        {/* Phase 4: 1-Click Urban Company Rebooking Engine */}
        {lastBooking && (
           <section className="mb-8">
              <motion.div variants={itemVariants} className="flex justify-between items-end mb-4">
                 <h2 className="text-xl tracking-tight font-semibold text-flx-text">Quick Rebook</h2>
              </motion.div>
              <motion.div 
                 variants={itemVariants}
                 whileTap={{ scale: 0.98 }}
                 onClick={handleQuickRebook}
                 className="w-full bg-white border border-flx-border rounded-3xl p-5 shadow-sm relative overflow-hidden flex items-center justify-between group cursor-pointer hover:border-black transition-colors"
              >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-flx-teal/5 blur-2xl rounded-full translate-x-10 -translate-y-10" />
                 
                 <div className="flex items-center gap-4 relative z-10 w-full">
                    <div className="w-12 h-12 rounded-full bg-flx-card flex items-center justify-center border border-flx-border shrink-0 text-black">
                       <Zap className="w-6 h-6 fill-flx-teal text-flx-teal" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h3 className="text-lg font-bold text-black mb-0.5 truncate">{lastBooking.service?.name}</h3>
                       <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500 font-medium">
                          <span className="truncate">{lastBooking.mode === 'OUTLET' ? `📍 ${lastBooking.location?.name}` : `🏡 ${lastBooking.homeAddress}`}</span>
                          <span className="hidden sm:inline text-gray-300">•</span>
                          <span className="truncate">💆 {lastBooking.flexologist?.name || "Any Therapist"}</span>
                       </div>
                    </div>
                 </div>

                 <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center relative z-10 shrink-0 shadow-md">
                    <ChevronRight className="w-4 h-4" />
                 </div>
              </motion.div>
           </section>
        )}

        {/* Quick Actions / Modes */}
        <section className="mb-2">
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
            
            <motion.div 
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              className="bg-flx-teal/5 border border-flx-teal/20 rounded-2xl p-5 flex items-center justify-between opacity-100 cursor-pointer hover:bg-flx-teal/10 transition-colors group mt-2"
            >
              <Link href="/garden" className="flex items-center justify-between w-full">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-flx-teal/10 flex items-center justify-center border border-flx-teal/30">
                     <Leaf className="w-5 h-5 text-flx-teal" />
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-flx-teal mb-0.5">Zen Sanctuary</h3>
                     <div className="flex items-center gap-2">
                       <p className="text-xs text-flx-teal/70">Visualize your wellness journey</p>
                     </div>
                   </div>
                 </div>
                 <ChevronRight className="w-5 h-5 text-flx-teal group-hover:translate-x-1 transition-transform" />
              </Link>
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
