"use client";

import { useState } from "react";
import { register } from "@/app/actions/authActions";
import Link from "next/link";
import { Copyleft } from "lucide-react";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await register(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white py-12">
      <div className="w-16 h-16 bg-black flex items-center justify-center rounded-2xl mb-8 shadow-xl">
        <Copyleft className="w-8 h-8 text-flx-teal" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Create Account</h1>
      <p className="text-sm text-flx-text-muted mb-8 text-center max-w-[280px]">Join Flexology to book sessions and earn rewards.</p>

      {error && <div className="p-3 w-full bg-red-50 text-red-600 rounded-xl mb-4 text-sm font-medium text-center border border-red-100">{error}</div>}

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="text-xs font-bold text-flx-text uppercase tracking-widest pl-1">Full Name</label>
          <input type="text" name="name" required className="w-full mt-1 p-4 bg-flx-card border border-flx-border rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" placeholder="John Doe" />
        </div>
        <div>
          <label className="text-xs font-bold text-flx-text uppercase tracking-widest pl-1">Email</label>
          <input type="email" name="email" required className="w-full mt-1 p-4 bg-flx-card border border-flx-border rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" placeholder="you@example.com" />
        </div>
        <div>
          <label className="text-xs font-bold text-flx-text uppercase tracking-widest pl-1">Mobile Number <span className="text-[10px] text-gray-400 font-normal lowercase">(optional)</span></label>
          <input type="tel" name="phone" className="w-full mt-1 p-4 bg-flx-card border border-flx-border rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" placeholder="0812-3456-7890" />
        </div>
        <div>
           <label className="text-xs font-bold text-flx-text uppercase tracking-widest pl-1">Password</label>
           <input type="password" name="password" required className="w-full mt-1 p-4 bg-flx-card border border-flx-border rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-black/90 active:scale-[0.98] transition-all flex items-center justify-center h-14 mt-4">
           {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Register Account"}
        </button>
      </form>

      <div className="mt-8 text-sm">
        <span className="text-flx-text-muted">Already have an account? </span>
        <Link href="/login" className="font-bold border-b border-black text-black">Sign In</Link>
      </div>
    </div>
  );
}
