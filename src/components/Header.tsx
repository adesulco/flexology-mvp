import { Bell } from "lucide-react";
import { Logo } from "./Logo";

interface HeaderProps {
  points?: number;
}

export function Header({ points = 1250 }: HeaderProps) {
  return (
    <header className="px-6 py-6 pt-10 flex justify-between items-center bg-flx-dark/80 backdrop-blur-xl sticky top-0 z-40 border-b border-flx-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 overflow-hidden">
          <Logo />
        </div>
        <div>
          <h1 className="text-lg font-bold text-flx-text tracking-tight">Welcome back!</h1>
          <p className="text-xs text-flx-text-muted">You have {points} FLX</p>
        </div>
      </div>
      
      <div className="flex gap-4 items-center">
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest text-flx-teal font-semibold">FLX Points</span>
          <span className="font-mono font-bold text-sm">{points.toLocaleString()}</span>
        </div>
        <button className="relative p-2 rounded-full bg-flx-card border border-flx-border hover:bg-flx-card-hover transition-colors">
          <Bell className="w-4 h-4 text-flx-text" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-flx-card"></span>
        </button>
      </div>
    </header>
  );
}
