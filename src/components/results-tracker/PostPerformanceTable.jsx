"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { ExternalLink } from 'lucide-react';

export default function PostPerformanceTable({ posts, showAll, onToggleShowAll, platform }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl py-10 text-center">
        <p className="text-zinc-500 text-sm">No posts tracked yet this period</p>
      </div>
    );
  }

  const formatNum = (val) => (val ?? 0).toLocaleString();
  const isReddit = platform === 'Reddit';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-white text-sm font-semibold">Post Performance</h3>
        <button 
          onClick={onToggleShowAll}
          className="text-orange-500 text-xs font-bold hover:underline bg-transparent"
        >
          {showAll ? "Show less" : "Show all"}
        </button>
      </div>

      <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1A1A] text-zinc-400 text-[10px] uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Post</th>
                <th className="px-4 py-3 font-semibold">Platform</th>
                <th className="px-4 py-3 font-semibold">{isReddit ? 'Upvotes' : 'Engagements'}</th>
                <th className="px-4 py-3 font-semibold">Comments</th>
                <th className="px-4 py-3 font-semibold">{isReddit ? 'Engagement' : 'Link Taps'}</th>
                <th className="px-4 py-3 font-semibold">Action</th>
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
                        <span className="text-white text-sm truncate max-w-[200px]">
                          {post.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{post.platform}</td>
                    <td className="px-4 py-3 text-white text-sm">{formatNum(post.engagements)}</td>
                    <td className="px-4 py-3 text-white text-sm">{formatNum(post.comments)}</td>
                    <td className="px-4 py-3 text-white text-sm">{formatNum(post.linkTaps)}</td>
                    <td className="px-4 py-3">
                      {post.url && (
                        <a 
                          href={post.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-[10px] font-bold hover:bg-white/10 transition-all"
                        >
                          View Post <ExternalLink size={10} />
                        </a>
                      )}
                    </td>
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
                              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">{isReddit ? 'Upvotes' : 'Engagements'}</p>
                              <p className="text-white text-lg font-bold">{formatNum(post.engagements)}</p>
                            </div>
                            <div>
                              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Comments</p>
                              <p className="text-white text-lg font-bold">{formatNum(post.comments)}</p>
                            </div>
                            <div>
                              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">{isReddit ? 'Engagement' : 'Link Taps'}</p>
                              <p className="text-white text-lg font-bold">{formatNum(post.linkTaps)}</p>
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
    </div>
  );
}