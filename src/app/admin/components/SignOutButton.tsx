"use client";

import { LogOut } from "lucide-react";

export default function SignOutButton() {
    async function handleSignOut(e: React.MouseEvent) {
      e.preventDefault();
      await fetch('/api/auth/signout', { method: 'POST' });
      document.cookie = 'flex_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/';
    }

    return (
       <button onClick={handleSignOut} className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 font-bold tracking-tight transition-all text-sm group">
         Sign Out
         <LogOut className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
       </button>
    );
}
