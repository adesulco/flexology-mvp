import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { updateSystemSetting, updateMembershipTier } from "@/app/actions/settingActions";
import { CheckCircle2, Crown, Zap } from "lucide-react";
import { ConfirmForm } from "./ConfirmForm";

export default async function SettingsPage() {
  const session = await getSession();
  if (session?.role !== 'SUPER_ADMIN') redirect('/admin');

  // Fetch configs
  const systemConfigs = await prisma.systemSetting.findMany();
  const getConfig = (key: string, _default: string) => systemConfigs.find((c: any) => c.key === key)?.value || _default;
  
  const regBonus = getConfig('REGISTRATION_BONUS', '10000');
  const feeQris = getConfig('FEE_QRIS', '1000');
  const feeVa = getConfig('FEE_VA', '4000');
  const feeCc = getConfig('FEE_CC', '0.02');

  const tiers = await prisma.membershipTier.findMany({ orderBy: { price: 'asc' } });

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black mb-1">System Variables</h1>
        <p className="text-sm text-gray-500">Configure global economics and membership tier arrays.</p>
      </div>

      <section className="bg-white border rounded-2xl overflow-hidden shadow-sm">
         <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="font-bold text-sm text-black">Economy Engine</h3>
         </div>
         <div className="p-5 space-y-6">
            <ConfirmForm action={updateSystemSetting} className="flex gap-4 items-end">
               <div className="flex-1">
                  <label htmlFor="regBonus" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-1 block">New User Registration Bonus (FLX)</label>
                  <input type="hidden" name="key" value="REGISTRATION_BONUS" />
                  <input id="regBonus" type="number" name="value" defaultValue={regBonus} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-mono" required />
               </div>
               <button type="submit" className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-black/90 transition-all">
                  Save
               </button>
            </ConfirmForm>
            
            <hr className="border-gray-100" />
            <h4 className="text-[10px] font-bold text-black uppercase tracking-widest mb-2 pl-1">Payment Gateway Platform Processing Fees</h4>

            <ConfirmForm action={updateSystemSetting} className="flex gap-4 items-end">
               <div className="flex-1">
                  <label htmlFor="feeQris" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-1 block">QRIS / E-Wallet Fee (IDR)</label>
                  <input type="hidden" name="key" value="FEE_QRIS" />
                  <input id="feeQris" type="number" name="value" defaultValue={feeQris} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-mono" />
               </div>
               <button type="submit" className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-black/90 transition-all">
                  Save
               </button>
            </ConfirmForm>
            <ConfirmForm action={updateSystemSetting} className="flex gap-4 items-end">
               <div className="flex-1">
                  <label htmlFor="feeVa" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-1 block">Virtual Account Surcharge (IDR Flat)</label>
                  <input type="hidden" name="key" value="FEE_VA" />
                  <input id="feeVa" type="number" name="value" defaultValue={feeVa} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-mono" />
               </div>
               <button type="submit" className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-black/90 transition-all">
                  Save
               </button>
            </ConfirmForm>
            <ConfirmForm action={updateSystemSetting} className="flex gap-4 items-end">
               <div className="flex-1">
                  <label htmlFor="feeCc" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-1 block">Credit Card Rate % (e.g. 0.029 for 2.9%)</label>
                  <input type="hidden" name="key" value="FEE_CC" />
                  <input id="feeCc" type="text" pattern="^\d+(\.\d{1,3})?$" name="value" defaultValue={feeCc} placeholder="0.029" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-mono" />
               </div>
               <button type="submit" className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-black/90 transition-all">
                  Save
               </button>
            </ConfirmForm>
         </div>
      </section>

      <section className="bg-white border rounded-2xl overflow-hidden shadow-sm">
         <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="font-bold text-sm text-black">Membership Tiers CRM</h3>
            <span className="text-xs px-2 py-0.5 bg-black text-white rounded-md font-bold uppercase tracking-wider">3 ACTIVE</span>
         </div>
         <div className="p-5 space-y-8">
            {tiers.map((tier) => (
               <ConfirmForm action={updateMembershipTier} key={tier.id} className="relative p-5 rounded-xl border border-gray-200 bg-gray-50/50">
                   <div className="absolute top-0 right-5 transform -translate-y-1/2 bg-white text-gray-500 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border shadow-sm">
                     {tier.rank} Target
                   </div>
                   
                   <input type="hidden" name="tierId" value={tier.id} />
                   
                   <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                         <label htmlFor={`name-${tier.id}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-1 block">Display Name</label>
                         <input id={`name-${tier.id}`} name="name" defaultValue={tier.name} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-bold" required />
                      </div>
                      <div>
                         <label htmlFor={`price-${tier.id}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-1 block">Monthly Price (IDR)</label>
                         <input id={`price-${tier.id}`} type="number" name="price" defaultValue={tier.price} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-mono" required />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                         <label htmlFor={`discount-${tier.id}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-1 block">Discount Yield (%)</label>
                         <input id={`discount-${tier.id}`} type="number" name="discountPercent" defaultValue={tier.discountPercent} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-mono" required />
                      </div>
                      <div>
                         <label htmlFor={`multiplier-${tier.id}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-1 block">Point Multiplier (e.g. 1.5)</label>
                         <input id={`multiplier-${tier.id}`} type="number" step="0.1" name="pointMultiplier" defaultValue={tier.pointMultiplier} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm font-mono" required />
                      </div>
                   </div>

                   <div className="mb-4">
                      <label htmlFor={`benefits-${tier.id}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-1 block">Benefits <span className="lowercase font-normal tracking-normal">(Separate each bullet point by returning a new line)</span></label>
                      <textarea id={`benefits-${tier.id}`} name="benefits" defaultValue={tier.benefits.join('\n')} rows={tier.benefits.length + 1 || 3} className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black text-sm text-gray-600 leading-relaxed" required />
                   </div>

                   <button type="submit" className="w-full py-3 bg-black text-white text-xs font-bold rounded-lg hover:bg-black/90 transition-all flex items-center justify-center">
                      Commit Interface Changes
                   </button>
               </ConfirmForm>
            ))}
         </div>
      </section>

    </div>
  );
}
