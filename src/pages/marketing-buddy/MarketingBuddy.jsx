"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import BuddyChat from '../../components/marketing-buddy/BuddyChat';
import { Sparkles, MessageSquare, Brain, Lock, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { useAuth } from '../../lib/AuthContext';
import { usePlan } from '../../lib/usePlan';
import { useUsage } from '../../lib/useUsage';
import PlanGate from '../../components/PlanGate';

export default function MarketingBuddy() {
  const [activeTab, setActiveTab] = useState('chat');
  const navigate = useNavigate();
  const { user, plan } = useAuth();
  const { limits } = usePlan();
  const { used: chatsUsed } = useUsage('copilot');

  const isLocked = limits.copilot !== "unlimited" && chatsUsed >= limits.copilot;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto w-full h-[calc(100vh-100px)] flex flex-col gap-6 animate-in fade-in duration-500">
          
          {/* Header with Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-white">Co-pilot</h1>
              <p className="text-zinc-400 text-sm">Your 24/7 AI strategist.</p>
            </div>

            <div className="flex bg-[#111111] border border-[#1F1F1F] rounded-lg p-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium px-6 py-2 transition-all duration-200",
                  activeTab === 'chat' 
                    ? "bg-orange-500 text-white rounded-md shadow-lg shadow-orange-500/20" 
                    : "bg-transparent text-zinc-400 hover:text-zinc-200"
                )}
              >
                <MessageSquare size={16} />
                Chat
              </button>
              <button
                onClick={() => navigate('/brand-brain')}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium px-6 py-2 transition-all duration-200 bg-transparent text-zinc-400 hover:text-zinc-200"
                )}
              >
                <Brain size={16} />
                Brand Brain
              </button>
            </div>
          </div>

          {/* Tier Usage Limits UI */}
          <div className="flex items-center justify-between bg-[#111111] border border-white/5 rounded-xl px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {plan === 'free' ? 'Free Tier' : plan === 'starter' ? 'Starter Tier' : 'Pro Tier'} Usage:
              </span>
              <span className="text-sm font-bold text-orange-500">
                {limits.copilot === 'unlimited' ? 'Unlimited' : `${chatsUsed}/${limits.copilot} chats`}
              </span>
            </div>
            {limits.copilot !== 'unlimited' && (
              <div className="w-32 bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all duration-300" 
                  style={{ width: `${Math.min(100, (chatsUsed / limits.copilot) * 100)}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-6 min-h-0">
            {isLocked ? (
              /* TASK 5 — Co-Pilot Locked State */
              <div className="flex-1 bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 overflow-y-auto flex flex-col items-center justify-center text-center space-y-12">
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8 text-orange-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white max-w-xl mx-auto leading-tight">
                    Talk to your app CMO daily — upgrade now.
                  </h2>
                  <p className="text-zinc-400 text-sm max-w-md mx-auto">Upgrade to access this feature again and unlock unlimited strategic marketing guidance.</p>
                  <div className="pt-4">
                    <Link 
                      to="/pricing" 
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base transition-all shadow-lg shadow-orange-500/20"
                    >
                      Upgrade Now <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

                {/* Comparison Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-6 w-full max-w-3xl">
                  {/* Box 1: Asking GPT manually */}
                  <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="w-5 h-5" />
                      <h3 className="font-bold text-white text-base">Asking GPT manually</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-zinc-400">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500/60 mt-0.5">•</span>
                        <span>Repeating app context again and again</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500/60 mt-0.5">•</span>
                        <span>Doesn’t remember previous context</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500/60 mt-0.5">•</span>
                        <span>Doesn’t know analytics, growth, streaks, or brand brain</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500/60 mt-0.5">•</span>
                        <span>New chat = repeated explanations</span>
                      </li>
                    </ul>
                  </div>

                  {/* Box 2: Co-Pilot with Vibe Promote */}
                  <div className="bg-[#111111] border border-orange-500/30 rounded-2xl p-6 space-y-4 bg-orange-500/[0.02]">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <h3 className="font-bold text-white text-base">Co-Pilot with Vibe Promote</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-zinc-300">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>No need to explain brand brain repeatedly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>Better responses because it knows marketing context</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>Understands analytics and growth progress</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>Personalized marketing guidance</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <p className="text-zinc-500 text-sm font-medium">
                  ⚡ 100+ builders are building better marketing strategies with Co-Pilot
                </p>
              </div>
            ) : (
              /* Full Width Chat Panel */
              <div className="flex-1 bg-[#111111] border border-[#1F1F1F] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                <header className="px-6 py-4 border-b border-[#1F1F1F] flex items-center justify-between bg-[#1A1A1A]">
                  <div className="flex items-center gap-3">
                    <Sparkles size={16} className="text-orange-500" />
                    <span className="text-white text-sm font-semibold">AI Strategist</span>
                  </div>
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:text-zinc-300 bg-transparent"
                  >
                    Reset Session
                  </button>
                </header>
                
                <div className="flex-1 overflow-hidden p-4 sm:p-6">
                  <BuddyChat />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}