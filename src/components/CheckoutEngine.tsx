"use client";

import { useState } from "react";
import { CreditCard, QrCode, Building, ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Extend window for Midtrans Snap
declare global {
  interface Window {
    snap: any;
  }
}

export default function CheckoutEngine({
   subtotal,
   itemId,
   type,
   fees
}: {
   subtotal: number;
   itemId: string;
   type: "SUBSCRIPTION" | "BOOKING";
   fees: { qris: number, va: number, cc: number };
}) {
   const router = useRouter();
   const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "VA" | "CC">("QRIS");
   const [gateway, setGateway] = useState<"MIDTRANS" | "XENDIT">("MIDTRANS");
   const [loading, setLoading] = useState(false);

   // Mathematical Engine
   const platformFee = paymentMethod === "QRIS" ? Math.round(subtotal * fees.qris) :
                       paymentMethod === "VA" ? fees.va :
                       paymentMethod === "CC" ? Math.round(subtotal * fees.cc) : 0;
                       
   const totalAmount = subtotal + platformFee;

   const handlePay = async () => {
      setLoading(true);
      try {
         if (gateway === "XENDIT") {
            const res = await fetch("/api/payments/xendit/create-invoice", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                  itemId, type, subtotal, platformFee, totalAmount, methodKey: paymentMethod
               })
            });
            const data = await res.json();
            if (!data.invoiceUrl) throw new Error(data.error || "Failed to generate Xendit Link");
            // Perform simulated redirect to Xendit Payment Page
            router.push(data.invoiceUrl);
            return;
         }

         // 1. Fetch secure Snap Token from Edge API (MIDTRANS)
         const res = await fetch("/api/payments/tokenize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               itemId,
               type,
               subtotal,
               platformFee,
               totalAmount,
               methodKey: paymentMethod
            })
         });
         
         const data = await res.json();
         if (!data.token) throw new Error(data.error || "Failed to generate Midtrans Token");

         // 2. Launch Midtrans Snap Popup securely
         window.snap.pay(data.token, {
            onSuccess: function(result: any){
               console.log("Midtrans Success:", result);
               router.push(`/checkout/success?ref=${result.order_id}`);
            },
            onPending: function(result: any){
               console.log("Midtrans Pending:", result);
               router.push(`/checkout/success?ref=${result.order_id}&status=pending`);
            },
            onError: function(result: any){
               console.error("Midtrans Error:", result);
               alert("Payment failed or was declined.");
               setLoading(false);
            },
            onClose: function(){
               console.warn("User closed popup without finishing payment");
               setLoading(false);
            }
         });

      } catch(err: any) {
         console.error(err);
         alert(`Checkout Error: ${err.message}`);
         setLoading(false);
      }
   };

   const handleDevBypass = async () => {
      setLoading(true);
      try {
         // Create a simulated webhook success trigger directly to the DB to simulate Midtrans success
         const res = await fetch("/api/payments/tokenize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               itemId, type, subtotal, platformFee, totalAmount, methodKey: paymentMethod, devBypass: true
            })
         });
         const data = await res.json();
         if (!data.orderId) throw new Error(data.error || "Bypass failed.");

         router.push(`/checkout/success?ref=${data.orderId}`);
      } catch(err: any) {
         console.error(err);
         alert(`Dev Bypass Error: ${err.message}`);
         setLoading(false);
      }
   };

   // Best approach: If we don't have real keys, show the Bypass button. When they add keys next week, it auto-hides.
   const hasRealKeys = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY && !process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY.includes("DUMMY");

   return (
      <>
         {/* Gateway Selection Phase 5 */}
         <h3 className="text-sm font-bold text-black mb-3">Select Processing Gateway</h3>
         <div className="flex gap-3 mb-6">
            <button 
               onClick={() => setGateway("MIDTRANS")}
               className={`flex-1 p-3 border rounded-xl flex items-center justify-center transition-all font-bold text-sm ${gateway === "MIDTRANS" ? "bg-black text-white border-black" : "bg-white text-gray-400 border-gray-200"}`}
            >
               Midtrans
            </button>
            <button 
               onClick={() => setGateway("XENDIT")}
               className={`flex-1 p-3 border rounded-xl flex items-center justify-center transition-all font-bold text-sm ${gateway === "XENDIT" ? "bg-[#0E51D5] text-white border-[#0E51D5]" : "bg-white text-gray-400 border-gray-200"}`}
            >
               Xendit
            </button>
         </div>

         {/* Payment Methods Selector */}
         <h3 className="text-sm font-bold text-black mb-3">Select Payment Method</h3>
         
         <div className="space-y-3 mb-8">
            <button 
               onClick={() => setPaymentMethod("QRIS")}
               className={`w-full p-4 border rounded-2xl flex items-center justify-between transition-all ${paymentMethod === 'QRIS' ? 'bg-black/5 border-black shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${paymentMethod === 'QRIS' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                     <QrCode className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                     <p className={`font-bold ${paymentMethod === 'QRIS' ? 'text-black' : 'text-gray-900'}`}>QRIS & E-Wallets</p>
                     <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-0.5">GoPay • OVO • ShopeePay</p>
                  </div>
               </div>
               <div className="text-right">
                  <span className="text-xs font-bold text-gray-500">{(fees.qris * 100).toFixed(1)}% Fee</span>
               </div>
            </button>

            <button 
               onClick={() => setPaymentMethod("VA")}
               className={`w-full p-4 border rounded-2xl flex items-center justify-between transition-all ${paymentMethod === 'VA' ? 'bg-black/5 border-black shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${paymentMethod === 'VA' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                     <Building className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                     <p className={`font-bold ${paymentMethod === 'VA' ? 'text-black' : 'text-gray-900'}`}>Virtual Account</p>
                     <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-0.5">BCA • Mandiri • BNI</p>
                  </div>
               </div>
               <div className="text-right">
                  <span className="text-xs font-bold text-gray-500">IDR {(fees.va / 1000).toFixed(0)}K Fee</span>
               </div>
            </button>

            <button 
               onClick={() => setPaymentMethod("CC")}
               className={`w-full p-4 border rounded-2xl flex items-center justify-between transition-all ${paymentMethod === 'CC' ? 'bg-black/5 border-black shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${paymentMethod === 'CC' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                     <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                     <p className={`font-bold ${paymentMethod === 'CC' ? 'text-black' : 'text-gray-900'}`}>Credit / Debit Card</p>
                     <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-0.5">Visa • Mastercard</p>
                  </div>
               </div>
               <div className="text-right">
                  <span className="text-xs font-bold text-gray-500">{(fees.cc * 100).toFixed(1)}% Fee</span>
               </div>
            </button>
         </div>

         {/* Trust Badge */}
         <div className="flex items-center justify-center gap-2 text-gray-400 mb-[120px]">
            <ShieldCheck className="w-4 h-4" />
            <p className="text-[10px] uppercase tracking-widest font-bold">Secured by {gateway === "MIDTRANS" ? "Midtrans" : "Xendit"} Global</p>
         </div>

         {/* Fixed Bottom Action Bar */}
         <div className="fixed bottom-0 left-0 w-full p-6 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent z-40 border-t border-gray-100 pb-8 sm:pb-6 max-w-lg sm:mx-auto sm:left-1/2 sm:-translate-x-1/2">
            
            <div className="space-y-1 mb-4 flex flex-col items-end">
               <div className="flex justify-between items-center w-full px-2">
                  <span className="text-xs font-bold text-gray-400">Merchant Surcharge</span>
                  <span className="text-sm font-bold font-mono text-gray-500">+ IDR {(platformFee / 1000).toFixed(1)}K</span>
               </div>
               <div className="flex justify-between items-center w-full px-2">
                  <span className="text-lg font-bold text-black">Total to Deduct</span>
                  <span className="text-2xl font-bold font-mono text-black">IDR {(totalAmount / 1000).toFixed(1)}K</span>
               </div>
            </div>

            <button 
               onClick={handlePay}
               disabled={loading}
               className="w-full bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-black/90 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Process Secure Payment"}
            </button>
            {!hasRealKeys && (
               <button 
                  onClick={handleDevBypass}
                  disabled={loading}
                  className="w-full bg-purple-600/10 text-purple-600 font-bold py-3 mt-3 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-600/20 transition-all border border-dashed border-purple-500 shadow-sm"
               >
                  🔨 Developer Bypass (Mock Success)
               </button>
            )}
         </div>
      </>
   );
}
