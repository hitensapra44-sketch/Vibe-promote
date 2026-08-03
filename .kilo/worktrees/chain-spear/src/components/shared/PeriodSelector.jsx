"use client";

import React from 'react';
import { cn } from "@/lib/utils";

export default function PeriodSelector({ selected, onChange }) {
  const options = ["This Week", "Last Week", "This Month", "Last Month"];

  return (
    <div className="flex bg-[#111111] border border-[#1F1F1F] rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            "text-sm font-medium px-4 py-2 transition-all duration-200",
            selected === option 
              ? "bg-orange-500 text-white rounded-md shadow-lg shadow-orange-500/20" 
              : "bg-transparent text-zinc-400 hover:text-zinc-200"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}