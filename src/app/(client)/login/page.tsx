"use client";

import { useState } from "react";
import { login } from "@/app/actions/authActions";
import Link from "next/link";
import { Copyleft } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white">
      <div className="w-20 h-20 bg-black flex items-center justify-center rounded-2xl mb-8 shadow-xl overflow-hidden p-3 border border-gray-800">
        <img src="/logo.png" alt="Flexology" className="w-full h-full object-contain" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome Back</h1>
      <p className="text-sm text-flx-text-muted mb-8 text-center max-w-[280px]">Enter your mobile number and password to access your Flexology account.</p>

      {error && <div className="p-3 w-full bg-red-50 text-red-600 rounded-xl mb-4 text-sm font-medium text-center border border-red-100">{error}</div>}

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="text-xs font-bold text-flx-text uppercase tracking-widest pl-1">Mobile Number</label>
          <input type="tel" name="phone" required className="w-full mt-1 p-4 bg-flx-card border border-flx-border rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" placeholder="0812-3456-7890" />
        </div>
        <div>
           <label className="text-xs font-bold text-flx-text uppercase tracking-widest pl-1">Password</label>
           <input type="password" name="password" required className="w-full mt-1 p-4 bg-flx-card border border-flx-border rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-black/90 active:scale-[0.98] transition-all flex items-center justify-center h-14 mt-4">
           {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Sign In"}
        </button>
      </form>

      <div className="mt-8 text-sm">
        <span className="text-flx-text-muted">Don't have an account? </span>
        <Link href="/register" className="font-bold border-b border-black text-black">Register Now</Link>
      </div>
    </div>
  );
}
