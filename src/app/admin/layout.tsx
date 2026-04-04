import Link from "next/link";
import { Copyleft, LogOut } from "lucide-react"; // Dummy icon for flexology

import { getSession } from "@/lib/auth";
import SignOutButton from "./components/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const isSuper = session?.role === "SUPER_ADMIN" || session?.role === "GLOBAL_MANAGER";

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-black text-white p-6 md:min-h-screen border-b md:border-b-0 md:border-r border-white/10 shrink-0">
         <div className="flex items-center gap-3 mb-8">
           <Copyleft className="w-8 h-8 text-flx-teal" />
           <div className="flex items-end gap-2">
              <h1 className="text-xl font-bold tracking-tight leading-none">Flex Admin</h1>
              <span className="text-[10px] font-mono text-gray-500 font-bold bg-white/10 px-1.5 py-0.5 rounded leading-none mb-0.5">v0.9.0</span>
           </div>
         </div>
         <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {isSuper && (
               <Link href="/admin" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-white font-medium whitespace-nowrap transition-colors">
                 Executive Dashboard
               </Link>
            )}
            <Link href="/admin/schedule" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-white font-medium whitespace-nowrap transition-colors">
              Operations Pipeline
            </Link>
            <Link href="/pos" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-white font-medium whitespace-nowrap transition-colors">
              Point of Sale
            </Link>
            {isSuper && (
               <>
                 <Link href="/admin/staff" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-white font-medium whitespace-nowrap transition-colors">
                   Staff Management
                 </Link>
                 <Link href="/admin/outlets" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-white font-medium whitespace-nowrap transition-colors">
                   Outlets Management
                 </Link>
                 <Link href="/admin/settings" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-white font-medium whitespace-nowrap transition-colors">
                   System Variables
                 </Link>
               </>
            )}
            <Link href="/" className="block px-4 py-2 mt-4 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">
              ← Client Facing Shell
            </Link>
            <div className="mt-8 md:mt-auto pt-4 border-t border-white/10 w-full space-y-0">
               <SignOutButton />
            </div>
         </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8 min-h-[calc(100vh-80px)] md:min-h-screen overflow-x-hidden">
          {children}
      </main>
    </div>
  );
}
