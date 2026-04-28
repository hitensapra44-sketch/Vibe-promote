"use client";

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Calendar, RefreshCw, Send, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function StrategyBuddyPanel({ analysis, isLoading }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(analysis?.nextWeek || "→ Double down on Reddit with 3 posts\n→ Refresh LinkedIn hooks using the 'Hot Take' format\n→ Test one Product Hunt discussion post");

  const handleAsk = () => {
    if (!question.trim()) return;
    setIsAnswering(true);
    setTimeout(() => {
      setAnswer("This is where the AI analysis will appear based on your data. I'll look at your specific drops and spikes to give you a real answer.");
      setIsAnswering(false);
    }, 1500);
  };

  const handleGetNewStrategy = () => {
    setIsGeneratingStrategy(true);
    // Simulate AI generating a new strategy based on "current analytics"
    setTimeout(() => {
      const newStrategies = [
        "→ Shift focus to LinkedIn: Your engagement there is recovering, use 'Founder Vulnerability' posts\n→ Pause Reddit for 48 hours: You've hit a saturation point in r/SaaS\n→ Repurpose your best Reddit post into a LinkedIn carousel",
        "→ Double down on Product Hunt discussions: Your launch traffic is high, keep the momentum\n→ Test 2 new hooks for X: Your current ones are dropping in reach\n→ Reach out to the top 5 commenters on your last Indie Hackers post",
        "→ Focus on 'The Implementation Asset' format: It's driving 80% of your link taps\n→ Reduce posting frequency on Threads: Quality over quantity is winning right now\n→ Update your landing page CTA based on the high bounce rate from LinkedIn"
      ];
      const randomStrategy = newStrategies[Math.floor(Math.random() * newStrategies.length)];
      setCurrentPlan(randomStrategy);
      setIsGeneratingStrategy(false);
    }, 2000);
  };

  return (
    <div className="bg-[#111111] border-l-4 border-l-orange-500 border border-[#1F1F1F] rounded-xl p-6 bg-orange-500/[0.02]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Sparkles size={16} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold">Strategy Buddy</h3>
            <p className="text-zinc-400 text-[10px] uppercase tracking-widest">Based on this week's data</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1F1F1F] text-zinc-400 text-[10px] font-bold hover:border-zinc-600 transition-all bg-transparent">
          <RefreshCw size={12} />
          Refresh Analysis
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-4 bg-zinc-800 rounded w-32" />
              <div className="h-3 bg-zinc-800 rounded w-full" />
              <div className="h-3 bg-zinc-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 size={16} />
              <span className="text-sm font-medium text-white">What's Working</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed pl-6">
              {analysis?.working || "Your Reddit posts in r/SaaS are hitting a 4.2% click-through rate, which is 2x higher than your LinkedIn average. The 'Relatable Struggle' format is clearly resonating with founders."}
            </p>
          </div>

          <div className="h-px bg-[#1F1F1F]" />

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle size={16} />
              <span className="text-sm font-medium text-white">What to Improve</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed pl-6">
              {analysis?.improve || "LinkedIn engagement dropped by 12% this week. Your hooks are becoming a bit repetitive. Try switching to the 'Hot Take' format to break the pattern."}
            </p>
          </div>

          <div className="h-px bg-[#1F1F1F]" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-400">
                <Calendar size={16} />
                <span className="text-sm font-medium text-white">plan fo next week according to current analytics</span>
              </div>
              <button 
                onClick={handleGetNewStrategy}
                disabled={isGeneratingStrategy}
                className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingStrategy ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                get new startegy
              </button>
            </div>
            
            <div className="space-y-2 pl-6">
              {isGeneratingStrategy ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-800 rounded w-2/3" />
                </div>
              ) : (
                currentPlan.split('\n').map((line, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <span className="text-orange-500">→</span>
                    <span className="text-zinc-300">{line.replace('→ ', '')}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-[#1F1F1F] space-y-4">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Ask about this week</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. Why did my LinkedIn drop?"
                className="flex-1 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 placeholder-zinc-500"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              />
              <button 
                onClick={handleAsk}
                className="bg-orange-500 text-white text-sm font-bold rounded-lg px-4 py-2.5 flex items-center gap-2 hover:bg-orange-600 transition-all"
              >
                Ask <Send size={14} />
              </button>
            </div>
            {isAnswering && (
              <p className="text-zinc-500 text-sm italic animate-pulse">Thinking...</p>
            )}
            {answer && !isAnswering && (
              <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4 text-zinc-300 text-sm leading-relaxed">
                {answer}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}