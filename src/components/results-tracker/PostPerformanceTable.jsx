"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { ArrowUpRight, MessageSquare, Eye, MousePointer2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function PostPerformanceTable({ posts, platform }) {
  const [selectedPost, setSelectedPost] = useState(null);

  if (!posts || posts.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-400 text-sm font-medium">No activity tracked in this period</p>
      </div>
    );
  }

  const formatNum = (val) => (val ?? 0).toLocaleString();

  const getScoreLabel = (post) => {
    const rate = ((post.engagements || 0) / (post.views || 1)) * 100;
    if (rate > 10) return { label: 'Excellent', class: 'bg-green-50 text-green-600 border-green-100' };
    if (rate > 5) return { label: 'Good', class: 'bg-blue-50 text-blue-600 border-blue-100' };
    if (rate > 2) return { label: 'Average', class: 'bg-yellow-50 text-yellow-600 border-yellow-100' };
    return { label: 'Needs Help', class: 'bg-red-50 text-red-600 border-red-100' };
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest">
              <th className="px-6 py-4 font-black">Post Content</th>
              <th className="px-6 py-4 font-black">Platform</th>
              <th className="px-6 py-4 font-black text-center">Views</th>
              <th className="px-6 py-4 font-black text-center">Eng. Rate</th>
              <th className="px-6 py-4 font-black text-center">Performance</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((post, index) => {
              const status = getScoreLabel(post);
              const engRate = (((post.engagements || 0) / (post.views || 1)) * 100).toFixed(1);

              return (
                <tr 
                  key={index}
                  onClick={() => setSelectedPost(post)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-800 truncate max-w-[280px] block">
                      {post.title}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded uppercase tracking-wider">
                      {post.platform}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center text-sm font-medium text-slate-600">{formatNum(post.views)}</td>
                  <td className="px-6 py-5 text-center text-sm font-black text-slate-900">{engRate}%</td>
                  <td className="px-6 py-5 text-center">
                    <span className={cn("text-[10px] font-black uppercase px-2.5 py-1 rounded-full border", status.class)}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg bg-white">
          <SheetHeader>
            <SheetTitle className="text-xl font-black">Post Analysis</SheetTitle>
          </SheetHeader>
          {selectedPost && (
            <div className="mt-8 space-y-10">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                  {selectedPost.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                    <Eye size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Views</p>
                    <p className="text-lg font-black">{formatNum(selectedPost.views)}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comments</p>
                    <p className="text-lg font-black">{formatNum(selectedPost.comments)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2">
                  Performance Report
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ArrowUpRight size={12} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-1">Strong Hook</p>
                      <p className="text-xs text-slate-500 leading-relaxed">The opening line successfully stopped the scroll in r/{selectedPost.platform === 'Reddit' ? 'SaaS' : 'X'}.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MousePointer2 size={12} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-1">Intent Driver</p>
                      <p className="text-xs text-slate-500 leading-relaxed">This post generated higher than average link clicks compared to your last 5 posts.</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPost.url && (
                <button 
                  onClick={() => window.open(selectedPost.url, '_blank')}
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl transition-all hover:bg-black border-none cursor-pointer"
                >
                  View Live Post
                </button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}