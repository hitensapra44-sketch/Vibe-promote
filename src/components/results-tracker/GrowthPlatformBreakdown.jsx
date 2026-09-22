"use client";

import React from 'react';
import { Globe, Search, PenLine, Calendar, CheckCircle2 } from 'lucide-react';

export default function GrowthPlatformBreakdown({ platformRows }) {
  if (!platformRows || platformRows.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
        <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-700">No Platform Activity Yet</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Start spotting users in User Finder or drafting posts in Post Maker to see your platform activity breakdown.
        </p>
      </div>
    );
  }

  const formatNum = (val) => (val ?? 0).toLocaleString();

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Platform Breakdown</h3>
          <p className="text-xs text-slate-400 mt-0.5">Marketing workload distributed across platforms with real activity</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
          {platformRows.length} Active {platformRows.length === 1 ? 'Platform' : 'Platforms'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4 font-bold">Platform</th>
              <th className="px-6 py-4 font-bold text-center">
                <span className="inline-flex items-center gap-1.5"><Search size={12} className="text-blue-500" /> People Found</span>
              </th>
              <th className="px-6 py-4 font-bold text-center">
                <span className="inline-flex items-center gap-1.5"><PenLine size={12} className="text-amber-500" /> Posts Created</span>
              </th>
              <th className="px-6 py-4 font-bold text-center">
                <span className="inline-flex items-center gap-1.5"><Calendar size={12} className="text-purple-500" /> Scheduled</span>
              </th>
              <th className="px-6 py-4 font-bold text-center">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Published</span>
              </th>
              <th className="px-6 py-4 font-bold text-right">Total Work</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {platformRows.map((row) => {
              const totalWork = (row.peopleFound || 0) + (row.postsCreated || 0) + (row.postsScheduled || 0) + (row.postsPublished || 0);

              return (
                <tr key={row.platform} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color || '#F97316' }} />
                      <span className="font-bold text-slate-800">{row.platform}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-700">
                    {formatNum(row.peopleFound)}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-700">
                    {formatNum(row.postsCreated)}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-700">
                    {formatNum(row.postsScheduled)}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-emerald-600">
                    {formatNum(row.postsPublished)}
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                    {formatNum(totalWork)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}