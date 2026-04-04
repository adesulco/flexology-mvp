"use client";
import { formatRate } from "@/lib/format";


import { useState } from "react";
import { register } from "@/app/actions/authActions";
import Link from "next/link";
import { Copyleft } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import { formatRupiah } from "@/lib/format";

export default function RegisterFormClient({ bonus }: { bonus: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const rawBonus = parseInt(bonus, 10);

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
      <div className="w-20 h-20 bg-black flex items-center justify-center rounded-2xl mb-8 shadow-xl overflow-hidden p-3 border border-gray-800">
        <img src="/logo.png" alt="Flexology" className="w-full h-full object-contain" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Create Account</h1>
      
      <div className="bg-gradient-to-r from-teal-50 to-green-50 border border-teal-200 p-4 rounded-2xl w-full mb-8 flex items-center gap-3 shadow-sm">
         <div className="bg-flx-teal/20 p-2 rounded-xl text-flx-teal animate-pulse">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
         </div>
         <div>
            <h3 className="font-bold text-gray-900 leading-tight">{formatRate(rawBonus)} FLX Points Bonus!</h3>
            <p className="text-xs text-gray-600">Register today and instantly receive a {formatRupiah(rawBonus)} value toward your first booking.</p>
         </div>
      </div>

      {error && <div className="p-3 w-full bg-red-50 text-red-600 rounded-xl mb-4 text-sm font-medium text-center border border-red-100">{error}</div>}

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="text-xs font-bold text-flx-text uppercase tracking-widest pl-1">Full Name</label>
          <input type="text" name="name" required className="w-full mt-1 p-4 bg-flx-card border border-flx-border rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" placeholder="John Doe" />
        </div>
        <div>
          <label className="text-xs font-bold text-flx-text uppercase tracking-widest pl-1">Mobile Number</label>
          <input type="tel" name="phone" required autoComplete="tel" className="w-full mt-1 p-4 bg-flx-card border border-flx-border rounded-xl focus:ring-1 focus:ring-black outline-none transition-all" placeholder="0812-3456-7890" />
        </div>
        <div>
          <label className="text-xs font-bold text-flx-text uppercase tracking-widest pl-1">Password</label>
          <PasswordInput />
        </div>
        <div>
          <label className="text-xs font-bold text-flx-text uppercase tracking-widest pl-1">Referral Code (Optional)</label>
          <input type="text" name="referralCode" className="w-full mt-1 p-4 bg-flx-card border border-flx-border rounded-xl focus:ring-1 focus:ring-black outline-none transition-all font-mono placeholder:font-sans" placeholder="e.g. FLEX-XYZ" />
        </div>
        
        <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-4 rounded-xl mt-4 hover:bg-gray-900 active:scale-[0.98] transition-all shadow-lg flex justify-center items-center">
          {loading ? "Creating Account..." : "Join Flexology Network"}
        </button>
      </form>

      <p className="text-sm text-flx-text-muted mt-8">
        Already have an account? <Link href="/login" className="text-black font-bold hover:underline">Sign In</Link>
      </p>
    </div>
  );
}
