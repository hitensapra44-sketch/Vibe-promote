"use client";

import React from 'react';

export default function PlatformBreakdownBar({ breakdown }) {
  if (!breakdown) {
    return (
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-6 animate-pulse">
        <div className="h-5 bg-zinc-800 rounded w-48 mb-6" />
        <div className="h-4 bg-zinc-800 rounded w-full mb-6" />
        <div className="flex gap-6">
          <div className="h-4 bg-zinc-800 rounded w-24" />
          <div className="h-4 bg-zinc-800 rounded w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-8">
      <h3 className="text-white text-lg font-semibold mb-6">Where your views came from</h3>
      
      <div className="w-full h-4 bg-[#1F1F1F] rounded-full flex overflow-hidden mb-8">
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
            <span className="text-zinc-400 text-sm font-medium">{item.platform}</span>
            <span className="text-white text-sm font-bold">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}