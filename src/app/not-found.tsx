import Link from "next/link";
import { Activity } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 selection:bg-flx-teal selection:text-black">
       <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-flx-teal/10 via-black to-black pointer-events-none" />
       <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-8 relative z-10 p-5 mt-[-10vh]">
          <Activity className="w-12 h-12 text-flx-teal animate-pulse" />
       </div>
       <h1 className="text-6xl font-black text-white tracking-tighter mb-4 relative z-10">404</h1>
       <h2 className="text-xl font-bold text-gray-300 mb-6 relative z-10">Lost in the Void</h2>
       <p className="text-gray-500 max-w-sm mb-10 relative z-10">
         We couldn't find the page you were looking for. The route might have been moved, deleted, or never existed at all.
       </p>
       <Link href="/" className="px-8 py-3 bg-white text-black font-extrabold uppercase tracking-wide rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] relative z-10">
         Return to Base
       </Link>
    </div>
  );
}
