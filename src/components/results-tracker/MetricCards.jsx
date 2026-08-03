"use client";

import React from 'react';
import { Eye, Heart, MessageCircle, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function MetricCards({ metrics }) {
  const items = [
    { key: 'views', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50' },
    { key: 'engagements', icon: Heart, color: 'text-orange-500', bg: 'bg-orange-50' },
    { key: 'comments', icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
    { key: 'linkTaps', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 animate-pulse shadow-sm">
            <div className="h-3 bg-slate-100 rounded w-20 mb-4" />
            <div className="h-8 bg-slate-100 rounded w-28 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-16" />
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
          <div key={item.key} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", item.bg)}>
                <item.icon size={16} className={item.color} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.label}</span>
            </div>
            
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-black text-slate-900">
                {displayValue}
              </h3>
              {data.change !== 0 && (
                <div className={cn(
                  "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold",
                  isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}>
                  {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {Math.abs(data.change)}%
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">vs last week</p>
          </div>
        );
      })}
    </div>
  );
}