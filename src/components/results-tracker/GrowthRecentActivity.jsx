"use client";

import React from 'react';
import { Search, PenLine, Calendar, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function GrowthRecentActivity({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-700">No Recent Activity</h3>
        <p className="text-xs text-slate-400 mt-1">Actions taken inside Vibe Promote will appear here in chronological order.</p>
      </div>
    );
  }

  const getActionBadge = (type) => {
    switch (type) {
      case 'found':
        return {
          label: 'Found Opportunity',
          icon: Search,
          color: 'text-blue-600 bg-blue-50 border-blue-100'
        };
      case 'created':
        return {
          label: 'Created Post',
          icon: PenLine,
          color: 'text-amber-600 bg-amber-50 border-amber-100'
        };
      case 'scheduled':
        return {
          label: 'Scheduled Post',
          icon: Calendar,
          color: 'text-purple-600 bg-purple-50 border-purple-100'
        };
      case 'published':
        return {
          label: 'Published Post',
          icon: CheckCircle2,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
        };
      default:
        return {
          label: 'Activity',
          icon: Clock,
          color: 'text-slate-600 bg-slate-50 border-slate-100'
        };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Recent Growth Actions</h3>
          <p className="text-xs text-slate-400 mt-0.5">Chronological log derived from your marketing workflow</p>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Showing latest {activities.length}
        </span>
      </div>

      <div className="space-y-3">
        {activities.map((item, idx) => {
          const badge = getActionBadge(item.type);
          const Icon = badge.icon;
          const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div
              key={idx}
              className="p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border mt-0.5", badge.color)}>
                  <Icon size={14} />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", badge.color)}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      {item.platform}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 leading-snug break-words line-clamp-2">
                    {item.title || item.description || 'Marketing action recorded'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                  {formattedDate}
                </span>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 hover:underline"
                  >
                    View <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}