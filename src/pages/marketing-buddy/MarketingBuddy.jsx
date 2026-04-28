"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import BrandInfoPreview from '../../components/shared/BrandInfoPreview';
import BuddyChat from '../../components/marketing-buddy/BuddyChat';
import { Sparkles, Brain, Target, Zap, MessageSquare, ArrowRight, Lightbulb, TrendingUp, PenLine } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function MarketingBuddy() {
  const [step, setStep] = useState('intro'); // 'intro' | 'chat'
  const [selectedGoal, setSelectedGoal] = useState(null);

  const mockBrandInfo = {
    appName: "Vibe Promote",
    problem: "Marketing takes too long",
    audience: "SaaS founders",
    tone: "Authentic Founder"
  };

  const goals = [
    { id: 'ideas', name: 'Get Post Ideas', desc: 'Fresh angles for your niche', icon: Lightbulb },
    { id: 'strategy', name: 'Fix My Strategy', desc: 'Analyze what to do next', icon: TrendingUp },
    { id: 'hooks', name: 'Write Better Hooks', desc: 'Stop the scroll instantly', icon: PenLine },
    { id: 'general', name: 'Just Chat', desc: 'General marketing advice', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        {step === 'intro' ? (
          <div className="max-w-[680px] mx-auto py-10 w-full">
            <div className="space-y-1 mb-8">
              <h1 className="text-white text-2xl font-semibold mt-4">Marketing Buddy</h1>
              <p className="text-zinc-400 text-sm mt-1">Your 24/7 AI strategist. What are we working on?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={cn(
                    "bg-[#111111] border border-[#1F1F1F] rounded-xl p-6 cursor-pointer flex flex-col items-start gap-3 hover:border-zinc-600 transition-all",
                    selectedGoal === goal.id && "border-orange-500 bg-orange-500/5"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center",
                    selectedGoal === goal.id ? "text-orange-500" : "text-zinc-400"
                  )}>
                    <goal.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-medium">{goal.name}</h3>
                    <p className="text-zinc-500 text-xs mt-1">{goal.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedGoal && (
              <button
                onClick={() => setStep('chat')}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg px-8 py-3 mt-8 mx-auto block transition-colors flex items-center gap-2"
              >
                Start Chatting <ArrowRight size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto w-full h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
            {/* Left Panel - Context */}
            <div className="hidden lg:flex w-64 flex-col gap-6">
              <button 
                onClick={() => setStep('intro')}
                className="text-zinc-400 text-sm cursor-pointer hover:text-zinc-200 transition-colors flex items-center gap-2 bg-transparent"
              >
                ← Change Goal
              </button>

              <BrandInfoPreview 
                appName={mockBrandInfo.appName}
                problem={mockBrandInfo.problem}
                audience={mockBrandInfo.audience}
              />

              <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 space-y-4">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Current Focus</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                    {goals.find(g => g.id === selectedGoal)?.icon && React.createElement(goals.find(g => g.id === selectedGoal).icon, { size: 16 })}
                  </div>
                  <span className="text-white text-sm font-medium">{goals.find(g => g.id === selectedGoal)?.name}</span>
                </div>
              </div>
            </div>

            {/* Right Panel - Chat */}
            <div className="flex-1 bg-[#111111] border border-[#1F1F1F] rounded-2xl flex flex-col overflow-hidden">
              <header className="px-6 py-4 border-b border-[#1F1F1F] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-white text-sm font-semibold">Buddy is Online</span>
                </div>
                <button className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:text-zinc-300 bg-transparent">
                  Clear Chat
                </button>
              </header>
              
              <div className="flex-1 overflow-hidden p-4 sm:p-6">
                <BuddyChat brandInfo={mockBrandInfo} initialGoal={selectedGoal} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}