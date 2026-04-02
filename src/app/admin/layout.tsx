import Link from "next/link";
import { Copyleft, LogOut } from "lucide-react"; // Dummy icon for flexology

import { getSession } from "@/lib/auth";
import { logout } from "@/app/actions/authActions";

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
           <h1 className="text-xl font-bold tracking-tight">Flex Admin</h1>
         </div>
         <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {isSuper && (
               <Link href="/admin" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-white font-medium whitespace-nowrap transition-colors">
                 Executive Dashboard
               </Link>
            )}
            <Link href="/admin/schedule" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-white font-medium whitespace-nowrap transition-colors">
              Bookings Pipeline
            </Link>
            {isSuper && (
               <>
                 <Link href="/admin/staff" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-white font-medium whitespace-nowrap transition-colors">
                   Staff Registry
                 </Link>
                 <Link href="/admin/outlets" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-white font-medium whitespace-nowrap transition-colors">
                   Outlets & Managers
                 </Link>
                 <Link href="/admin/settings" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-white font-medium whitespace-nowrap transition-colors">
                   System Variables
                 </Link>
               </>
            )}
            <Link href="/" className="block px-4 py-2 mt-4 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">
              ← Client Facing Shell
            </Link>
            <form action={logout} className="mt-8 md:mt-auto pt-4 border-t border-white/10 w-full space-y-0">
               <button type="submit" className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 font-bold tracking-tight transition-all text-sm group">
                 Sign Out
                 <LogOut className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
               </button>
            </form>
         </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8 min-h-[calc(100vh-80px)] md:min-h-screen overflow-x-hidden">
          {children}
      </main>
    </div>
  );
}
