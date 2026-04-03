"use client";

import { useState } from "react";
import { login } from "@/app/actions/authActions";
import { Eye, EyeOff, Activity } from "lucide-react";

export default function PosLoginClient() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-flx-teal/10 blur-[50px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col items-center mb-8 relative z-10">
         <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-flx-teal" />
         </div>
         <h1 className="text-3xl font-black tracking-tight text-white">POS Terminal</h1>
         <p className="text-sm text-gray-400 mt-2 font-medium">Flexology Outlet Management</p>
      </div>

      {error && <div className="p-4 w-full bg-red-900/30 text-red-200 border border-red-500/50 rounded-xl mb-6 text-sm font-medium text-center relative z-10">{error}</div>}

      <form onSubmit={handleSubmit} className="w-full space-y-5 relative z-10">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Admin Identity ID</label>
          <input type="text" name="phone" required className="w-full mt-2 p-4 bg-black/50 text-white border border-white/10 rounded-xl focus:ring-1 focus:ring-flx-teal focus:border-flx-teal outline-none transition-all placeholder:text-gray-600 font-mono" placeholder="Phone or Email Hash" />
        </div>
        <div>
           <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Passcode</label>
           <div className="relative mt-2">
             <input type={showPassword ? "text" : "password"} name="password" required className="w-full p-4 bg-black/50 text-white border border-white/10 rounded-xl focus:ring-1 focus:ring-flx-teal focus:border-flx-teal outline-none transition-all pr-12 font-mono" placeholder="••••••••" />
             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
             </button>
           </div>
        </div>
        
        <button type="submit" disabled={loading} className="w-full py-4 bg-white text-black font-extrabold tracking-wide uppercase rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center h-14 mt-8 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
           {loading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : "Authenticate Base"}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-gray-600 font-mono tracking-widest uppercase relative z-10 flex justify-center items-center gap-2">
         <span className="w-2 h-2 rounded-full bg-flx-teal animate-pulse" />
         Secure Edge Network connection validated
      </div>
    </div>
  );
}
