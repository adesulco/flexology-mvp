"use client";


import { Home, CalendarClock, Trophy, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  // Hide entirely on admin, login, register, and wizard flows
  if (pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/book")) {
     return null;
  }

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Bookings", href: "/bookings", icon: CalendarClock },
    { name: "Rewards", href: "/rewards", icon: Trophy },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 pb-safe pt-3 px-6 max-w-[480px] mx-auto">
      <div className="flex justify-between items-center mb-4 mt-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center gap-1.5 transition-colors ${
                isActive ? "text-flx-teal" : "text-gray-500 hover:text-white"
              }`}
            >
              <tab.icon className={`w-6 h-6 ${isActive ? "" : ""}`} />
              <span className="text-[10px] font-medium tracking-wide">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
