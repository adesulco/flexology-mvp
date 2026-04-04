import { Header } from "@/components/Header";
import { CalendarClock, MapPin, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/formatters";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function Bookings() {
  const session = await getSession();
  
  if (!session?.userId) {
     redirect("/?clear=true");
  }
  
  const user = await prisma.user.findUnique({ where: { id: session.userId as string } });
  if (!user) redirect("/?clear=true");
  
  const bookings = await prisma.booking.findMany({
     where: { userId: session.userId as string },
     include: {
        service: true,
        location: true,
        flexologist: true
     },
     orderBy: { scheduledDate: "asc" }
  });

  return (
    <div className="flex flex-col min-h-full pb-24">
      <Header points={user.points} />
      
      <div className="px-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold tracking-tight text-white">My Bookings</h2>
        </div>

        <div className="flex flex-col gap-4">
           {bookings.length === 0 ? (
             <div className="bg-flx-card border border-flx-border rounded-2xl p-10 flex flex-col items-center justify-center text-center mt-4 shadow-xl">
                 <div className="w-16 h-16 rounded-full bg-flx-dark border border-flx-border flex items-center justify-center mb-4">
                   <CalendarClock className="w-8 h-8 text-flx-teal" />
                 </div>
                 <h3 className="text-lg font-bold text-flx-text mb-2 tracking-tight">No upcoming sessions</h3>
                 <p className="text-sm text-flx-text-muted max-w-[200px] mb-6">Book a session to start your recovery journey today.</p>
                 <Link href="/book">
                    <button className="bg-white text-black font-bold py-3 px-6 rounded-xl inline-flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg active:scale-[0.98]">
                       Book Now <ArrowRight className="w-4 h-4 -mr-1" />
                    </button>
                 </Link>
             </div>
           ) : (
             bookings.map((b) => (
                <div key={b.id} className="bg-flx-card border border-flx-border rounded-2xl p-5 shadow-lg relative overflow-hidden">
                   
                   <div className="flex items-center justify-between mb-4">
                      {b.status === "PENDING" && (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">
                            <Clock className="w-3 h-3" /> Awaiting Confirmation
                         </div>
                      )}
                      {(b.status === "CONFIRMED" || b.status === "COMPLETED") && (
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                         </div>
                      )}
                      
                      <span className="text-xs text-flx-text-muted font-mono">{format(new Date(b.scheduledDate), "MMM d, h:mm a")}</span>
                   </div>

                   <h3 className="text-lg font-bold text-flx-text tracking-tight mb-1">{b.service.name}</h3>
                   <p className="text-sm text-flx-text-muted mb-4">{b.service.duration} mins • {formatCurrency(b.totalPrice)}</p>

                   <div className="bg-flx-dark rounded-xl p-3 border border-flx-border space-y-2">
                       {b.mode === 'OUTLET' ? (
                         <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                               <p className="text-xs font-bold text-gray-300">Studio Session</p>
                               <p className="text-[10px] text-gray-500">{b.location?.name}</p>
                            </div>
                         </div>
                       ) : (
                         <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                               <p className="text-xs font-bold text-gray-300">Home Service</p>
                               <p className="text-[10px] text-gray-500 truncate w-[200px]">{b.homeAddress}</p>
                            </div>
                         </div>
                       )}
                                              {b.flexologist ? (
                          <div className="flex items-center gap-2 pt-2 mt-2 border-t border-flx-border/50">
                             <div className="w-6 h-6 rounded-full bg-flx-teal/20 flex items-center justify-center text-[10px] font-bold text-flx-teal">{b.flexologist.name.charAt(0)}</div>
                             <p className="text-xs text-gray-300"><span className="text-gray-500">Therapist:</span> {b.flexologist.name}</p>
                          </div>
                       ) : (
                          <div className="flex items-center gap-2 pt-2 mt-2 border-t border-flx-border/50">
                             <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">?</div>
                             <p className="text-xs text-gray-500 italic">Matching therapist...</p>
                          </div>
                       )}
                   </div>

                   {/* Cancellation Button */}
                   {b.status === "PENDING" && (
                      <form action={async () => {
                         "use server";
                         const ss = await getSession();
                         if (!ss || ss.userId !== b.userId) return;
                         await prisma.booking.delete({ where: { id: b.id } });
                         revalidatePath("/bookings");
                      }} className="mt-4 border-t border-flx-border/30 pt-4 flex justify-end">
                         <button type="submit" className="text-xs text-red-500 font-bold px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20 active:scale-95 shadow-sm">
                            Cancel Session
                         </button>
                      </form>
                   )}

                   {/* Mandatory Payment Button for PENDING/CONFIRMED Sessions */}
                   {(b.status === "CONFIRMED" || b.status === "PENDING") && !b.isPaid && (
                      <div className="mt-4 border-t border-flx-border/30 pt-4 flex justify-between items-center">
                         <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-1.5 border border-yellow-500/20 px-2 py-1 rounded bg-yellow-500/10">Action Required</span>
                         <Link href={`/checkout/booking/${b.id}`}>
                            <button className="text-xs bg-flx-teal/10 text-flx-teal font-bold px-6 py-2.5 hover:bg-flx-teal/20 rounded-xl transition-colors border border-flx-teal/30 active:scale-95 shadow-sm inline-flex items-center gap-2 shadow-flx-teal/5">
                               💸 Pay Now
                            </button>
                         </Link>
                      </div>
                   )}

                   {/* Paid Status */}
                   {(b.status === "CONFIRMED" || b.status === "COMPLETED") && b.isPaid && (
                      <div className="mt-4 border-t border-flx-border/30 pt-4 flex justify-end">
                         <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> SECURELY PAID
                         </span>
                      </div>
                   )}

                </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
