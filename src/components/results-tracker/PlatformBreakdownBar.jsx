"use client";

import React from 'react';
import { cn } from "@/lib/utils";

export default function PlatformBreakdownBar({ breakdown, metric, onMetricChange }) {
  const metrics = [
    { id: 'views', label: 'Views' },
    { id: 'engagements', label: 'Engagement' },
    { id: 'linkTaps', label: 'Link Taps' },
    { id: 'comments', label: 'Comments' }
  ];

  if (!breakdown) {
    return (
      <div className="bg-background border border-foreground/10 rounded-xl p-6 animate-pulse">
        <div className="h-5 bg-zinc-200 rounded w-48 mb-6" />
        <div className="h-4 bg-zinc-200 rounded w-full mb-6" />
        <div className="flex gap-6">
          <div className="h-4 bg-zinc-200 rounded w-24" />
          <div className="h-4 bg-zinc-200 rounded w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border border-foreground/10 rounded-xl p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h3 className="text-foreground text-lg font-semibold">
          Where your {metrics.find(m => m.id === metric)?.label.toLowerCase()} came from
        </h3>
        
        <div className="flex bg-foreground/5 border border-foreground/10 rounded-lg p-1">
          {metrics.map((m) => (
            <button
              key={m.id}
              onClick={() => onMetricChange(m.id)}
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 transition-all",
                metric === m.id 
                  ? "bg-orange-500 text-white rounded-md" 
                  : "bg-transparent text-zinc-500 hover:text-zinc-800"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="w-full h-4 bg-foreground/10 rounded-full flex overflow-hidden mb-8">
        {breakdown.map((item, i) => (
          <div 
            key={i}
            style={{ 
              width: `${item.percentage}%`,
              backgroundColor: item.color 
            }}
            className="h-full transition-all duration-500"
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-4">
        {breakdown.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-zinc-500 text-sm font-medium">{item.platform}</span>
            <span className="text-foreground text-sm font-bold">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}