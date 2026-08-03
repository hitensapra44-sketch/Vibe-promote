"use client";

import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  TrendingUp, 
  XCircle, 
  Lightbulb, 
  MessageSquare, 
  BarChart2, 
  Calendar, 
  RefreshCw 
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function StrategyBuddyPanel({ analysis, isLoading }) {
  const [activeQuestion, setActiveQuestion] = useState("");

  const CoachBlock = ({ title, subtitle, icon: Icon, children, colorClass }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">{title}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
        </div>
      </div>
      <div className="pl-1 text-sm text-slate-600 leading-relaxed font-medium">
        {children}
      </div>
    </div>
  );

  return (
    <section className="bg-white border border-slate-200 rounded-[32px] p-10 shadow-sm space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h2 className="text-2xl font-black text-slate-900">Growth Coach</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium">Based on your activity from the last 7 days.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-bold hover:bg-orange-100 transition-all border-none cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> Recalculate Strategy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        <CoachBlock 
          title="What's Working" 
          subtitle="Top Leverage" 
          icon={CheckCircle2} 
          colorClass="bg-green-50 text-green-600"
        >
          Your Reddit strategy is currently responsible for 80% of your link clicks. The community in r/SaaS is rewarding your transparency.
        </CoachBlock>

        <CoachBlock 
          title="Biggest Opportunity" 
          subtitle="Untapped Potential" 
          icon={TrendingUp} 
          colorClass="bg-blue-50 text-blue-600"
        >
          Threads has a very high engagement-to-view ratio (12%). Increasing frequency there from 1x to 3x per week could double your reach.
        </CoachBlock>

        <CoachBlock 
          title="What To Do" 
          subtitle="Priority Actions" 
          icon={Zap} 
          colorClass="bg-orange-50 text-orange-600"
        >
          → Repurpose your top Reddit post into an X thread.<br />
          → Reply to 3 more comments on your latest Indie Hackers post.
        </CoachBlock>

        <CoachBlock 
          title="What NOT To Do" 
          subtitle="Avoid These" 
          icon={XCircle} 
          colorClass="bg-red-50 text-red-600"
        >
          Stop using generic feature-focused headlines on X. They are getting 0.1% engagement compared to your story-based posts.
        </CoachBlock>

        <CoachBlock 
          title="Quick Tips" 
          subtitle="Fast Wins" 
          icon={Lightbulb} 
          colorClass="bg-yellow-50 text-yellow-600"
        >
          Post between 8 AM and 10 AM on Tuesdays for max Reddit visibility. Use the "Tactical One-Liner" template next.
        </CoachBlock>
      </div>

      <div className="pt-10 border-t border-slate-100 space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth Accelerators</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Explain My Metrics", icon: BarChart2 },
            { label: "Compare With Last Week", icon: RefreshCw },
            { label: "Ask Advisor About This Week", icon: MessageSquare }
          ].map((action, idx) => (
            <button 
              key={idx}
              className="px-5 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-slate-600 text-xs font-bold hover:border-orange-500/30 hover:text-orange-600 transition-all flex items-center gap-2 cursor-pointer"
            >
              <action.icon className="w-3.5 h-3.5" />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}