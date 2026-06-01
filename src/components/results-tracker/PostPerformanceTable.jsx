"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { ExternalLink, ArrowUpRight } from 'lucide-react';

export default function PostPerformanceTable({ posts, showAll, onToggleShowAll, platform }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-background border border-foreground/10 rounded-xl py-10 text-center">
        <p className="text-zinc-500 text-sm">No posts tracked yet this period</p>
      </div>
    );
  }

  const formatNum = (val) => (val ?? 0).toLocaleString();
  const isReddit = platform === 'Reddit' || platform === 'All Platforms';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-foreground text-sm font-semibold">Post Performance</h3>
        <button 
          onClick={onToggleShowAll}
          className="text-orange-500 text-xs font-bold hover:underline bg-transparent"
        >
          {showAll ? "Show less" : "Show all"}
        </button>
      </div>

      <div className="bg-background border border-foreground/10 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 text-zinc-500 text-[10px] uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Post</th>
                <th className="px-4 py-3 font-semibold">Platform</th>
                <th className="px-4 py-3 font-semibold">{isReddit ? 'Upvotes' : 'Engagements'}</th>
                <th className="px-4 py-3 font-semibold">Comments</th>
                <th className="px-4 py-3 font-semibold">Engagement</th>
                <th className="px-4 py-3 font-semibold">Link</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, index) => (
                <React.Fragment key={index}>
                  <tr 
                    onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                    className="border-t border-foreground/10 hover:bg-foreground/5 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 group/title">
                        <span className="text-foreground text-sm truncate max-w-[200px]">
                          {post.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{post.platform}</td>
                    <td className="px-4 py-3 text-foreground text-sm">{formatNum(post.upvotes)}</td>
                    <td className="px-4 py-3 text-foreground text-sm">{formatNum(post.comments)}</td>
                    <td className="px-4 py-3 text-foreground text-sm font-bold">{formatNum(post.engagement)}</td>
                    <td className="px-4 py-3">
                      {post.url && (
                        <a 
                          href={post.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-lg bg-foreground/5 border border-foreground/10 text-zinc-500 hover:text-orange-500 hover:bg-orange-500/10 transition-all inline-flex items-center justify-center"
                        >
                          <ArrowUpRight size={14} />
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {post.url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(post.url, '_blank', 'noopener,noreferrer');
                          }}
                          className="text-zinc-500 hover:text-orange-400 transition-colors bg-transparent p-1"
                        >
                          <ExternalLink size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedRow === index && (
                    <tr className="bg-foreground/5">
                      <td colSpan={7} className="px-8 py-6 border-t border-foreground/10">
                        <div className="space-y-4">
                          <p className="text-zinc-700 text-sm leading-relaxed">
                            {post.title}
                          </p>
                          <div className="grid grid-cols-3 gap-8">
                            <div>
                              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">{isReddit ? 'Upvotes' : 'Engagements'}</p>
                              <p className="text-foreground text-lg font-bold">{formatNum(post.upvotes)}</p>
                            </div>
                            <div>
                              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Comments</p>
                              <p className="text-foreground text-lg font-bold">{formatNum(post.comments)}</p>
                            </div>
                            <div>
                              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Total Engagement</p>
                              <p className="text-lg font-bold text-orange-500">{formatNum(post.engagement)}</p>
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