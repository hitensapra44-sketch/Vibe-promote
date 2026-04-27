"use client";

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function PlatformCard({ name, description, icon, status, onClick, selected }) {
  const isComingSoon = status === "coming-soon";
  const isConnected = status === "connected";

  return (
    <div 
      onClick={!isComingSoon ? onClick : undefined}
      className={cn(
        "relative bg-[#111111] border border-[#1F1F1F] rounded-xl p-6 flex flex-col items-center gap-3 text-center transition-all",
        !isComingSoon && "cursor-pointer hover:border-orange-500/30",
        selected && "border-orange-500 bg-orange-500/5",
        isComingSoon && "opacity-40 cursor-not-allowed"
      )}
    >
      {isComingSoon && (
        <span className="absolute top-3 right-3 bg-[#1F1F1F] text-zinc-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          COMING SOON
        </span>
      )}
      
      {isConnected && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={16} className="text-green-500" />
        </div>
      )}

      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center bg-white/5",
        selected && "bg-orange-500/10 text-orange-500"
      )}>
        {icon}
      </div>

      <div>
        <h3 className="text-white text-sm font-medium mb-1">{name}</h3>
        <p className="text-zinc-400 text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
}