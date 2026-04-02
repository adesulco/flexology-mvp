import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/tenant";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Star, Clock, Heart, Award, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const tenant = await getTenant();
  const flexologist = await prisma.flexologist.findUnique({
    where: { id: (await params).id, tenantId: tenant?.id || undefined }
  });

  return {
    title: flexologist ? `${flexologist.name} | ${tenant?.name || "Jemari"}` : "Therapist Profile",
  };
}

export default async function TherapistProfilePage({ params }: { params: { id: string } }) {
  const tenant = await getTenant();
  
  if (!tenant) {
    redirect("/"); // If root Marketplace, therapists cannot be viewed nakedly, require tenant context
  }

  const { id } = await params;
  
  const flexologist = await prisma.flexologist.findUnique({
     where: { id, tenantId: tenant.id },
     include: { location: true }
  });

  if (!flexologist) notFound();

  // Mock Specialties
  const specialties = ["Deep Tissue", "Sports Recovery", "Acupressure"];

  // Mock Reviews based on rating mathematically derived to 4.9 or 5.0
  const totalReviews = 142;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
       
       {/* Hero Profile Header */}
       <div className="relative pt-10 pb-8 rounded-b-[40px] shadow-sm overflow-hidden text-white" style={{ backgroundColor: tenant.primaryColor }}>
          <div className="absolute inset-0 bg-black/15 z-0"></div>
          
          <div className="relative z-10 px-6 mt-4 flex justify-between items-start">
             <Link href="/" className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm active:scale-95 transition-transform">
                <ChevronLeft className="w-6 h-6 text-white" />
             </Link>
             <button className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm active:scale-95 transition-transform">
                <Heart className="w-5 h-5 text-white" />
             </button>
          </div>

          <div className="relative z-10 px-6 mt-8 flex flex-col items-center">
             <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white/20 shadow-xl overflow-hidden mb-4 relative">
                {/* Fallback image if no imageUrl */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-4xl font-bold text-gray-500">
                   {flexologist.name.substring(0,1)}
                </div>
                {flexologist.imageUrl && (
                   <img src={flexologist.imageUrl} alt={flexologist.name} className="absolute inset-0 w-full h-full object-cover" />
                )}
             </div>
             
             <h1 className="text-3xl font-black mb-1 flex items-center gap-2">
                {flexologist.name} <CheckCircle2 className="w-5 h-5 text-blue-400 fill-white" />
             </h1>
             <p className="text-white/80 font-mono text-sm uppercase tracking-widest font-bold mb-4">
                Senior Therapist
             </p>
             
             <div className="flex gap-4">
                <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl flex flex-col items-center shadow-inner">
                   <div className="flex items-center gap-1 text-orange-400 font-black text-lg">
                      <Star className="w-4 h-4 fill-current" /> {flexologist.rating.toFixed(1)}
                   </div>
                   <div className="text-[10px] uppercase font-bold text-white/60">{totalReviews} Reviews</div>
                </div>
                <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl flex flex-col items-center shadow-inner">
                   <div className="flex items-center gap-1 text-white font-black text-lg">
                      5+
                   </div>
                   <div className="text-[10px] uppercase font-bold text-white/60">Years Exp</div>
                </div>
             </div>
          </div>
       </div>

       <main className="px-6 py-6 space-y-8">
          
          <section>
             <h3 className="text-lg font-black text-gray-900 mb-3">About {flexologist.name.split(" ")[0]}</h3>
             <p className="text-gray-500 leading-relaxed">
                {flexologist.bio || `${flexologist.name} is a highly requested therapist specializing in deep tissue recovery and holistic wellness at ${tenant.name}. Expect an incredibly professional and transformative session tailored exactly to your body's specific tense areas.`}
             </p>
          </section>

          <section>
             <h3 className="text-lg font-black text-gray-900 mb-3">Core Specialties</h3>
             <div className="flex flex-wrap gap-2">
                {specialties.map(spec => (
                   <div key={spec} className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-full text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Award className="w-4 h-4" style={{ color: tenant.primaryColor }} />
                      {spec}
                   </div>
                ))}
             </div>
          </section>

          <section>
             <h3 className="text-lg font-black text-gray-900 mb-3">Operational Details</h3>
             <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gray-400" />
                   </div>
                   <div>
                      <h4 className="font-bold text-sm text-gray-900">Typical Shift</h4>
                      <p className="text-sm text-gray-500">{flexologist.shiftStart} - {flexologist.shiftEnd}</p>
                   </div>
                </div>
                {flexologist.canHomeService && (
                   <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tenant.primaryColor}20` }}>
                         <CheckCircle2 className="w-5 h-5" style={{ color: tenant.primaryColor }} />
                      </div>
                      <div>
                         <h4 className="font-bold text-sm text-gray-900">Home Service Verified</h4>
                         <p className="text-sm text-gray-500">Available for at-home visits</p>
                      </div>
                   </div>
                )}
             </div>
          </section>
          
       </main>

       {/* Sticky Booking Bar */}
       <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe flex gap-4 md:max-w-md md:left-1/2 md:-translate-x-1/2 md:w-full z-50">
          <Link 
             href={`/book?flexologist=${flexologist.id}`}
             className="flex-1 py-4 rounded-xl text-white font-black text-center shadow-lg active:scale-95 transition-transform"
             style={{ backgroundColor: tenant.primaryColor, boxShadow: `0 10px 25px -5px ${tenant.primaryColor}80` }}
          >
             Book Now — Locked to {flexologist.name.split(" ")[0]}
          </Link>
       </div>

    </div>
  );
}
