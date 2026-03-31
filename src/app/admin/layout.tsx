import Link from "next/link";
import { Copyleft } from "lucide-react"; // Dummy icon for flexology

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-black text-white p-6 md:min-h-screen border-b md:border-b-0 md:border-r border-white/10 shrink-0">
         <div className="flex items-center gap-3 mb-8">
           <Copyleft className="w-8 h-8 text-flx-teal" />
           <h1 className="text-xl font-bold tracking-tight">Flex Admin</h1>
         </div>
         <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            <Link href="/admin" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-white font-medium whitespace-nowrap transition-colors">
              Bookings Pipeline
            </Link>
            <Link href="/admin/staff" className="block px-4 py-2 rounded-lg hover:bg-white/10 text-white font-medium whitespace-nowrap transition-colors">
              Staff & Outlets
            </Link>
            <Link href="/" className="block px-4 py-2 mt-4 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">
              ← Client Facing Shell
            </Link>
         </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8 min-h-[calc(100vh-80px)] md:min-h-screen overflow-x-hidden">
          {children}
      </main>
    </div>
  );
}
