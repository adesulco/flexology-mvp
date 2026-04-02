import { Header } from "@/components/Header";
import { ArrowLeft, CheckCircle2, Clock, MapPin, Activity } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CheckoutEngine from "@/components/CheckoutEngine";
import { format } from "date-fns";

export default async function BookingCheckout({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const booking = await prisma.booking.findUnique({ 
     where: { id: params.id, userId: session.userId as string },
     include: { service: true, location: true }
  });

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { points: true }
  });
  
  // Security Guard: Prevent Double Payment & Unconfirmed Payments
  if (!booking) redirect('/profile');
  if (booking.isPaid) redirect('/profile');
  if (booking.status !== "CONFIRMED") redirect('/profile');

  // Load Admin Economy Configurations dynamically
  const systemConfigs = await prisma.systemSetting.findMany();
  const getConfig = (key: string, _default: string) => systemConfigs.find((c: any) => c.key === key)?.value || _default;
  const fees = {
      qris: parseFloat(getConfig('FEE_QRIS', "0.007")),
      va: parseInt(getConfig('FEE_VA', "4000")),
      cc: parseFloat(getConfig('FEE_CC', "0.02"))
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] relative pb-24">
      <Header points={user?.points || 0} />
      
      <div className="px-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-lg mx-auto w-full">
         <Link href="/profile" className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 mb-6 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" /> Go back to Profile
         </Link>

         <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-black mb-1">Contract Execution</h1>
            <p className="text-sm text-gray-500">Your designated operational contract is locked and awaits your payment processing.</p>
         </div>

         {/* Order Summary */}
         <div className="bg-white border text-sm border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
            
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="font-bold text-lg font-mono tracking-tight text-black flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                     {booking.service.name}
                  </h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-mono">
                     {format(new Date(booking.scheduledDate), "HH:mm • dd MMM yy")}
                  </p>
               </div>
               <span className="text-xl font-bold font-mono text-black">IDR {(booking.totalPrice / 1000).toFixed(0)}K</span>
            </div>
            
            <hr className="border-gray-100 mb-4" />
            
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                  <Activity className="w-4 h-4 text-flx-teal" />
                  Execution Duration: {booking.service.duration} Min Protocol
               </div>
               <div className="flex items-start gap-2 text-xs font-bold text-gray-600">
                  <MapPin className="w-4 h-4 text-black shrink-0" />
                  <span>
                     {booking.mode === "OUTLET" ? booking.location?.name : "At-Home Deployment"}
                     {booking.mode === "OUTLET" && booking.location?.address && <span className="block text-[10px] font-medium text-gray-500 font-mono mt-0.5">{booking.location.address}</span>}
                     {booking.mode === "HOME" && <span className="block text-[10px] font-medium text-gray-500 font-mono mt-0.5 max-w-[200px] truncate">{booking.homeAddress}</span>}
                  </span>
               </div>
            </div>
         </div>

         {/* Payment Gateway Mathematical Engine */}
         <CheckoutEngine 
            subtotal={booking.totalPrice} 
            itemId={booking.id} 
            type="BOOKING" 
            fees={fees} 
         />
      </div>
    </div>
  );
}
