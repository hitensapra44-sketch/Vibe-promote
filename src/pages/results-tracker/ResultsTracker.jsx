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
import { Plus, X } from 'lucide-react';
import { usePlan } from '../../lib/usePlan';
import PlanGate from '../../components/PlanGate';

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
  const [profileKarma, setProfileKarma] = useState(0);

  const fetchProfileKarma = useCallback(async () => {
    if (!user) return;

    const { data: account } = await supabase
      .from('social_accounts')
      .select('username')
      .eq('user_id', user.id)
      .eq('platform', 'Reddit')
      .maybeSingle();

    if (!account?.username) return;

    try {
      // Fetch profile karma
      const aboutRes = await fetch(
        `https://www.reddit.com/user/${account.username}/about.json`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (!aboutRes.ok) throw new Error(`about.json failed: ${aboutRes.status}`);
      const aboutJson = await aboutRes.json();
      const totalKarma = (aboutJson?.data?.link_karma ?? 0) + (aboutJson?.data?.comment_karma ?? 0);
      setProfileKarma(totalKarma);

      // Fetch recent posts with upvotes and comments
      const postsRes = await fetch(
        `https://www.reddit.com/user/${account.username}/submitted.json?limit=25`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (!postsRes.ok) throw new Error(`submitted.json failed: ${postsRes.status}`);
      const postsJson = await postsRes.json();
      const redditPosts = (postsJson?.data?.children ?? []).map(child => ({
        title: child.data.title,
        url: `https://reddit.com${child.data.permalink}`,
        upvotes: child.data.score ?? 0,
        comments: child.data.num_comments ?? 0,
        engagement: (child.data.score ?? 0) + (child.data.num_comments ?? 0),
        platform: 'Reddit',
        created_at: new Date(child.data.created_utc * 1000).toISOString()
      }));

      // Only use redditPosts if Supabase social_posts has no data for this user
      // This is a fallback display — do not overwrite Supabase data
      if (posts.length === 0 && redditPosts.length > 0) {
        setPosts(redditPosts);
        setHasConnectedAccounts(true);
      }

    } catch (e) {
      console.error("Failed to fetch Reddit data:", e);
      setProfileKarma(0);
    }
  }, [user, posts.length]);

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

  useEffect(() => {
    fetchPosts();
    fetchProfileKarma();
  }, [fetchPosts, fetchProfileKarma, refreshKey]);

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
        value: isRedditFilter ? profileKarma : totals.views, 
        change: 0, 
        label: isRedditFilter ? 'Total Karma' : 'Views' 
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
  }, [posts, activePlatform, profileKarma]);

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
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 relative">
        {(!hasConnectedAccounts && posts.length === 0) || isConnecting ? (
          <div className="max-w-[680px] mx-auto py-10 w-full">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h1 className="text-white text-2xl font-semibold mt-4">Connect Accounts</h1>
                <p className="text-zinc-400 text-sm mt-1">Link your platforms to track performance.</p>
              </div>
              {isConnecting && (
                <button 
                  onClick={() => setIsConnecting(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all bg-transparent"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            
            <ConnectAccounts onConnect={() => { handleRefresh(); setIsConnecting(false); }} />
          </div>
        ) : (
          <PlanGate
            feature="analytics"
            plan={plan}
            limit={canAccess.analyticsPreview ? "unlimited" : "locked"}
          >
            <div className="max-w-6xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-24">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-white">Analytics</h1>
                <p className="text-zinc-400 text-sm">Real-time performance across all your channels.</p>
              </div>

              <div className="flex items-center">
                <button 
                  onClick={() => setIsConnecting(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#111111] border border-white/5 text-white text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2"
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
                
                <div className="flex gap-6 border-b border-[#1F1F1F]">
                  {["Reddit"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActivePlatform(tab)}
                      className={cn(
                        "text-sm font-medium pb-2 transition-all bg-transparent",
                        activePlatform === tab 
                          ? "text-white border-b-2 border-orange-500" 
                          : "text-zinc-400 border-b-2 border-transparent hover:text-zinc-200"
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

        {hasConnectedAccounts && canAccess.analyticsFull && (
          <AnalyticsBuddy dataContext={analyticsContext} />
        )}
      </main>
    </div>
  );
}