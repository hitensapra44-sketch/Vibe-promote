"use client";

import React from 'react';
import { Eye, Heart, Link2, MessageCircle, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function MetricCards({ metrics }) {
  const items = [
    { key: 'views', icon: Eye },
    { key: 'engagements', icon: Heart },
    { key: 'comments', icon: MessageCircle },
    { key: 'linkTaps', icon: TrendingUp },
  ];

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-zinc-800 rounded w-24 mb-4" />
            <div className="h-8 bg-zinc-800 rounded w-32 mb-2" />
            <div className="h-3 bg-zinc-800 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const data = metrics[item.key];
        if (!data) return null;
        
        const isPositive = data.change >= 0;
        const displayValue = data.value.toLocaleString();

        return (
          <div key={item.key} className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-400">
                <item.icon size={16} />
                <span className="text-sm font-medium">{data.label}</span>
              </div>
            </div>
            
            <div className="mt-2">
              <h3 className="text-white text-3xl font-bold">
                {displayValue}
              </h3>
              {data.change !== 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className={cn(
                    "text-xs font-medium flex items-center",
                    isPositive ? "text-green-400" : "text-red-400"
                  )}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(data.change)}%
                  </span>
                  <span className="text-zinc-600 text-xs">vs last period</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}