import { formatRupiah, formatRate } from "@/lib/format";
import { User, Settings, CreditCard, Shield, HelpCircle, LogOut, ChevronRight, Share } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/actions/authActions";
import { redirect } from "next/navigation";
import { ProfileEditor } from "./ProfileEditor";
import { MysteryBoxBanner } from "./MysteryBoxClient";

export default async function Profile() {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  // Fetch real database metrics
  const userData = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: {
      _count: {
        select: { bookings: true }
      }
    }
  });

  if (!userData) {
     redirect('/login?clear=true');
  }

  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : '?';
  
  return (
    <div className="flex flex-col min-h-full bg-white pb-20">
      <header className="px-6 py-4 pt-10 sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-flx-border mb-6 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-black text-center">My Profile</h1>
      </header>

      <div className="px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-flx-teal to-blue-500 p-1 mb-4 shadow-md">
            <div className="w-full h-full rounded-full bg-white border-4 border-white overflow-hidden flex items-center justify-center">
               <span className="text-3xl font-bold text-black uppercase">{userInitial}</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-black tracking-tight">{userData.name}</h2>
          <p className="text-flx-text-muted text-sm flex items-center gap-1.5 mt-1">
             {userData.email}
          </p>
          <div className="mt-3 px-3 py-1 bg-flx-teal/10 rounded-full flex items-center gap-2 border border-flx-teal/20">
             <span className="w-2 h-2 rounded-full bg-flx-teal animate-pulse" /> 
             <span className="text-xs font-bold text-black uppercase tracking-wider">{userData.tier} Tier</span>
          </div>
        </div>

        {userData.mysteryBoxes > 0 && (
           <MysteryBoxBanner count={userData.mysteryBoxes} />
        )}

        <div className="mb-6 bg-flx-card border border-flx-border rounded-2xl p-5 shadow-sm">
           <div className="flex justify-between items-end mb-3">
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-flx-text-muted mb-1">Current Tier</p>
                 <h3 className="text-xl font-black text-black tracking-tight">{userData.tier.replace('_', ' ')}</h3>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-flx-text-muted mb-1">Member Since</p>
                 <p className="text-sm font-bold text-black">{new Date(userData.createdAt).getFullYear()}</p>
              </div>
           </div>
           
           <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
             <div className="bg-black h-2.5 rounded-full" style={{ width: userData.tier === 'PREMIUM' ? '100%' : userData.tier === 'FLEX_PLUS' ? '60%' : '20%' }}></div>
           </div>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center mt-3">
             {userData.tier === 'PREMIUM' ? 'Max Tier Reached' : userData.tier === 'FLEX_PLUS' ? 'Keep booking to reach Premium' : 'Keep booking to reach Flex Plus'}
           </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
           <div className="bg-flx-card border border-flx-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-mono text-black mb-1">{userData._count.bookings}</span>
              <span className="text-xs font-bold text-flx-text-muted uppercase tracking-wider">Total Sessions</span>
           </div>
           <div className="bg-flx-card border border-flx-border rounded-xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 opacity-10 text-6xl -mr-4 -mt-2">🔥</div>
              <span className="text-2xl font-bold font-mono text-black mb-1 flex items-center gap-1">
                 {userData.currentStreak} <span className="text-xs">mo</span>
              </span>
              <span className="text-xs font-bold text-flx-text-muted uppercase tracking-wider">Active Streak</span>
           </div>
           
           <div className="col-span-2 bg-gradient-to-tr from-flx-teal/10 to-blue-500/5 border border-flx-teal/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                 <span className="text-3xl font-bold font-mono text-black">{formatRate(userData.points)}</span>
                 <p className="text-xs font-bold text-flx-teal uppercase tracking-wider">Available FLX Points</p>
              </div>
              <div className="text-right">
                 <span className="text-xs font-bold text-gray-500 block mb-1">STREAK SHIELDS</span>
                 <div className="flex gap-1 justify-end">
                    {[...Array(Math.max(3, userData.streakShields))].map((_, i) => (
                       <div key={i} className={`w-3 h-4 rounded-sm ${i < userData.streakShields ? 'bg-flx-teal' : 'bg-gray-200'}`} />
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Profile Interactive Editor */}
        <ProfileEditor user={userData} />

        {/* Achievement Badges Segment */}
        <div className="mt-8 mb-6">
           <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-4 flex items-center gap-2">
              🏆 Trophy Cabinet ({userData.badges.length})
           </h3>
           <div className="grid grid-cols-3 gap-3">
              {['FIRST_TIMER', 'FLEX_REGULAR', 'EARLY_BIRD', 'EXPLORER', 'STREAK_LEGEND'].map(badgeKey => {
                 const earned = userData.badges.includes(badgeKey);
                 const badgeData: Record<string, any> = {
                    FIRST_TIMER: { icon: "🌱", label: "First Start" },
                    FLEX_REGULAR: { icon: "🔥", label: "Regular" },
                    EARLY_BIRD: { icon: "🌅", label: "Early Bird" },
                    EXPLORER: { icon: "🗺️", label: "Explorer" },
                    STREAK_LEGEND: { icon: "⚡", label: "Legend" }
                 };
                 const b = badgeData[badgeKey];
                 return (
                    <div key={badgeKey} className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${earned ? 'bg-white border-flx-teal shadow-sm' : 'bg-gray-50 border-gray-100 opacity-40 grayscale'} transition-all`}>
                       <div className="text-3xl mb-2 filter drop-shadow-sm">{b.icon}</div>
                       <span className="text-[9px] font-black uppercase tracking-wider text-center text-black leading-tight">{b.label}</span>
                    </div>
                 );
              })}
           </div>
        </div>

        <div className="bg-flx-card border border-flx-border rounded-2xl overflow-hidden mb-6 mt-6">
          <ProfileLink icon={CreditCard} label="Payment Methods" />
          <hr className="border-flx-border/50 ml-12" />
          <ProfileLink icon={Shield} label="Trust & Safety" />
          <hr className="border-flx-border/50 ml-12" />
          <ProfileLink icon={HelpCircle} label="Help & Support" />
        </div>

        <form action={logout}>
           <button type="submit" className="w-full p-4 rounded-2xl border border-red-500/30 bg-red-500/5 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 active:scale-95 transition-all">
             <LogOut className="w-5 h-5" /> Sign Out
           </button>
        </form>

      </div>
    </div>
  );
}

function ProfileLink({ icon: Icon, label, value, highlight = false }: { icon: any, label: string, value?: string, highlight?: boolean }) {
  return (
    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors active:bg-gray-100">
      <div className="flex items-center gap-3">
         <Icon className={`w-5 h-5 ${highlight ? 'text-black' : 'text-flx-text-muted'}`} />
         <span className={`text-sm font-medium ${highlight ? 'text-black font-bold' : 'text-gray-700'}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
         {value && <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${highlight ? 'bg-black/5 text-black' : 'text-flx-text-muted'}`}>{value}</span>}
         <ChevronRight className="w-4 h-4 text-flx-text-muted" />
      </div>
    </button>
  );
}
