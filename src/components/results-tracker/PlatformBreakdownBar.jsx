"use client";

import React from 'react';

export default function PlatformBreakdownBar({ breakdown }) {
  if (!breakdown) {
    return (
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-32 mb-4" />
        <div className="h-2 bg-zinc-800 rounded w-full mb-4" />
        <div className="flex gap-4">
          <div className="h-3 bg-zinc-800 rounded w-16" />
          <div className="h-3 bg-zinc-800 rounded w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5">
      <h3 className="text-white text-sm font-medium mb-4">Where your views came from</h3>
      
      <div className="w-full h-2 bg-[#1F1F1F] rounded-full flex overflow-hidden mb-4">
        {breakdown.map((item, i) => (
          <div 
            key={i}
            style={{ 
              width: `${item.percentage}%`,
              backgroundColor: item.color 
            }}
            className="h-full"
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {breakdown.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-zinc-400 text-[10px] font-medium">{item.platform}</span>
            <span className="text-white text-[10px] font-bold">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}