"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import BuddyChat from '../../components/marketing-buddy/BuddyChat';
import { Sparkles, MessageSquare, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { useAuth } from '../../lib/AuthContext';
import { usePlan } from '../../lib/usePlan';
import PlanGate from '../../components/PlanGate';

export default function MarketingBuddy() {
  const [activeTab, setActiveTab] = useState('chat');
  const navigate = useNavigate();
  const { user, plan } = useAuth();
  const { limits } = usePlan();

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

          <div className="flex-1 flex flex-col gap-6 min-h-0">
            {/* Full Width Chat Panel */}
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
                <PlanGate
                  feature="copilot"
                  plan={plan}
                  limit={limits.copilot}
                >
                  <BuddyChat />
                </PlanGate>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}