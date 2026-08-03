"use client";

import React, { useState, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import MetricCards from '../../components/results-tracker/MetricCards';
import PostPerformanceTable from '../../components/results-tracker/PostPerformanceTable';
import StrategyBuddyPanel from '../../components/results-tracker/StrategyBuddyPanel';
import AnalyticsBuddy from '../../components/results-tracker/AnalyticsBuddy';
import { 
  Sparkles, 
  TrendingUp, 
  ChevronDown, 
  RefreshCw, 
  MessageSquare,
  Trophy,
  AlertTriangle,
  ArrowRight,
  Info,
  Lock,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '../../lib/AuthContext';
import { usePlan } from '../../lib/usePlan';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function ResultsTracker() {
  const { user, plan } = useAuth();
  const { limits } = usePlan();
  const [selectedPeriod, setSelectedPeriod] = useState("This Week");
  const [activePlatform, setActivePlatform] = useState("All Platforms");
  const [showTopPosts, setShowTopPosts] = useState(false);
  const [showBottomPosts, setShowBottomPosts] = useState(false);

  const { data: rawPosts = [], isLoading } = useQuery({
    queryKey: ['tracker-posts', user?.id, selectedPeriod],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('social_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user
  });

  const processedData = useMemo(() => {
    const filtered = activePlatform === "All Platforms" 
      ? rawPosts 
      : rawPosts.filter(p => p.platform === activePlatform);
    
    const views = filtered.reduce((acc, p) => acc + (p.views || 0), 0);
    const engagements = filtered.reduce((acc, p) => acc + (p.engagements || 0), 0);
    const comments = filtered.reduce((acc, p) => acc + (p.comments || 0), 0);
    const linkTaps = filtered.reduce((acc, p) => acc + (p.link_clicks || 0), 0);

    const sortedByEngagement = [...filtered].sort((a, b) => (b.engagements || 0) - (a.engagements || 0));

    return {
      filtered,
      metrics: {
        views: { label: 'Total Views', value: views, change: 12 },
        engagements: { label: 'Engagement', value: engagements, change: 5 },
        comments: { label: 'Comments', value: comments, change: -2 },
        linkTaps: { label: 'Link Clicks', value: linkTaps, change: 8 },
      },
      bestPost: sortedByEngagement[0],
      worstPost: sortedByEngagement[sortedByEngagement.length - 1],
      growthScore: Math.min(100, Math.floor((engagements / (views || 1)) * 500) + 40),
      breakdown: [
        { platform: 'Reddit', percentage: 65, color: '#FF4500' },
        { platform: 'X', percentage: 25, color: '#333333' },
        { platform: 'LinkedIn', percentage: 10, color: '#0A66C2' },
      ],
      zeroEngagementCount: filtered.filter(p => (p.engagements || 0) === 0).length
    };
  }, [rawPosts, activePlatform]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isFree = plan === 'free';

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={!isFree} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h1 className="text-sm font-bold uppercase tracking-widest text-slate-500">Result Tracker</h1>
          </div>
          
          {!isFree && (
            <div className="flex items-center gap-3">
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-slate-100 border-none rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 outline-none cursor-pointer"
              >
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
            </div>
          )}
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
          {isFree ? (
            <div className="max-w-3xl mx-auto py-12 flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in duration-500">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 max-w-xl mx-auto leading-tight">
                  Unlock your strategy insights and growth metrics
                </h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  Upgrade to Pro to track your performance in real-time and get automated strategy advice.
                </p>
                <div className="pt-4">
                  <Link 
                    to="/pricing" 
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base transition-all shadow-lg shadow-orange-500/20 no-underline"
                  >
                    Upgrade Now <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-6 w-full">
                <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-5 h-5" />
                    <h3 className="font-bold text-slate-900 text-base">Manually checking metrics</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-500">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Hard to stay consistent with tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Switching between 5 different platform apps</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Hard to know what strategy changes actually matter</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-orange-50/30 border border-orange-500/30 rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-bold text-slate-900 text-base">With Result Tracker</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>All your metrics in one unified dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Growth Coach explains what worked and what didn’t</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Strategy suggestions based on your data</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 1. ANALYTICS HEALTH */}
              <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-12 items-center">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="80" cy="80" r="70" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                      <circle 
                        cx="80" cy="80" r="70" fill="transparent" stroke="#f97316" strokeWidth="12" 
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * processedData.growthScore) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-black text-slate-900">{processedData.growthScore}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth Score</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-700">Your account is growing steadily.</p>
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Insights
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>Your Reddit posts are driving 3x more engagement than X this week.</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>"Builder Story" format is your highest converter for link clicks.</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>Engagement peaks between 9 AM and 11 AM EST.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 border-none cursor-pointer">
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh Analysis
                    </button>
                    <button className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 border-none cursor-pointer">
                      <MessageSquare className="w-3.5 h-3.5" /> Ask Advisor
                    </button>
                  </div>
                </div>
              </section>

              {/* 2. KEY ANALYTICS */}
              <section className="space-y-6">
                <MetricCards metrics={processedData.metrics} />
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowTopPosts(true)}
                    className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-orange-500/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Best Performing Posts</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                  </button>
                  
                  <button 
                    onClick={() => setShowBottomPosts(true)}
                    className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-orange-500/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Worst Performing Posts</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                  </button>
                </div>
              </section>

              {/* 3. POST PERFORMANCE */}
              <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Post Performance
                    <div className="group relative">
                      <Info className="w-3.5 h-3.5 text-slate-300 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        Calculated based on engagement relative to views.
                      </div>
                    </div>
                  </h3>
                </div>
                <PostPerformanceTable 
                  posts={processedData.filtered} 
                  platform={activePlatform}
                />
              </section>

              {/* 4. GROWTH COACH */}
              <StrategyBuddyPanel analysis={null} />

              {/* 5. WEEKLY SUMMARY */}
              <section className="bg-orange-50/50 border border-orange-100 rounded-2xl p-8 text-center">
                <p className="text-slate-600 italic text-sm leading-relaxed max-w-2xl mx-auto">
                  "This week showed a strong pivot toward community-led growth. Your transparency in r/SaaS is building significant authority, while your tactical tips on X are driving the majority of your new landing page traffic. Keep doubling down on vulnerability-based hooks—they are outperforming feature-based posts by 4x."
                </p>
              </section>
            </>
          )}
        </div>
      </main>

      {!isFree && (
        <AnalyticsBuddy 
          dataContext={{
            ...processedData,
            selectedPeriod,
            activePlatform,
            posts: rawPosts
          }} 
          isLocked={false} 
        />
      )}

      {/* Detail Drawers for Best/Worst */}
      <Sheet open={showTopPosts} onOpenChange={setShowTopPosts}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-white">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 font-black">
              <Trophy className="w-5 h-5 text-green-600" />
              Top Performers
            </SheetTitle>
          </SheetHeader>
          <div className="mt-8 space-y-6">
            {processedData.filtered.slice(0, 3).map((post, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{post.platform}</span>
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Score: 92</span>
                </div>
                <p className="text-sm font-bold text-slate-800 line-clamp-2">{post.title}</p>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Why it worked</span>
                    <p className="text-xs text-slate-600 mt-1">High relatability hook + clear takeaway.</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Keep doing</span>
                    <p className="text-xs text-slate-600 mt-1">Using first-person narrative openers.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showBottomPosts} onOpenChange={setShowBottomPosts}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-white">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 font-black">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Underperformers
            </SheetTitle>
          </SheetHeader>
          <div className="mt-8 space-y-6">
            {processedData.filtered.length > 0 ? (
              processedData.filtered.slice(-3).reverse().map((post, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{post.platform}</span>
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Score: 24</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 line-clamp-2">{post.title}</p>
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">The issue</span>
                      <p className="text-xs text-slate-600 mt-1">Too promotional / lacked early context.</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">How to improve</span>
                      <p className="text-xs text-slate-600 mt-1">Lead with a specific pain phrase.</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-12">No data yet.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}