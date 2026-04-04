"use client";


import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({ 
  name = "password", 
  placeholder = "••••••••", 
  required = true,
  className = "" 
}: { 
  name?: string, 
  placeholder?: string, 
  required?: boolean,
  className?: string
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`relative mt-1`}>
      <input 
        type={showPassword ? "text" : "password"} 
        name={name} 
        required={required} 
        className={`w-full p-4 rounded-xl focus:ring-1 outline-none transition-all pr-12 font-mono placeholder:text-gray-400 placeholder:font-sans ${className || "bg-flx-card border border-flx-border focus:ring-black"}`} 
        placeholder={placeholder} 
      />
      <button 
        type="button" 
        onClick={() => setShowPassword(!showPassword)} 
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors focus:outline-none"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
