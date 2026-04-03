"use client";

import { useState } from "react";
import { format } from "date-fns";
import { processPosManualCheckout, processPosDigitalCheckout, completeDigitalPosCheckout } from "@/app/actions/posCheckoutActions";
import { Banknote, CreditCard, QrCode, CheckCircle2, AlertCircle, X, Wallet } from "lucide-react";

declare global {
  interface Window {
    snap: any;
  }
}

export default function CheckoutClient({ unpaidBookings, midtransClientKey }: any) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  // Payment Modal State
  const [paymentMode, setPaymentMode] = useState<"SELECT" | "CASH" | "EDC" | "TRANSFER" | "DIGITAL" | "SUCCESS">("SELECT");
  const [tenderedAmount, setTenderedAmount] = useState<string>("");
  const [changeDue, setChangeDue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleManualSettle = async (method: "CASH" | "EDC" | "TRANSFER") => {
      const amt = parseInt((tenderedAmount || "0").replace(/[^0-9]/g, ""));
      if (method === "CASH" && amt < selectedBooking.totalPrice) {
         setError("Tendered amount is insufficient.");
         return;
      }
      
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("bookingId", selectedBooking.id);
      formData.append("paymentMethod", method);
      formData.append("tenderedAmount", amt.toString());

      try {
         const res = await processPosManualCheckout(formData);
         if (res.changeDue !== undefined) {
             setChangeDue(res.changeDue);
             setPaymentMode("SUCCESS");
         }
      } catch(e: any) {
         setError(e.message || "Manual payment compilation failed.");
      }
      setLoading(false);
  };

  const handleDigitalSettle = async () => {
      setLoading(true);
      setError("");

      try {
         const res = await processPosDigitalCheckout(selectedBooking.id);

         if (res.devBypass) {
             // Fake the transaction completion
             await completeDigitalPosCheckout(res.transactionId);
             setChangeDue(0);
             setPaymentMode("SUCCESS");
             setLoading(false);
             return;
         }

         if (window.snap) {
            window.snap.pay(res.token, {
               onSuccess: async function(result: any){
                  setLoading(true);
                  await completeDigitalPosCheckout(res.transactionId);
                  setChangeDue(0);
                  setPaymentMode("SUCCESS");
                  setLoading(false);
               },
               onPending: function(result: any){
                  alert("Digital Payment is pending confirmation on provider side.");
                  setLoading(false);
                  closeModal();
               },
               onError: function(result: any){
                  alert("Digital Payment failed or timed out.");
                  setLoading(false);
               },
               onClose: function(){
                  setLoading(false);
               }
            });
         }
      } catch(e: any) {
         setError(e.message || "Gateway connection failed.");
         setLoading(false);
      }
  };

  const closeModal = () => {
      setSelectedBooking(null);
      setPaymentMode("SELECT");
      setTenderedAmount("");
      setChangeDue(null);
      setError("");
  };

  return (
    <>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unpaidBookings.length === 0 ? (
             <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400 bg-white border border-dashed border-gray-300 rounded-3xl">
                <CheckCircle2 className="w-12 h-12 mb-4 text-gray-300" />
                <p className="font-bold tracking-widest uppercase">All clear</p>
                <p className="text-sm mt-1">No outstanding balances require settlement today.</p>
             </div>
          ) : (
             unpaidBookings.map((b: any) => (
                <div key={b.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 pt-5 translate-x-2 -translate-y-2">
                       <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${b.source === 'pos' ? 'bg-black text-white' : 'bg-blue-100 text-blue-800'}`}>
                          {b.source}
                       </span>
                   </div>
                   
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(new Date(b.scheduledDate), "MMM do • HH:mm")}</p>
                   <h3 className="text-lg font-black text-gray-900 mt-1">{b.user.name}</h3>
                   <div className="flex items-center gap-2 mt-4 text-sm text-gray-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-flx-teal" />
                      {b.service.name}
                   </div>
                   
                   <div className="mt-8 flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Settle</p>
                         <p className="text-xl font-black text-gray-900 tracking-tight">Rp {b.totalPrice.toLocaleString('id-ID')}</p>
                      </div>
                      <button 
                         onClick={() => setSelectedBooking(b)}
                         className="px-6 py-3 bg-black text-white font-bold tracking-wide rounded-xl hover:bg-black/80 transition-colors active:scale-95 shadow-lg shadow-black/10"
                      >
                         Charge
                      </button>
                   </div>
                </div>
             ))
          )}
       </div>

       {/* Checkout Modal */}
       {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
             <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 relative">
                
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                   <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Target Account</p>
                      <h3 className="text-xl font-black text-gray-900 leading-none">{selectedBooking.user.name}</h3>
                   </div>
                   <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5"/></button>
                </div>

                <div className="p-6">
                   <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl mb-6 text-center">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Balance Due</p>
                      <p className="text-4xl font-black text-gray-900 tracking-tighter">Rp {selectedBooking.totalPrice.toLocaleString('id-ID')}</p>
                   </div>

                   {error && <div className="p-3 mb-6 bg-red-50 text-red-600 border border-red-100 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}

                   <div className="space-y-4">
                      {paymentMode === "SELECT" && (
                         <>
                            <button 
                               onClick={() => setPaymentMode("CASH")}
                               className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-black transition-colors flex items-center gap-4 group"
                            >
                               <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors"><Banknote className="w-6 h-6"/></div>
                               <div className="text-left flex-1">
                                  <p className="font-bold text-gray-900 text-lg">Physical Cash</p>
                                  <p className="text-xs text-gray-500">Calculate exact mathematical change.</p>
                               </div>
                            </button>

                            <button 
                               onClick={() => setPaymentMode("EDC")}
                               className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-black transition-colors flex items-center gap-4 group"
                            >
                               <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors"><CreditCard className="w-6 h-6"/></div>
                               <div className="text-left flex-1">
                                  <p className="font-bold text-gray-900 text-lg">EDC / Card Terminal</p>
                                  <p className="text-xs text-gray-500">Manual verification of external POS swipe.</p>
                               </div>
                            </button>

                            <button 
                               onClick={() => setPaymentMode("TRANSFER")}
                               className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-black transition-colors flex items-center gap-4 group"
                            >
                               <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors"><Wallet className="w-6 h-6"/></div>
                               <div className="text-left flex-1">
                                  <p className="font-bold text-gray-900 text-lg">Bank Transfer / Other</p>
                                  <p className="text-xs text-gray-500">Manual wire bypass validation.</p>
                               </div>
                            </button>
                            
                            <button 
                               onClick={() => { 
                                  if (midtransClientKey && !midtransClientKey.includes("DUMMY")) {
                                     setPaymentMode("DIGITAL"); handleDigitalSettle();
                                  }
                               }}
                               className={`w-full p-4 border-2 rounded-xl transition-colors flex items-center gap-4 group ${midtransClientKey && !midtransClientKey.includes("DUMMY") ? 'border-gray-200 hover:border-flx-teal cursor-pointer' : 'border-gray-200 opacity-60 cursor-not-allowed bg-gray-50'}`}
                            >
                               <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${midtransClientKey && !midtransClientKey.includes("DUMMY") ? 'bg-flx-teal/10 text-flx-teal group-hover:bg-flx-teal group-hover:text-black' : 'bg-gray-200 text-gray-400'}`}>
                                  <QrCode className="w-6 h-6"/>
                               </div>
                               <div className="text-left flex-1">
                                  <p className="font-bold text-gray-900 text-lg">Digital Gateway</p>
                                  <p className="text-xs text-gray-500">Integrated QRIS & Midtrans Snap.</p>
                               </div>
                               {(!midtransClientKey || midtransClientKey.includes("DUMMY")) && (
                                  <span className="px-2 py-1 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-lg uppercase tracking-wider">Coming Soon</span>
                               )}
                            </button>
                         </>
                      )}

                      {paymentMode === "CASH" && (
                         <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div>
                               <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1 mb-2 block">Tendered Bill Amount</label>
                               <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                                  <input 
                                     type="text" 
                                     value={tenderedAmount}
                                     onChange={(e) => setTenderedAmount(e.target.value.replace(/[^0-9]/g, ""))}
                                     className="w-full p-4 pl-12 bg-white border-2 border-gray-200 focus:border-black rounded-xl outline-none transition-all font-black text-xl tracking-wider shadow-inner"
                                     placeholder="0"
                                     autoFocus
                                  />
                               </div>
                            </div>

                            <button 
                               onClick={() => handleManualSettle("CASH")}
                               disabled={loading || parseInt(tenderedAmount || "0") < selectedBooking.totalPrice}
                               className="w-full py-5 bg-black text-white font-black tracking-widest uppercase rounded-xl hover:bg-black/80 disabled:opacity-50 transition-all flex items-center justify-center shadow-2xl shadow-black/20"
                            >
                               {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Compile Drawer"}
                            </button>
                            <button onClick={() => setPaymentMode("SELECT")} className="w-full text-center text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 hover:text-black">Back to Methods</button>
                         </div>
                      )}

                      {(paymentMode === "EDC" || paymentMode === "TRANSFER") && (
                         <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-center">
                               <p className="text-sm font-bold text-gray-600 mb-2">Manual Verification Required</p>
                               <p className="text-xs text-gray-500 font-medium">Please ensure the transaction has successfully cleared on the external {paymentMode} terminal before proceeding.</p>
                            </div>
                            
                            <button 
                               onClick={() => handleManualSettle(paymentMode)}
                               disabled={loading}
                               className="w-full py-5 bg-flx-teal text-black font-black tracking-widest uppercase rounded-xl hover:bg-flx-teal/80 disabled:opacity-50 transition-all flex items-center justify-center shadow-2xl shadow-flx-teal/20 mt-4"
                            >
                               {loading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : `Confirm ${paymentMode} Paid`}
                            </button>
                            <button onClick={() => setPaymentMode("SELECT")} className="w-full text-center text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 hover:text-black">Back to Methods</button>
                         </div>
                      )}

                      {paymentMode === "DIGITAL" && (
                         <div className="py-12 flex flex-col items-center justify-center animate-in fade-in">
                            <div className="w-16 h-16 border-4 border-gray-100 border-t-flx-teal rounded-full animate-spin mb-4" />
                            <p className="font-bold text-gray-900">Awaiting Terminal Link</p>
                            <p className="text-sm text-gray-500 mt-1">Please direct the customer to the secure pop-up.</p>
                         </div>
                      )}

                      {paymentMode === "SUCCESS" && (
                         <div className="py-8 flex flex-col items-center justify-center animate-in fade-in zoom-in-90">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100 mb-6">
                               <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <p className="font-black text-2xl text-gray-900 tracking-tight">Ledger Synchronized!</p>
                            
                            {changeDue !== null && changeDue > 0 && (
                               <div className="w-full mt-6 p-6 bg-amber-50 border-2 border-amber-200 border-dashed rounded-xl text-center">
                                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Physical Change Due</p>
                                  <p className="text-3xl font-black text-amber-900 tracking-tighter">Rp {changeDue.toLocaleString('id-ID')}</p>
                               </div>
                            )}

                            <button onClick={closeModal} className="mt-8 w-full py-4 border-2 border-gray-200 font-bold rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">Acknowledge</button>
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
       )}
    </>
  );
}
