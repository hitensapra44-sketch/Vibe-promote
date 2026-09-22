"use client";

import React, { useState, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import GrowthFunnel from '../../components/results-tracker/GrowthFunnel';
import GrowthPlatformBreakdown from '../../components/results-tracker/GrowthPlatformBreakdown';
import GrowthRecentActivity from '../../components/results-tracker/GrowthRecentActivity';
import AnalyticsBuddy from '../../components/results-tracker/AnalyticsBuddy';
import { 
  TrendingUp, 
  RefreshCw, 
  ArrowRight, 
  Lock, 
  XCircle, 
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { usePlan } from '../../lib/usePlan';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const TIME_PERIODS = [
  { id: '7d', label: '7 days', days: 7 },
  { id: '30d', label: '30 days', days: 30 },
  { id: '90d', label: '90 days', days: 90 },
  { id: 'all', label: 'All time', days: null }
];

const PLATFORM_COLOR_MAP = {
  'reddit': '#FF4500',
  'hn': '#FF6600',
  'hacker news': '#FF6600',
  'x': '#111111',
  'twitter': '#111111',
  'threads': '#000000',
  'indie hackers': '#0A66C2',
  'product hunt': '#DA552F',
  'linkedin': '#0077B5',
};

function normalizePlatform(p) {
  if (!p) return 'Other';
  const lower = p.trim().toLowerCase();
  if (lower === 'reddit') return 'Reddit';
  if (lower === 'hn' || lower === 'hacker_news' || lower === 'hacker news') return 'Hacker News';
  if (lower === 'x' || lower === 'twitter') return 'X / Twitter';
  if (lower === 'threads') return 'Threads';
  if (lower === 'indie hackers' || lower === 'indiehackers' || lower === 'ih') return 'Indie Hackers';
  if (lower === 'product hunt' || lower === 'producthunt' || lower === 'ph') return 'Product Hunt';
  if (lower === 'linkedin') return 'LinkedIn';
  return p.charAt(0).toUpperCase() + p.slice(1);
}

export default function ResultsTracker() {
  const { user, plan } = useAuth();
  const { limits } = usePlan();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Fetch raw internal tables
  const { data: rawData, isLoading, refetch } = useQuery({
    queryKey: ['growth-tracker-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return { signals: [], posts: [], scheduled: [] };

      const [signalsRes, postsRes, scheduledRes] = await Promise.all([
        supabase
          .from('audience_signals')
          .select('id, user_id, platform, post_title, created_at, posted_at, status, post_url')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),

        supabase
          .from('social_posts')
          .select('id, user_id, platform, title, created_at, status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),

        supabase
          .from('scheduled_posts')
          .select('id, user_id, platform, content, scheduled_at, created_at, status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      return {
        signals: signalsRes.data || [],
        posts: postsRes.data || [],
        scheduled: scheduledRes.data || []
      };
    },
    enabled: !!user?.id
  });

  // 2. Process data by applying dedicated per-metric timestamps according to selected time period
  const processedData = useMemo(() => {
    const signals = rawData?.signals || [];
    const posts = rawData?.posts || [];
    const scheduled = rawData?.scheduled || [];

    const periodConfig = TIME_PERIODS.find(p => p.id === selectedPeriod);
    const cutoffDate = periodConfig?.days 
      ? new Date(Date.now() - periodConfig.days * 24 * 60 * 60 * 1000) 
      : null;

    const isAfterCutoff = (dateStr) => {
      if (!cutoffDate) return true;
      if (!dateStr) return false;
      return new Date(dateStr) >= cutoffDate;
    };

    // Stage 1: People Found (timestamp: audience_signals.created_at)
    const filteredSignals = signals.filter(s => isAfterCutoff(s.created_at || s.posted_at));

    // Stage 2: Posts Created (inside Post Maker: filter native creations, exclude buffer-only imports)
    // Filter social_posts + scheduled_posts where native creation occurred
    const filteredNativePosts = posts.filter(p => {
      const isBufferSync = p.title && p.title.includes('||http');
      const inDateRange = isAfterCutoff(p.created_at);
      return !isBufferSync && inDateRange;
    });

    // Stage 3: Posts Scheduled (timestamp: scheduled_posts.created_at or scheduled_at, deduped by id)
    // Count posts in scheduler (status is 'scheduled' or 'published')
    const seenScheduledIds = new Set();
    const filteredScheduled = scheduled.filter(p => {
      if (seenScheduledIds.has(p.id)) return false;
      seenScheduledIds.add(p.id);
      return isAfterCutoff(p.created_at || p.scheduled_at);
    });

    // Stage 4: Posts Published (genuine published status)
    const filteredPublished = scheduled.filter(p => {
      const isPublished = (p.status || '').toLowerCase() === 'published';
      return isPublished && isAfterCutoff(p.created_at);
    });

    const stages = {
      peopleFound: filteredSignals.length,
      postsCreated: filteredNativePosts.length,
      postsScheduled: filteredScheduled.length,
      postsPublished: filteredPublished.length
    };

    // Platform Breakdown Matrix
    const platformMap = {};

    const getEntry = (platRaw) => {
      const normalized = normalizePlatform(platRaw);
      if (!platformMap[normalized]) {
        const key = normalized.toLowerCase();
        platformMap[normalized] = {
          platform: normalized,
          color: PLATFORM_COLOR_MAP[key] || '#F97316',
          peopleFound: 0,
          postsCreated: 0,
          postsScheduled: 0,
          postsPublished: 0
        };
      }
      return platformMap[normalized];
    };

    filteredSignals.forEach(s => {
      getEntry(s.platform).peopleFound += 1;
    });

    filteredNativePosts.forEach(p => {
      getEntry(p.platform).postsCreated += 1;
    });

    filteredScheduled.forEach(p => {
      getEntry(p.platform).postsScheduled += 1;
    });

    filteredPublished.forEach(p => {
      getEntry(p.platform).postsPublished += 1;
    });

    // Skip platforms where all 4 numbers are zero
    const platformRows = Object.values(platformMap).filter(row => 
      (row.peopleFound > 0 || row.postsCreated > 0 || row.postsScheduled > 0 || row.postsPublished > 0)
    ).sort((a, b) => {
      const totalA = a.peopleFound + a.postsCreated + a.postsScheduled + a.postsPublished;
      const totalB = b.peopleFound + b.postsCreated + b.postsScheduled + b.postsPublished;
      return totalB - totalA;
    });

    // Recent Chronological Activity Log (derived from existing rows)
    const activities = [];

    filteredSignals.slice(0, 15).forEach(s => {
      activities.push({
        type: 'found',
        platform: normalizePlatform(s.platform),
        title: s.post_title ? `Found opportunity: "${s.post_title}"` : 'Discovered potential buyer discussion',
        timestamp: s.created_at || s.posted_at,
        url: s.post_url
      });
    });

    filteredNativePosts.slice(0, 15).forEach(p => {
      activities.push({
        type: 'created',
        platform: normalizePlatform(p.platform),
        title: p.title ? `Created post: "${p.title.slice(0, 60)}..."` : 'Drafted new marketing post in Post Maker',
        timestamp: p.created_at
      });
    });

    filteredScheduled.slice(0, 15).forEach(p => {
      activities.push({
        type: p.status === 'published' ? 'published' : 'scheduled',
        platform: normalizePlatform(p.platform),
        title: p.content ? `Scheduled: "${p.content.slice(0, 60)}..."` : 'Queued post for publication',
        timestamp: p.created_at || p.scheduled_at
      });
    });

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      stages,
      platformRows,
      recentActivities: activities.slice(0, 20)
    };
  }, [rawData, selectedPeriod]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Growth data refreshed");
    } catch (err) {
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

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
        {/* TOP HEADER */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">Growth Tracker</h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:block">Internal Activity & Marketing Execution</p>
            </div>
          </div>
          
          {!isFree && (
            <div className="flex items-center gap-2.5">
              {/* Time Period Filter */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                {TIME_PERIODS.map(period => (
                  <button
                    key={period.id}
                    onClick={() => setSelectedPeriod(period.id)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold transition-all border-none cursor-pointer",
                      selectedPeriod === period.id
                        ? "bg-white text-slate-900 shadow-xs"
                        : "bg-transparent text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Refresh Metrics"
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
              </button>
            </div>
          )}
        </header>

        {/* MAIN BODY */}
        <div className="p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8 pb-24">
          {isFree ? (
            /* Free Gate */
            <div className="max-w-3xl mx-auto py-12 flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in duration-500">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto text-orange-500">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 max-w-xl mx-auto leading-tight">
                  Track your internal marketing velocity
                </h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  Upgrade to unlock the complete progression funnel: People Found → Posts Created → Scheduled → Published across all your channels.
                </p>
                <div className="pt-4">
                  <Link 
                    to="/pricing" 
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base transition-all shadow-lg shadow-orange-500/20 no-underline"
                  >
                    Upgrade to Pro <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-6 w-full">
                <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-5 h-5" />
                    <h3 className="font-bold text-slate-900 text-base">Unstructured Marketing</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-500">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>No visibility into weekly production vs publication</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Drafting content without shipping it live</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Losing track of audience leads discovered</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-orange-50/30 border border-orange-500/30 rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-bold text-slate-900 text-base">With Growth Tracker</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Clear 4-stage funnel showing drop-off points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Workload matrix across Reddit, HN, X, and Threads</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Real chronological activity stream of executed tasks</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 1. PROGRESSION FUNNEL */}
              <GrowthFunnel stages={processedData.stages} />

              {/* 2. PLATFORM MATRIX */}
              <GrowthPlatformBreakdown platformRows={processedData.platformRows} />

              {/* 3. RECENT ACTIVITY LOG */}
              <GrowthRecentActivity activities={processedData.recentActivities} />
            </>
          )}
        </div>
      </main>

      {/* ADVISOR COMPONENT (FOCUSED ON WORKFLOW EXECUTION) */}
      {!isFree && (
        <AnalyticsBuddy 
          dataContext={{
            selectedPeriod,
            stages: processedData.stages,
            platformRows: processedData.platformRows
          }} 
          isLocked={false} 
        />
      )}
    </div>
  );
}