"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import PeriodSelector from '../../components/shared/PeriodSelector';
import ConnectAccounts from '../../components/results-tracker/ConnectAccounts';
import MetricCards from '../../components/results-tracker/MetricCards';
import PostPerformanceTable from '../../components/results-tracker/PostPerformanceTable';
import PlatformBreakdownBar from '../../components/results-tracker/PlatformBreakdownBar';
import AnalyticsBuddy from '../../components/results-tracker/AnalyticsBuddy';
import { cn } from "@/lib/utils";
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import { Plus, X, Lock, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
import { usePlan } from '../../lib/usePlan';
import PlanGate from '../../components/PlanGate';
import { markTaskComplete } from '../../components/TaskWidget';
import { Link } from 'react-router-dom';

export default function ResultsTracker() {
  const { user, plan } = useAuth();
  const { canAccess } = usePlan();
  const [hasConnectedAccounts, setHasConnectedAccounts] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("This Week");
  const [activePlatform, setActivePlatform] = useState("Reddit");
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [breakdownMetric, setBreakdownMetric] = useState("engagement");
  
  const [posts, setPosts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [accountKarma, setAccountKarma] = useState(0);

  useEffect(() => {
    if (user?.id) {
      markTaskComplete(user.id, 'check_analytics', supabase);
    }
  }, [user]);

  const fetchPosts = useCallback(async () => {
    if (!user) return;

    let query = supabase
      .from('social_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    query = query.eq('platform', activePlatform);

    const now = new Date();
    if (selectedPeriod === 'This Week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      query = query.gte('created_at', weekAgo.toISOString());
    } else if (selectedPeriod === 'This Month') {
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);
      query = query.gte('created_at', monthAgo.toISOString());
    }

    const { data, error } = await query;
    if (error) {
      console.error('Supabase fetch error:', error);
      setPosts([]);
      return;
    }

    if (data && data.length > 0) {
      setHasConnectedAccounts(true);
    }

    const mappedData = (data ?? []).map(p => {
      const parts = p.title.split('||');
      return {
        ...p,
        title: parts[0],
        url: parts[1] || null,
        linkTaps: p.link_clicks ?? 0,
        upvotes: p.engagements || 0,
        engagement: (p.engagements || 0) + (p.comments || 0),
        date: new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      };
    });

    setPosts(mappedData);
    setIsLoading(false);
  }, [user, activePlatform, selectedPeriod]);

  const fetchAccountKarma = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('social_accounts')
      .select('karma')
      .eq('user_id', user.id)
      .eq('platform', 'Reddit')
      .maybeSingle();
    if (data?.karma) {
      setAccountKarma(data.karma);
    }
  }, [user]);

  const checkConnectedAccount = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data?.id) {
      setHasConnectedAccounts(true);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
    fetchAccountKarma();
    checkConnectedAccount();
  }, [fetchPosts, fetchAccountKarma, checkConnectedAccount, refreshKey]);

  useEffect(() => {
    const totals = posts.reduce(
      (acc, p) => ({
        views: acc.views + (p.views ?? 0),
        upvotes: acc.upvotes + (p.upvotes ?? 0),
        comments: acc.comments + (p.comments ?? 0),
        linkTaps: acc.linkTaps + (p.linkTaps ?? 0),
        totalEngagement: acc.totalEngagement + (p.engagement ?? 0)
      }),
      { views: 0, upvotes: 0, comments: 0, linkTaps: 0, totalEngagement: 0 }
    );

    const isRedditFilter = activePlatform === 'Reddit';

    setMetrics({
      views: { 
        value: isRedditFilter ? accountKarma : totals.views, 
        change: 0, 
        label: isRedditFilter ? 'Karma' : 'Views' 
      },
      engagements: { 
        value: isRedditFilter ? totals.upvotes : totals.totalEngagement, 
        change: 0, 
        label: isRedditFilter ? 'Upvotes' : 'Engagement' 
      },
      comments: { 
        value: totals.comments, 
        change: 0, 
        label: 'Comments' 
      },
      linkTaps: { 
        value: isRedditFilter ? totals.totalEngagement : totals.linkTaps, 
        change: 0, 
        label: isRedditFilter ? 'Engagement' : 'Link Taps' 
      },
    });
  }, [posts, activePlatform, accountKarma]);

  useEffect(() => {
    if (!posts.length) {
      setBreakdown([]);
      return;
    }

    const total = posts.reduce(
      (sum, p) => sum + (p[breakdownMetric] ?? 0),
      0
    );

    const grouped = posts.reduce((acc, p) => {
      const key = p.platform ?? 'Unknown';
      acc[key] = (acc[key] ?? 0) + (p[breakdownMetric] ?? 0);
      return acc;
    }, {});

    const platformColors = {
      'Reddit': '#FF4500',
      'Product Hunt': '#DA552F',
      'X': '#333333',
      'Threads': '#000000'
    };

    const result = Object.entries(grouped).map(([platform, value]) => ({
      platform,
      percentage: total ? Math.round((value / total) * 100) : 0,
      color: platformColors[platform] || '#52525B'
    })).sort((a, b) => b.percentage - a.percentage);

    setBreakdown(result);
  }, [posts, breakdownMetric]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const displayedPosts = showAllPosts ? posts : posts.slice(0, 4);

  const analyticsContext = {
    selectedPeriod,
    activePlatform,
    posts: posts.map(p => ({
      title: p.title,
      upvotes: p.upvotes,
      comments: p.comments,
      linkTaps: p.linkTaps,
      engagement: p.engagement,
      date: p.date
    })),
    metrics,
    breakdown,
    bestPost: posts.length > 0 ? [...posts].sort((a, b) => (b.engagement || 0) - (a.engagement || 0))[0] : null,
    worstPost: posts.length > 0 ? [...posts].sort((a, b) => (a.engagement || 0) - (b.engagement || 0))[posts.length - 1] : null,
    zeroEngagementCount: posts.filter(p => (p.engagement || 0) === 0).length
  };

  if (isLoading && !posts.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 relative">
        {plan === 'free' ? (
          /* TASK 6 — Result Tracker Locked State */
          <div className="max-w-3xl mx-auto py-12 w-full flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in duration-500">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-3xl font-bold text-foreground max-w-xl mx-auto leading-tight">
                Access your social insights and marketing buddy now
              </h2>
              <p className="text-foreground/60 text-sm max-w-md mx-auto">Upgrade to Pro to connect your accounts and track your performance in real-time.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-6 w-full">
              {/* Box 1: Manually checking analytics */}
              <div className="bg-foreground/5 border border-foreground/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="w-5 h-5" />
                  <h3 className="font-bold text-foreground text-base">Manually checking analytics</h3>
                </div>
                <ul className="space-y-3 text-sm text-foreground/60">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500/60 mt-0.5">•</span>
                    <span>Hard to stay consistent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500/60 mt-0.5">•</span>
                    <span>Most users rarely check analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500/60 mt-0.5">•</span>
                    <span>Hard to know what strategy changes actually matter</span>
                  </li>
                </ul>
              </div>

              {/* Box 2: With Vibe Promote */}
              <div className="bg-foreground/5 border border-orange-500/30 rounded-2xl p-6 space-y-4 bg-orange-500/[0.02]">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-bold text-foreground text-base">With Vibe Promote</h3>
                </div>
                <ul className="space-y-3 text-sm text-foreground/80">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>Analytics in one place</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>Marketing buddy explains what worked and what didn’t</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>Strategy suggestions based on analytics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (!hasConnectedAccounts && posts.length === 0) || isConnecting ? (
          <div className="max-w-[680px] mx-auto py-10 w-full">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h1 className="text-foreground text-2xl font-semibold mt-4">Connect Accounts</h1>
                <p className="text-foreground/60 text-sm mt-1">Link your platforms to track performance.</p>
              </div>
              {isConnecting && (
                <button 
                  onClick={() => setIsConnecting(false)}
                  className="p-2 rounded-lg hover:bg-foreground/5 text-foreground/60 hover:text-foreground transition-all bg-transparent"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            
            <ConnectAccounts onConnect={() => { setHasConnectedAccounts(true); setIsConnecting(false); handleRefresh(); }} />
          </div>
        ) : (
          <PlanGate
            feature="analytics"
            plan={plan}
            limit={canAccess.analyticsPreview ? "unlimited" : "locked"}
          >
            <div className="max-w-6xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-24">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
                <p className="text-foreground/60 text-sm">Real-time performance across all your channels.</p>
              </div>

              <div className="flex items-center">
                <button 
                  onClick={() => setIsConnecting(true)}
                  className="px-4 py-2.5 rounded-xl bg-foreground/5 border border-foreground/5 text-foreground text-xs font-bold hover:bg-foreground/10 transition-all flex items-center gap-2"
                >
                  <Plus size={14} className="text-orange-500" />
                  Connect Account
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PeriodSelector 
                  selected={selectedPeriod}
                  onChange={setSelectedPeriod}
                />
                
                <div className="flex gap-6 border-b border-foreground/10">
                  {["Reddit"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActivePlatform(tab)}
                      className={cn(
                        "text-sm font-medium pb-2 transition-all bg-transparent",
                        activePlatform === tab 
                          ? "text-foreground border-b-2 border-orange-500" 
                          : "text-foreground/60 border-b-2 border-transparent hover:text-foreground/80"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <MetricCards metrics={metrics} />

              <div className="space-y-6">
                <div className="min-w-0">
                  <PostPerformanceTable 
                    posts={displayedPosts} 
                    showAll={showAllPosts}
                    onToggleShowAll={() => setShowAllPosts(!showAllPosts)}
                    platform={activePlatform}
                  />
                </div>
                <div className="w-full">
                  <PlatformBreakdownBar 
                    breakdown={breakdown} 
                    metric={breakdownMetric}
                    onMetricChange={setBreakdownMetric}
                  />
                </div>
              </div>
            </div>
          </PlanGate>
        )}

        {hasConnectedAccounts && (
          <AnalyticsBuddy dataContext={analyticsContext} isLocked={!canAccess.analyticsFull} />
        )}
      </main>
    </div>
  );
}