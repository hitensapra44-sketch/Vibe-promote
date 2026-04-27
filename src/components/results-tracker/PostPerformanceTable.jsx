"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";

export default function PostPerformanceTable({ posts }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl py-10 text-center">
        <p className="text-zinc-500 text-sm">No posts tracked yet this period</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1A1A1A] text-zinc-400 text-[10px] uppercase tracking-wider">
              <th className="px-4 py-3 font-semibold">Post</th>
              <th className="px-4 py-3 font-semibold">Platform</th>
              <th className="px-4 py-3 font-semibold">Views</th>
              <th className="px-4 py-3 font-semibold">Engagements</th>
              <th className="px-4 py-3 font-semibold">Link Taps</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <React.Fragment key={index}>
                <tr 
                  onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                  className="border-t border-[#1F1F1F] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {post.isBest && (
                        <span className="bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          🔥 Best
                        </span>
                      )}
                      <span className="text-white text-sm truncate max-w-[200px]">
                        {post.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{post.platform}</td>
                  <td className="px-4 py-3 text-white text-sm">{post.views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-white text-sm">{post.engagements.toLocaleString()}</td>
                  <td className="px-4 py-3 text-white text-sm">{post.linkTaps.toLocaleString()}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{post.date}</td>
                </tr>
                {expandedRow === index && (
                  <tr className="bg-[#1A1A1A]/50">
                    <td colSpan={6} className="px-8 py-6 border-t border-[#1F1F1F]">
                      <div className="space-y-4">
                        <p className="text-zinc-300 text-sm leading-relaxed">
                          {post.title}
                        </p>
                        <div className="grid grid-cols-3 gap-8">
                          <div>
                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Views</p>
                            <p className="text-white text-lg font-bold">{post.views.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Engagements</p>
                            <p className="text-white text-lg font-bold">{post.engagements.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Link Taps</p>
                            <p className="text-white text-lg font-bold">{post.linkTaps.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}