"use client";

import React, { useState, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import MetricCards from '../../components/results-tracker/MetricCards';
import PostPerformanceTable from '../../components/results-tracker/PostPerformanceTable';
import AnalyticsBuddy from '../../components/results-tracker/AnalyticsBuddy';
import { 
  Sparkles, 
  TrendingUp, 
  RefreshCw, 
  ArrowRight, 
  Lock, 
  XCircle, 
  CheckCircle2,
  Calendar,
  Send,
  ExternalLink,
  Layers
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '../../lib/AuthContext';
import { usePlan } from '../../lib/usePlan';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function ResultsTracker() {
  const { user, plan } = useAuth();
  const { limits } = usePlan();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState("All Time");
  const [activePlatform, setActivePlatform] = useState("All Platforms");
  const [showRecentPosts, setShowRecentPosts] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: rawPosts = [], isLoading, refetch } = useQuery({
    queryKey: ['tracker-posts', user?.id, selectedPeriod],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('social_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (selectedPeriod === 'This Week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
      } else if (selectedPeriod === 'Last Week') {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        query = query.gte('created_at', twoWeeksAgo.toISOString()).lte('created_at', oneWeekAgo.toISOString());
      } else if (selectedPeriod === 'This Month') {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        query = query.gte('created_at', monthAgo.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching social_posts:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user
  });

  const processedData = useMemo(() => {
    const filtered = activePlatform === "All Platforms" 
      ? rawPosts 
      : rawPosts.filter(p => (p.platform || '').toLowerCase() === activePlatform.toLowerCase());

    const totalSynced = rawPosts.length;
    const filteredCount = filtered.length;

    // Platform distribution from real posts
    const platformCounts = rawPosts.reduce((acc, p) => {
      const plat = p.platform ? (p.platform.charAt(0).toUpperCase() + p.platform.slice(1)) : 'Other';
      acc[plat] = (acc[plat] || 0) + 1;
      return acc;
    }, {});

    const platformColors = {
      'Reddit': '#FF4500',
      'X': '#111111',
      'Twitter': '#111111',
      'Threads': '#000000',
      'Linkedin': '#0A66C2',
      'Other': '#71717A'
    };

    const breakdown = Object.entries(platformCounts).map(([platform, count]) => ({
      platform,
      percentage: totalSynced > 0 ? Math.round((count / totalSynced) * 100) : 0,
      color: platformColors[platform] || '#F97316'
    }));

    // Status breakdown from real posts
    const statusCounts = rawPosts.reduce((acc, p) => {
      const st = (p.status || 'published').toLowerCase();
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {});

    // Metrics format required by MetricCards (change = 0 to prevent displaying fake percentage gains)
    const metrics = {
      views: { label: 'Synced Posts', value: filteredCount, change: 0 },
      engagements: { label: 'Active Platforms', value: Object.keys(platformCounts).length, change: 0 },
      comments: { label: 'Published Posts', value: statusCounts['published'] || filteredCount, change: 0 },
      linkTaps: { label: 'External Links Tracked', value: filtered.filter(p => Boolean(p.external_link)).length, change: 0 },
    };

    return {
      filtered,
      totalSynced,
      filteredCount,
      metrics,
      breakdown,
      statusCounts,
      platformCounts,
      growthScore: totalSynced > 0 ? Math.min(100, totalSynced * 10) : 0
    };
  }, [rawPosts, activePlatform]);

  const handleSyncBuffer = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-buffer-posts');
      if (error) throw error;
      
      const synced = data?.synced ?? 0;
      toast.success(synced === 1 ? "Synced 1 post" : `Synced ${synced} posts`);
      
      if (data?.errors && data.errors.length > 0) {
        toast.error(`${data.errors.length} errors occurred during sync`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['tracker-posts', user?.id, selectedPeriod] });
      refetch();
    } catch (err) {
      console.error('[ResultsTracker] Sync failed:', err);
      toast.error(err.message || 'Failed to sync from Buffer');
    } finally {
      setIsSyncing(false);
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
  const availablePlatforms = ['All Platforms', ...new Set(rawPosts.map(p => p.platform ? (p.platform.charAt(0).toUpperCase() + p.platform.slice(1)) : 'Other'))];

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
                <option>All Time</option>
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
              
              <button
                onClick={handleSyncBuffer}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20 border-none cursor-pointer"
              >
                <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                {isSyncing ? "Syncing..." : "Sync from Buffer"}
              </button>
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
                      <span>Switching between multiple channel platforms</span>
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
                      <span>All your posts in one unified dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Real platform distribution and publishing counts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Direct external post links & timestamp audit</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* PLATFORM FILTER PILLS */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {availablePlatforms.map(plat => (
                    <button
                      key={plat}
                      onClick={() => setActivePlatform(plat)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                        activePlatform === plat
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {plat}
                    </button>
                  ))}
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                  <span>ℹ️ Engagement counts unavailable — Buffer API limitation</span>
                </div>
              </div>

              {/* 1. SYNC HEALTH & OVERVIEW */}
              <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                <div className="flex flex-col items-center text-center w-full md:w-56 flex-shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-orange-50 border border-orange-100 flex flex-col items-center justify-center text-orange-600 shadow-sm">
                    <Send className="w-6 h-6 mb-1" />
                    <span className="text-2xl font-black">{processedData.filteredCount}</span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-slate-900">Synced Posts</h3>
                  <p className="text-xs text-slate-400">Total in this view</p>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Real Platform Breakdown
                    </h3>

                    {processedData.breakdown.length === 0 ? (
                      <p className="text-sm text-slate-500">No synced posts found for this period. Click "Sync from Buffer" to import your channel activity.</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden">
                          {processedData.breakdown.map((item, i) => (
                            <div 
                              key={i}
                              style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                              className="h-full transition-all duration-500"
                            />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs">
                          {processedData.breakdown.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="font-bold text-slate-700">{item.platform}:</span>
                              <span className="text-slate-500">{processedData.platformCounts[item.platform] || 0} ({item.percentage}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={handleSyncBuffer}
                      disabled={isSyncing}
                      className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 border-none cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
                      Refresh Data
                    </button>
                    <button 
                      onClick={() => setShowRecentPosts(true)}
                      className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 border-none cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      View Recent Posts Drawer
                    </button>
                  </div>
                </div>
              </section>

              {/* 2. KEY AUDIT CARDS */}
              <section className="space-y-4">
                <MetricCards metrics={processedData.metrics} />
              </section>

              {/* 3. POST PERFORMANCE TABLE */}
              <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Synced Post Log</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Click any post to inspect details and open original links</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {processedData.filtered.length} posts
                  </span>
                </div>
                <PostPerformanceTable 
                  posts={processedData.filtered} 
                  platform={activePlatform}
                />
              </section>
            </>
          )}
        </div>
      </main>

      {!isFree && (
        <AnalyticsBuddy 
          dataContext={{
            selectedPeriod,
            activePlatform,
            totalSynced: processedData.totalSynced,
            filteredCount: processedData.filteredCount,
            breakdown: processedData.breakdown,
            posts: rawPosts,
            metrics: processedData.metrics
          }} 
          isLocked={false} 
        />
      )}

      {/* RECENT POSTS DRAWER */}
      <Sheet open={showRecentPosts} onOpenChange={setShowRecentPosts}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 font-black">
              <Calendar className="w-5 h-5 text-orange-500" />
              Recent Synced Posts
            </SheetTitle>
          </SheetHeader>
          <div className="mt-8 space-y-4">
            {processedData.filtered.length > 0 ? (
              processedData.filtered.slice(0, 15).map((post, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{post.platform}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 line-clamp-3 leading-relaxed">
                    {post.title}
                  </p>
                  {post.external_link && (
                    <div className="pt-2">
                      <a 
                        href={post.external_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:underline"
                      >
                        Open original post <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-12">No posts available to display.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}