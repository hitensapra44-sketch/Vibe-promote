"use client";

import React, { useState } from 'react';
import { PenLine, LayoutTemplate } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function PostModeSelector({ platform, onSelectMode, onBack }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="max-w-[580px] mx-auto py-10 flex flex-col">
      <button 
        onClick={onBack}
        className="text-zinc-400 text-sm mb-6 cursor-pointer hover:text-zinc-200 transition-colors flex items-center gap-2 bg-transparent"
      >
        ← Back
      </button>

      <div className="space-y-1">
        <h2 className="text-white text-xl font-semibold">How do you want to create your post?</h2>
        <p className="text-zinc-400 text-sm mt-1">
          For <span className="text-orange-400">{platform}</span>
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-8">
        <div
          onClick={() => setSelected('write')}
          className={cn(
            "bg-[#111111] border border-[#1F1F1F] rounded-xl p-6 cursor-pointer hover:border-zinc-600 transition-all relative",
            selected === 'write' && "border-orange-500 bg-orange-500/5"
          )}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <PenLine size={20} className="text-orange-500" />
            </div>
            <div>
              <h3 className="text-white text-base font-medium">Write it yourself</h3>
              <p className="text-zinc-400 text-sm mt-1">Write your post and use AI to polish it when you're done.</p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 bg-[#1F1F1F] text-orange-400 text-[10px] font-bold rounded-full px-2 py-0.5 uppercase tracking-wider">
            AI Polish on demand
          </div>
        </div>

        <div
          onClick={() => setSelected('template')}
          className={cn(
            "bg-[#111111] border border-[#1F1F1F] rounded-xl p-6 cursor-pointer hover:border-zinc-600 transition-all relative",
            selected === 'template' && "border-orange-500 bg-orange-500/5"
          )}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <LayoutTemplate size={20} className="text-orange-500" />
            </div>
            <div>
              <h3 className="text-white text-base font-medium">Use a template</h3>
              <p className="text-zinc-400 text-sm mt-1">AI generates platform-specific templates that work. Pick one and make it yours.</p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 bg-[#1F1F1F] text-orange-400 text-[10px] font-bold rounded-full px-2 py-0.5 uppercase tracking-wider">
            AI generated
          </div>
        </div>
      </div>

      {selected && (
        <button
          onClick={() => onSelectMode(selected)}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg px-6 py-2.5 mt-6 mx-auto block transition-colors"
        >
          Continue →
        </button>
      )}
    </div>
  );
}