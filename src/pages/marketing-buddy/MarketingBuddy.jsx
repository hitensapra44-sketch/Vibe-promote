"use client";

import React from 'react';
import Sidebar from '../../components/Sidebar';
import BrandInfoPreview from '../../components/shared/BrandInfoPreview';
import BuddyChat from '../../components/marketing-buddy/BuddyChat';
import { Sparkles, Brain, Target, Zap, MessageSquare } from 'lucide-react';

export default function MarketingBuddy() {
  const mockBrandInfo = {
    appName: "Vibe Promote",
    problem: "Marketing takes too long",
    audience: "SaaS founders",
    tone: "Authentic Founder"
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col lg:flex-row min-w-0 h-screen">
        {/* Left Panel - Desktop Only */}
        <div className="hidden lg:flex w-72 border-r border-white/5 flex-col p-6 overflow-y-auto">
          <BrandInfoPreview 
            appName={mockBrandInfo.appName}
            problem={mockBrandInfo.problem}
            audience={mockBrandInfo.audience}
          />

          <div className="mt-8 space-y-6">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">What I know about you</p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Sparkles size={14} className="text-zinc-600 mt-0.5" />
                <div>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">App Name</p>
                  <p className="text-white text-sm font-medium">{mockBrandInfo.appName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Brain size={14} className="text-zinc-600 mt-0.5" />
                <div>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Problem Solved</p>
                  <p className="text-white text-sm font-medium">{mockBrandInfo.problem}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target size={14} className="text-zinc-600 mt-0.5" />
                <div>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Target Audience</p>
                  <p className="text-white text-sm font-medium">{mockBrandInfo.audience}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap size={14} className="text-zinc-600 mt-0.5" />
                <div>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Your Tone</p>
                  <p className="text-white text-sm font-medium">{mockBrandInfo.tone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <button className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors bg-transparent">
              Clear conversation
            </button>
          </div>
        </div>

        {/* Right Panel - Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <header className="px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white">Your 24/7 Marketing Buddy</h1>
              <div className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                ONLINE
              </div>
            </div>
            <p className="text-zinc-400 text-xs mt-1">Knows your app. Ready anytime.</p>
          </header>

          {/* Mobile Context Chip */}
          <div className="lg:hidden px-4 py-2 border-b border-white/5">
            <BrandInfoPreview 
              appName={mockBrandInfo.appName}
              problem={mockBrandInfo.problem}
              audience={mockBrandInfo.audience}
            />
          </div>

          <div className="flex-1 overflow-hidden p-4 sm:p-6">
            <BuddyChat brandInfo={mockBrandInfo} />
          </div>
        </div>
      </main>
    </div>
  );
}