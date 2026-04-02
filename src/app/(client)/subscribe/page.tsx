import { Header } from "@/components/Header";
import { CreditCard, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TierRank } from "@prisma/client";
import CheckoutEngine from "@/components/CheckoutEngine";

export default async function SubscribeCheckout({ searchParams }: { searchParams: { tier?: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const tier = searchParams.tier as TierRank;
  if (!tier) redirect('/rewards');

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { points: true }
  });

  const dbTier = await prisma.membershipTier.findUnique({ where: { rank: tier } });
  if (!dbTier) redirect('/rewards');

  const tierName = dbTier.name;
  const tierPrice = `${dbTier.price / 1000}K`;
  const tierTagline = dbTier.rank === "PREMIUM" ? "The Ultimate Recovery Experience" : "The Perfect Recovery Balance";

  // Economy config
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
         <Link href="/rewards" className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 mb-6 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Memberships
         </Link>

         <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-black mb-1">Upgrade Membership</h1>
            <p className="text-sm text-gray-500">You are subscribing to {tierName}</p>
         </div>

         {/* Order Summary */}
         <div className="bg-white border text-sm border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="font-bold text-lg font-mono tracking-tight text-black">{tierName}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{tierTagline}</p>
               </div>
               <span className="text-xl font-bold font-mono text-black">IDR {tierPrice}</span>
            </div>
            
            <hr className="border-gray-100 mb-4" />
            
            <ul className="text-xs text-gray-600 space-y-3">
               {dbTier.benefits.map((b: any, i: any) => (
                 <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-black" /> <strong className="text-black">{b}</strong></li>
               ))}
            </ul>
         </div>

         {/* Payment Gateway Mathematical Engine */}
         <CheckoutEngine 
            subtotal={dbTier.price} 
            itemId={dbTier.rank} 
            type="SUBSCRIPTION" 
            fees={fees} 
         />
      </div>
    </div>
  );
}
