"use client";

import React, { useState } from 'react';
import { MessageSquare, Twitter, AtSign, Briefcase, Code2, Rocket } from 'lucide-react';
import { cn } from "@/lib/utils";

const platforms = [
  { id: 'Reddit', name: 'Reddit', desc: 'Value-first. Lead with insight.', icon: MessageSquare },
  { id: 'X', name: 'X', desc: 'Hook-first. Punchy and direct.', icon: Twitter },
  { id: 'Threads', name: 'Threads', desc: 'Conversational. Short and real.', icon: AtSign },
  { id: 'LinkedIn', name: 'LinkedIn', desc: 'Professional meets personal.', icon: Briefcase },
  { id: 'Indie Hackers', name: 'Indie Hackers', desc: 'Founder stories win here.', icon: Code2 },
  { id: 'Product Hunt', name: 'Product Hunt', desc: 'Make your launch land.', icon: Rocket },
];

export default function PlatformSelector({ onSelect }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="max-w-[680px] mx-auto py-10 flex flex-col">
      <div className="space-y-1">
        <h1 className="text-white text-2xl font-semibold mt-4">Post Maker</h1>
        <p className="text-zinc-400 text-sm mt-1">Where are you posting today?</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
        {platforms.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={cn(
              "bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 cursor-pointer flex flex-col items-center gap-2 text-center hover:border-zinc-600 transition-all",
              selected === p.id && "border-orange-500 bg-orange-500/5"
            )}
          >
            <p.icon 
              size={24} 
              className={cn(
                "transition-colors",
                selected === p.id ? "text-orange-500" : "text-zinc-400"
              )} 
            />
            <span className="text-white text-sm font-medium">{p.name}</span>
            <span className="text-zinc-500 text-xs">{p.desc}</span>
          </div>
        ))}
      </div>

      {selected && (
        <button
          onClick={() => onSelect(selected)}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg px-6 py-2.5 mt-6 mx-auto block transition-colors"
        >
          Continue with {selected} →
        </button>
      )}
    </div>
  );
}