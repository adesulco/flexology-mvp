"use client";

import { Home, CalendarClock, Trophy, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Bookings", href: "/bookings", icon: CalendarClock },
    { name: "Rewards", href: "/rewards", icon: Trophy },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-flx-border pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center mb-6 mt-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center gap-1.5 transition-colors ${
                isActive ? "text-flx-teal" : "text-flx-text-muted hover:text-black"
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
