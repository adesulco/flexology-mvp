"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Logo } from "./Logo";

interface HeaderProps {
  points?: number;
}

export function Header({ points = 0 }: HeaderProps) {
  return (
    <header className="px-6 py-6 pt-10 flex justify-between items-center bg-flx-dark/80 backdrop-blur-xl sticky top-0 z-40 border-b border-flx-border">
      <div className="flex items-center gap-3">
        <div className="h-6 w-auto shrink-0 flex items-center justify-center">
          <Logo />
        </div>
        <div className="pl-3 border-l border-flx-border/30">
          <h1 className="text-sm font-bold text-flx-text tracking-tight leading-none mb-1">Welcome back!</h1>
          <p className="text-[10px] text-flx-text-muted uppercase tracking-widest font-bold">Flexology App</p>
        </div>
      </div>
      
      <div className="flex gap-4 items-center">
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest text-flx-teal font-semibold">FLX Points</span>
          <span className="font-mono font-bold text-sm">{points.toLocaleString()}</span>
        </div>
        <button aria-label="Notifications" className="relative p-2.5 rounded-full bg-flx-card border border-flx-border hover:bg-flx-card-hover transition-colors active:scale-95">
          <Bell className="w-4 h-4 text-flx-text" />
        </button>
      </div>
    </header>
  );
}
