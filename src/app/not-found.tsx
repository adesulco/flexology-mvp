"use client"

import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full relative overflow-hidden">
         {/* Top Color Bar matching Tenant */}
         <div className="absolute top-0 left-0 right-0 h-2 bg-[var(--color-brand)]"></div>
         
         <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-gray-400" />
         </div>
         
         <h1 className="text-3xl font-black text-gray-900 mb-2">Not Found.</h1>
         <p className="text-gray-500 mb-8 leading-relaxed">
            The wellness therapy or page you are looking for has been removed or does not exist on this sub-domain.
         </p>
         
         <Link 
            href="/" 
            className="flex items-center justify-center gap-2 w-full py-4 text-white font-bold rounded-xl active:scale-95 transition-transform"
            style={{ backgroundColor: 'var(--color-brand)' }}
         >
            <ArrowLeft className="w-4 h-4" /> Return Home
         </Link>

         {/* Jemari Platform Watermark */}
         <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-8 flex justify-center items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand)] opacity-50"></span>
            Powered by Jemari App
         </p>
      </div>
    </div>
  );
}
