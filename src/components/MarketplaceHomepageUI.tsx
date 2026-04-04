"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/formatters";
import { Search, Flame, Star, ChevronRight, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function MarketplaceHomepageUI({ brands, services }: { brands: any[], services: any[] }) {
   const router = useRouter();

   return (
      <div className="min-h-screen bg-gray-50 pb-24 text-gray-900 overflow-x-hidden">
         
         {/* Global Platform Header */}
         <header className="bg-blue-600 text-white relative overflow-hidden pb-12 rounded-b-[40px] shadow-lg">
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            
            <div className="relative z-10 px-6 pt-12 pb-6 flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                     <Flame className="w-6 h-6 text-blue-600" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight">Jemari Platform</h1>
               </div>
               
               <Link href="/login" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-bold backdrop-blur-md transition-colors">
                  Universal ID
               </Link>
            </div>

            <div className="relative z-10 px-6 mt-4">
               <h2 className="text-3xl font-black mb-2 leading-tight">
                  Discover ultimate<br />wellness in Indonesia.
               </h2>
               <p className="text-blue-100 mb-8 max-w-sm">
                  One wallet. Zero friction. Book premium massages, recovery, and studio classes across our authenticated ecosystem.
               </p>

               <div className="bg-white p-2 flex items-center rounded-2xl shadow-xl max-w-md">
                  <div className="text-gray-400 pl-3"><Search className="w-5 h-5" /></div>
                  <input type="text" placeholder="Search for 'Deep Tissue Massage'..." className="w-full p-3 outline-none text-gray-900 placeholder:text-gray-400 font-bold bg-transparent" />
                  <button className="bg-gray-900 text-white p-3 rounded-xl font-bold active:scale-95 transition-transform hover:bg-black">
                     Search
                  </button>
               </div>
            </div>
         </header>

         <main className="px-6 py-8 space-y-10">
            
            {/* Top Ecosystem Brands */}
            <section>
               <div className="flex justify-between items-end mb-4">
                  <div>
                     <h3 className="text-xl font-black text-gray-900">Official Partners</h3>
                     <p className="text-gray-500 text-sm">Top-rated branch networks</p>
                  </div>
                  <div className="text-sm font-bold text-blue-600 flex items-center">
                     View All <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
               </div>
               
               <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                  {brands.map((b) => (
                     <a 
                       key={b.id} 
                       href={`https://${b.slug}.jemariapp.com`}
                       className="flex-shrink-0 w-[280px] snap-center bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer"
                     >
                        <div className="h-28 w-full bg-gray-100 relative" style={{ backgroundColor: b.primaryColor }}>
                           <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                           {/* Fake Logo Overlay */}
                           <div className="absolute bottom-4 left-4 w-12 h-12 bg-white rounded-xl shadow border border-gray-100 flex items-center justify-center text-xl font-black">
                              {b.name.substring(0, 1)}
                           </div>
                        </div>
                        <div className="p-4 pt-4">
                           <h4 className="font-bold text-gray-900 text-lg mb-1">{b.name}</h4>
                           <div className="flex gap-2 items-center text-xs font-bold text-gray-500">
                              <span className="flex items-center text-orange-500 gap-1"><Star className="w-3 h-3 fill-current" /> 4.9</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Jakarta</span>
                           </div>
                        </div>
                     </a>
                  ))}
               </div>
            </section>

            {/* Global Catalog Feed */}
            <section>
               <div className="flex justify-between items-end mb-4">
                  <div>
                     <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        Trending Services <Sparkles className="w-4 h-4 text-blue-600" />
                     </h3>
                     <p className="text-gray-500 text-sm">Most booked across the network</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((s, idx) => (
                     <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={s.id} 
                        onClick={() => {
                           // Deep Link Magic: Handoff to Tenant Domain with Service ID targeted
                           window.location.href = `https://${s.tenant?.slug}.jemariapp.com/book?service=${s.id}`;
                        }}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all group"
                     >
                        <div className="w-24 h-24 rounded-xl flex items-center justify-center font-bold text-2xl bg-gray-100 shrink-0" style={{ color: s.tenant?.primaryColor }}>
                           {s.name.substring(0,2)}
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                           <div>
                              <div className="flex justify-between items-start">
                                 <h4 className="font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">{s.name}</h4>
                                 <div className="text-sm font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md whitespace-nowrap ml-2">
                                    {formatCurrency(s.price)}
                                 </div>
                              </div>
                              <p className="text-xs text-gray-500 flex items-center gap-1.5 font-bold">
                                 Provided by <span style={{ color: s.tenant?.primaryColor }}>{s.tenant?.name || "Jemari"}</span>
                              </p>
                           </div>
                           <div className="flex items-center justify-between mt-2">
                              <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg flex items-center gap-1">
                                 {s.duration} mins
                              </span>
                              <div className="text-xs font-bold text-blue-600 group-hover:underline">
                                 Deep Link Book &rarr;
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </div>
            </section>

            {/* Jemari Universal Wallet CTA */}
            <div className="bg-gray-900 rounded-2xl p-6 text-white text-center relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/30 rounded-full blur-3xl"></div>
               <h3 className="text-xl font-bold mb-2 relative z-10">One Wallet. Infinite Value.</h3>
               <p className="text-gray-400 text-sm mb-6 relative z-10">Earn Universal FLX points at any brand, and spend them everywhere.</p>
               <button className="mx-auto bg-white text-black font-bold px-6 py-3 rounded-full text-sm active:scale-95 transition-transform flex items-center gap-2">
                  <Star className="w-4 h-4 fill-black" /> Create Jemari Account
               </button>
            </div>

         </main>
      </div>
   );
}
