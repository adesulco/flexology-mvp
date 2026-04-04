import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { getTenant } from "@/lib/tenant";
import { formatRupiah } from "@/lib/format";
import Link from "next/link";
import { Star, Clock } from "lucide-react";

export default async function ServicesCatalogPage() {
  const tenant = await getTenant();

  const services = await prisma.service.findMany({
     where: { isActive: true, tenantId: tenant?.id },
     orderBy: { price: 'asc' }
  });

  return (
    <div className="min-h-screen bg-black text-white md:max-w-md md:mx-auto md:border-x md:border-white/10 md:shadow-2xl relative flex flex-col">
       <Header points={0} />

       <main className="flex-1 overflow-y-auto px-6 pt-6 pb-24">
          <div className="mb-8">
             <h1 className="text-2xl font-bold tracking-tight mb-2">Service Catalog</h1>
             <p className="text-sm text-gray-400">Select a premium recovery treatment.</p>
          </div>

          <div className="space-y-4">
             {services.map(service => (
                <div key={service.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition">
                   <div className="flex justify-between items-start mb-3">
                      <div>
                         <h3 className="font-bold text-lg leading-tight">{service.name}</h3>
                         <div className="flex items-center gap-3 text-xs text-flx-teal font-bold tracking-wider mt-1.5 uppercase">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration} MIN</span>
                            <span className="flex items-center gap-1 text-yellow-500"><Star className="w-3 h-3 fill-current" /> 4.9</span>
                         </div>
                      </div>
                      <span className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-mono tracking-widest text-white">
                         {formatRupiah(service.price)}
                      </span>
                   </div>
                   
                   <p className="text-sm text-gray-400 mb-5 leading-relaxed line-clamp-2">
                      {service.description || "Premium therapy session designed to accelerate physical recovery."}
                   </p>

                   <Link href={`/book?service=${service.id}`} className="block w-full text-center bg-flx-teal text-black font-bold tracking-widest py-3 rounded-xl hover:bg-white transition">
                      BOOK NOW
                   </Link>
                </div>
             ))}
          </div>
       </main>
    </div>
  );
}
