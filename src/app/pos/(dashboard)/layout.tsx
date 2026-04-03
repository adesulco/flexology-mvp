import Link from "next/link";
import { Copyleft, LogOut, LayoutDashboard, Calendar, CalendarPlus, Users, BadgeDollarSign, FileText } from "lucide-react";
import { getSession } from "@/lib/auth";
import { logout } from "@/app/actions/authActions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/pos/login");

  let locationName = "Global HQ";
  if (session.managedLocationId) {
      const loc = await prisma.location.findUnique({ where: { id: session.managedLocationId } });
      if (loc) locationName = loc.name;
  }

  // Handle the exception for POS login
  // We don't want the sidebars rendering on the login route
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - 240px */}
      <aside className="w-[240px] bg-black text-white shrink-0 flex flex-col h-full z-20">
         <div className="p-6 border-b border-white/10 shrink-0">
           <div className="flex items-center gap-3 mb-2">
             <Copyleft className="w-8 h-8 text-flx-teal" />
             <h1 className="text-xl font-bold tracking-tight">Flex POS</h1>
           </div>
           <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">{locationName}</p>
         </div>

         <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <Link href="/pos" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white font-medium transition-colors">
              <LayoutDashboard className="w-4 h-4 text-gray-400" />
              Dashboard
            </Link>
            <Link href="/pos/schedule" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white font-medium transition-colors">
              <Calendar className="w-4 h-4 text-gray-400" />
              Schedule
            </Link>
            <Link href="/pos/new-booking" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white font-medium transition-colors">
              <CalendarPlus className="w-4 h-4 text-flx-teal" />
              New Booking
            </Link>
            <Link href="/pos/walk-ins" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white font-medium transition-colors">
              <Users className="w-4 h-4 text-gray-400" />
              Walk-Ins
            </Link>
            <Link href="/pos/customers" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white font-medium transition-colors">
              <UserIcon className="w-4 h-4 text-gray-400" />
              Customers
            </Link>
            <Link href="/pos/checkout" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white font-medium transition-colors">
              <BadgeDollarSign className="w-4 h-4 text-gray-400" />
              Checkout
            </Link>
            <Link href="/pos/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white font-medium transition-colors">
              <FileText className="w-4 h-4 text-gray-400" />
              Daily Reports
            </Link>
         </nav>

         <div className="p-4 border-t border-white/10 shrink-0">
            <div className="bg-white/5 rounded-xl p-3 mb-4">
               <p className="text-xs font-bold text-gray-300">Active Admin:</p>
               <p className="text-sm text-flx-teal font-medium truncate">{session.name}</p>
            </div>
            <form action={logout}>
               <button type="submit" className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 font-bold tracking-tight transition-all text-sm group">
                 Sign Out
                 <LogOut className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
               </button>
            </form>
         </div>
      </aside>

      {/* Main Workspace + Context Panel are handled dynamically within individual pages to support the 3-panel semantic architecture naturally */}
      <main className="flex-1 flex overflow-hidden">
          {children}
      </main>
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
