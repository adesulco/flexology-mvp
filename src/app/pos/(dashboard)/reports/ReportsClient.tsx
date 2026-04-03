"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Printer, Calendar, Banknote, CreditCard, Building, QrCode, TrendingUp, Users, ArrowDownToLine } from "lucide-react";

export default function ReportsClient({ tx, metrics, currentDate }: any) {
  const router = useRouter();
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     router.push(`/pos/reports?date=${e.target.value}`);
  };

  const handlePrint = () => {
     window.print();
  };

  return (
     <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Print Only Header */}
        <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
           <h1 className="text-3xl font-black uppercase tracking-widest text-black">Ledger Report</h1>
           <p className="text-sm font-bold text-gray-500">Flexology POS Terminal • {format(new Date(currentDate), "dd MMM yyyy")}</p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center bg-white p-2 pl-4 rounded-2xl border border-gray-200 shadow-sm print:hidden">
           <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input 
                 type="date" 
                 value={currentDate}
                 onChange={handleDateChange}
                 className="outline-none font-bold text-gray-900 bg-transparent text-sm"
              />
           </div>
           <div className="flex gap-2">
              <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 font-bold rounded-xl transition-all">
                 <Printer className="w-4 h-4"/> Print
              </button>
              <button disabled className="flex items-center gap-2 bg-flx-teal text-black px-4 py-2 font-bold rounded-xl transition-all opacity-50 cursor-not-allowed">
                 <ArrowDownToLine className="w-4 h-4"/> CSV
              </button>
           </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           
           <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 text-emerald-100"><TrendingUp className="w-16 h-16 opacity-30 transform translate-x-4 -translate-y-4"/></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Gross Terminal Volume</p>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">Rp {(metrics.grandTotal / 1000).toLocaleString()}K</p>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 text-blue-100"><Users className="w-16 h-16 opacity-30 transform translate-x-4 -translate-y-4"/></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Walk-in Traffic</p>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">{metrics.totalWalkins}</p>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 text-purple-100"><Users className="w-16 h-16 opacity-30 transform translate-x-4 -translate-y-4"/></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Organic App Traffic</p>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">{metrics.totalOrganic}</p>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Cash Drawer Expected</p>
              <p className="text-3xl font-black text-amber-600 tracking-tighter">Rp {(metrics.totalCash / 1000).toLocaleString()}K</p>
           </div>

        </div>

        {/* Ledger */}
        <div className="bg-white border text-sm border-gray-200 rounded-2xl shadow-sm overflow-hidden">
           <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Transaction Itemization</h3>
           </div>
           
           <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-white border-b border-gray-100 text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                 <tr>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {tx.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No transactions recorded for this date.</td>
                    </tr>
                 ) : tx.map((t: any) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4 font-mono text-gray-600">{format(new Date(t.createdAt), "HH:mm")}</td>
                       <td className="px-6 py-4 font-bold text-gray-900">{t.booking?.user?.name || "System Record"}</td>
                       <td className="px-6 py-4">
                          {t.paymentMethod === 'CASH' && <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase"><Banknote className="w-3 h-3"/> Cash</span>}
                          {t.paymentMethod === 'EDC' && <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase"><CreditCard className="w-3 h-3"/> EDC</span>}
                          {t.paymentMethod === 'TRANSFER' && <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase"><Building className="w-3 h-3"/> Transfer</span>}
                          {t.paymentMethod.includes('DIGITAL') && <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase"><QrCode className="w-3 h-3"/> Gateway</span>}
                       </td>
                       <td className="px-6 py-4 text-gray-600">{t.booking?.service?.name || "Manual TX"}</td>
                       <td className="px-6 py-4 text-right font-black font-mono text-gray-900">Rp {t.total.toLocaleString()}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

     </div>
  );
}
