import { Header } from "@/components/Header";
import { CheckCircle2, ChevronRight, Download, Receipt } from "lucide-react";
import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";

export default async function CheckoutSuccess({ searchParams }: { searchParams: { ref: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const ref = searchParams.ref as string;
  if (!ref) redirect('/profile');

  const transaction = await prisma.paymentTransaction.findUnique({
     where: { id: ref, userId: session.userId as string }
  });

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { points: true }
  });

  if (!transaction) redirect('/profile');

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] relative pb-24">
      <Header points={user?.points || 0} />
      
      <div className="flex flex-col items-center justify-center pt-16 px-6 animate-in fade-in zoom-in-95 duration-700 max-w-lg mx-auto w-full text-center">
         
         <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-8 mt-4 animate-bounce-slow">
            <CheckCircle2 className="w-12 h-12 text-white" />
         </div>

         <h1 className="text-3xl font-bold tracking-tight text-black mb-3">Payment Successful</h1>
         <p className="text-gray-500 mb-8 max-w-[280px]">Your transaction has been securely processed by Midtrans and the system has been updated.</p>

         {/* Receipt Matrix */}
         <div className="bg-white border text-sm border-gray-200 rounded-2xl w-full p-6 shadow-sm mb-6 text-left">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Receipt Number</p>
                  <p className="font-mono text-xs text-black font-bold truncate w-[180px]">{transaction.id}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="font-mono text-xs text-black font-bold w-[100px]">{format(transaction.createdAt, "dd MMM yyyy")}</p>
               </div>
            </div>

            <div className="space-y-4 mb-6">
               <div className="flex justify-between items-center text-gray-600">
                  <span className="font-bold text-sm">Subtotal</span>
                  <span className="font-mono text-sm">{formatRupiah(transaction.subtotal)}</span>
               </div>
               <div className="flex justify-between items-center text-gray-600">
                  <span className="font-bold text-sm">Gateway Tax ({transaction.method})</span>
                  <span className="font-mono text-sm">{formatRupiah(transaction.platformFee)}</span>
               </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mb-2">
               <span className="font-bold text-black text-lg">Total Paid</span>
               <span className="font-mono text-xl text-emerald-600 font-bold">{formatRupiah(transaction.totalAmount)}</span>
            </div>
         </div>

         <Link href="/profile" className="w-full">
            <button className="w-full bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-black/90 transition-all shadow-xl active:scale-[0.98]">
               Return to Dashboard <ChevronRight className="w-4 h-4" />
            </button>
         </Link>
         
      </div>
    </div>
  );
}
