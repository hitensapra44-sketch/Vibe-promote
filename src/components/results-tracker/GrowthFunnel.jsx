"use client";

import React from 'react';
import { Search, PenLine, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function GrowthFunnel({ stages }) {
  const steps = [
    {
      key: 'found',
      label: 'People Found',
      sublabel: 'Audience signals spotted',
      icon: Search,
      count: stages?.peopleFound || 0,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      barColor: 'bg-blue-500'
    },
    {
      key: 'created',
      label: 'Posts Created',
      sublabel: 'Crafted in Post Maker',
      icon: PenLine,
      count: stages?.postsCreated || 0,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      barColor: 'bg-amber-500'
    },
    {
      key: 'scheduled',
      label: 'Posts Scheduled',
      sublabel: 'Queued for delivery',
      icon: Calendar,
      count: stages?.postsScheduled || 0,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      barColor: 'bg-purple-500'
    },
    {
      key: 'published',
      label: 'Posts Published',
      sublabel: 'Successfully shipped',
      icon: CheckCircle2,
      count: stages?.postsPublished || 0,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      barColor: 'bg-emerald-500'
    }
  ];

  const maxCount = Math.max(...steps.map(s => s.count), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Execution Progression Funnel</h2>
          <p className="text-xs text-slate-500 font-medium">Tracking your marketing actions from initial discovery to live publication</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold">
          <span>{steps.reduce((acc, s) => acc + s.count, 0)} Total Actions</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {steps.map((step, idx) => {
          const percentage = Math.round((step.count / maxCount) * 100);
          const prevCount = idx > 0 ? steps[idx - 1].count : null;
          const dropoff = prevCount !== null && prevCount > 0 
            ? `${Math.round((step.count / prevCount) * 100)}% of step ${idx}`
            : null;

          return (
            <div
              key={step.key}
              className={cn(
                "relative rounded-2xl p-5 border flex flex-col justify-between transition-all",
                step.bg,
                step.border
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center bg-white shadow-xs", step.color)}>
                    <step.icon size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Stage {idx + 1}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {step.count.toLocaleString()}
                  </h3>
                  <p className="text-xs font-bold text-slate-800">{step.label}</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">{step.sublabel}</p>
                </div>
              </div>

              <div className="mt-5 space-y-1.5">
                <div className="w-full bg-white/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", step.barColor)}
                    style={{ width: `${Math.max(percentage, step.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
                {dropoff && (
                  <p className="text-[10px] text-slate-500 font-medium">{dropoff}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}