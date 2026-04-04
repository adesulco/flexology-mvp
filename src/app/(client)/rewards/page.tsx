import { formatRupiah, formatRate } from "@/lib/format";
import { Header } from "@/components/Header";
import { Trophy, Star, Gift, Crown, ArrowRight, Zap, CheckCircle2, MessageCircle } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Rewards() {
  const session = await getSession();
  if (!session?.userId) redirect('/?clear=true');

  const userData = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: { points: true, tier: true, referralCode: true }
  });

  const dbTiers = await prisma.membershipTier.findMany({
    orderBy: { price: "asc" }
  });

  const referralPointsSetting = await prisma.systemSetting.findUnique({
    where: { key: 'REFERRAL_BONUS_POINTS' }
  });
  const referralPoints = referralPointsSetting ? parseInt(referralPointsSetting.value) : 50000;

  if (!userData) redirect('/?clear=true');

  const points = userData.points;
  const nextTarget = 2000;
  const progress = Math.min((points / nextTarget) * 100, 100);

  return (
    <div className="flex flex-col min-h-full">
      <Header points={points} />
      
      <div className="px-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8 p-6 rounded-3xl bg-white border border-flx-border relative overflow-hidden shadow-sm">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-black/5 blur-[50px] rounded-full" />
           <p className="text-xs uppercase tracking-widest text-flx-text-muted font-bold mb-2">Available Balance</p>
           <div className="flex items-end gap-2 mb-6">
             <h2 className="text-5xl font-mono font-bold text-black tracking-tighter">{formatRate(points)}</h2>
             <span className="text-flx-teal font-bold mb-1">FLX</span>
           </div>

           <div>
             <div className="flex justify-between text-xs text-flx-text-muted mb-2 font-bold uppercase tracking-wider">
                <span>{userData.tier.replace('_', ' ')} Tier</span>
                <span>{Math.max(nextTarget - points, 0).toLocaleString()} to Gold</span>
             </div>
             <div className="h-2.5 w-full bg-black/10 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${progress}%` }}
                  className="h-full bg-black rounded-full relative transition-all duration-1000 ease-out"
                >
                   <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/20 blur-sm" />
                </div>
             </div>
           </div>
        </div>

        <h3 className="text-lg font-bold text-black mb-4">How to earn</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-10">
          <div className="bg-flx-card border border-flx-border rounded-2xl p-4 flex flex-col gap-3">
             <div className="w-10 h-10 rounded-full bg-white border border-flx-border flex items-center justify-center text-black">
                <Trophy className="w-5 h-5" />
             </div>
             <div>
                <h4 className="font-bold text-sm text-black">Book Sessions</h4>
                <p className="text-[10px] text-flx-text-muted">1 point per 10k IDR spent</p>
             </div>
          </div>
          <div className="bg-flx-card border border-flx-border rounded-2xl p-4 flex flex-col gap-3">
             <div className="w-10 h-10 rounded-full bg-white border border-flx-border flex items-center justify-center text-black">
                <Gift className="w-5 h-5" />
             </div>
             <div>
                <h4 className="font-bold text-sm text-black">Refer Friends</h4>
                <p className="text-[10px] text-flx-text-muted">{formatRate(referralPoints)} points per referral</p>
             </div>
          </div>
        </div>

        {/* Phase 6: Viral Referral Loop Workflow */}
        <div className="mb-10 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 relative overflow-hidden shadow-sm">
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200/50 blur-3xl rounded-full" />
           <p className="text-xs uppercase tracking-widest text-emerald-800 font-bold mb-1">Spread the Word</p>
           <h3 className="text-xl font-bold text-emerald-950 mb-2 leading-tight">Give {formatRate(referralPoints)} XP,<br />Get {formatRate(referralPoints)} XP</h3>
           <p className="text-xs text-emerald-800/80 mb-5 leading-relaxed max-w-[250px]">
             When a friend tries Flex for the first time using your code, you both instantly earn {formatRate(referralPoints)} FLX Points.
           </p>
           
           <a 
              href={`https://wa.me/?text=${encodeURIComponent(`I'm gifting you ${formatRate(referralPoints)} FLX points to try Flex! Use my invite link: flex.jemariapp.com/ref/${userData.referralCode}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1ebd59] active:scale-[0.98] transition-all shadow-[0_5px_15px_rgba(37,211,102,0.2)]"
           >
              <MessageCircle className="w-4 h-4 fill-current" /> Share via WhatsApp
           </a>
        </div>

        <div className="flex justify-between items-end mb-4">
           <h3 className="text-lg font-bold text-black">Membership Tiers</h3>
        </div>

        <div className="flex flex-col gap-4">
           {dbTiers.map((tier) => {
              if (tier.rank === 'FLEX') {
                 return (
                   <div key={tier.id} className="p-5 rounded-2xl bg-white border border-flx-border shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                         <h4 className="font-bold text-lg font-mono tracking-tight text-gray-500">Explorer (Free)</h4>
                         <span className="text-sm font-bold text-black">{tier.price > 0 ? `${tier.price / 1000}K` : '0K'}<span className="text-[10px] text-flx-text-muted">/mo</span></span>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-2 mb-4">
                         {tier.benefits.map((b, i) => (
                            <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-gray-400" /> {b}</li>
                         ))}
                      </ul>
                      <button disabled className="w-full py-2.5 rounded-xl border border-transparent bg-gray-100 text-xs font-bold text-gray-500 transition-colors cursor-not-allowed">Standard Tier</button>
                   </div>
                 );
              }

              if (tier.rank === 'FLEX_PLUS') {
                 return (
                   <div key={tier.id} className="p-1 rounded-2xl bg-black relative shadow-xl">
                      <div className="absolute top-0 right-5 transform -translate-y-1/2 bg-white text-black text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-black shadow">Most Popular</div>
                      <div className="p-5 rounded-xl bg-black">
                        <div className="flex justify-between items-center mb-3">
                           <h4 className="font-bold text-lg font-mono tracking-tight text-white flex items-center gap-2"><Zap className="w-4 h-4 text-white fill-white" /> Regular</h4>
                           <span className="text-sm font-bold text-white">{tier.price / 1000}K<span className="text-[10px] text-gray-400">/mo</span></span>
                        </div>
                        <ul className="text-xs text-gray-300 space-y-2 mb-5">
                           {tier.benefits.map((b, i) => (
                             <li key={i} className="flex flex-start gap-2"><CheckCircle2 className="w-3 h-3 text-white shrink-0 mt-0.5" /> <strong className="text-white">{b}</strong></li>
                           ))}
                        </ul>
                        <a href={`/subscribe?tier=${tier.rank}`} className="block w-full py-2.5 rounded-xl bg-white text-black text-center text-xs font-bold shadow-lg hover:bg-gray-200 active:scale-[0.98] transition-all border border-black/10">Upgrade Now</a>
                      </div>
                   </div>
                 );
              }

              if (tier.rank === 'PREMIUM') {
                 return (
                   <div key={tier.id} className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                         <h4 className="font-bold text-lg font-mono tracking-tight text-black flex items-center gap-2"><Crown className="w-4 h-4" /> VIP</h4>
                         <span className="text-sm font-bold text-black">{tier.price / 1000}K<span className="text-[10px] text-flx-text-muted">/mo</span></span>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-2 mb-4">
                         {tier.benefits.map((b, i) => (
                            <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-black shrink-0 mt-0.5" /> <strong className="text-black">{b}</strong></li>
                         ))}
                      </ul>
                      <a href={`/subscribe?tier=${tier.rank}`} className="block w-full text-center py-2.5 rounded-xl bg-white text-black text-xs font-bold border border-flx-border hover:bg-gray-50 active:scale-[0.98] transition-all">Upgrade Now</a>
                   </div>
                 );
              }
           })}
        </div>
      </div>
    </div>
  );
}
