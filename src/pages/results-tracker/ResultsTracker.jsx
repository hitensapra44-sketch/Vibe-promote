"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import BrandInfoPreview from '../../components/shared/BrandInfoPreview';
import PeriodSelector from '../../components/shared/PeriodSelector';
import ConnectAccounts from '../../components/results-tracker/ConnectAccounts';
import MetricCards from '../../components/results-tracker/MetricCards';
import PostPerformanceTable from '../../components/results-tracker/PostPerformanceTable';
import PlatformBreakdownBar from '../../components/results-tracker/PlatformBreakdownBar';
import AnalyticsBuddy from '../../components/results-tracker/AnalyticsBuddy';
import { cn } from "@/lib/utils";
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../lib/AuthContext';

export default function ResultsTracker() {
  const { user } = useAuth();
  const [hasConnectedAccounts, setHasConnectedAccounts] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("This Week");
  const [activePlatform, setActivePlatform] = useState("All Platforms");
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [breakdownMetric, setBreakdownMetric] = useState("views");
  
  const [posts, setPosts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPosts = useCallback(async () => {
    if (!user) return;

    let query = supabase
      .from('social_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (activePlatform !== 'All Platforms') {
      query = query.eq('platform', activePlatform);
    }

    const now = new Date();
    if (selectedPeriod === 'This Week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      query = query.gte('created_at', weekAgo.toISOString());
    } else if (selectedPeriod === 'This Month') {
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);
      query = query.gte('created_at', monthAgo.toISOString());
    } else if (selectedPeriod === 'Last Week') {
      const start = new Date(now);
      start.setDate(now.getDate() - 14);
      const end = new Date(now);
      end.setDate(now.getDate() - 7);
      query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
    } else if (selectedPeriod === 'Last Month') {
      const start = new Date(now);
      start.setDate(now.getDate() - 60);
      const end = new Date(now);
      end.setDate(now.getDate() - 30);
      query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
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

    const mappedData = (data ?? []).map(p => ({
      ...p,
      linkTaps: p.link_clicks ?? 0,
      date: new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));

    setPosts(mappedData);
    setIsLoading(false);
  }, [user, activePlatform, selectedPeriod]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, refreshKey]);

  // Calculate metrics from posts
  useEffect(() => {
    const totals = posts.reduce(
      (acc, p) => ({
        views: acc.views + (p.views ?? 0),
        engagements: acc.engagements + (p.engagements ?? 0),
        comments: acc.comments + (p.comments ?? 0),
        linkTaps: acc.linkTaps + (p.linkTaps ?? 0),
      }),
      { views: 0, engagements: 0, comments: 0, linkTaps: 0 }
    );

    setMetrics({
      views: { value: totals.views, change: 0, label: 'Views' },
      engagements: { value: totals.engagements, change: 0, label: 'Engagements' },
      linkTaps: { value: totals.linkTaps, change: 0, label: 'Link Taps' },
      comments: { value: totals.comments, change: 0, label: 'Comments' },
    });
  }, [posts]);

  // Calculate platform breakdown
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
      'LinkedIn': '#0A66C2',
      'Product Hunt': '#DA552F',
      'X': '#333333',
      'Threads': '#000000',
      'Indie Hackers': '#0EA5E9'
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
        {!hasConnectedAccounts && posts.length === 0 ? (
          <div className="max-w-[680px] mx-auto py-10 w-full">
            <div className="space-y-1 mb-8">
              <h1 className="text-white text-2xl font-semibold mt-4">Analytics</h1>
              <p className="text-zinc-400 text-sm mt-1">Connect your accounts to see what's working.</p>
            </div>
            
            <ConnectAccounts onConnect={handleRefresh} />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-24">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-white">Analytics</h1>
              <p className="text-zinc-400 text-sm">Real-time performance across all your channels.</p>
            </div>

            <BrandInfoPreview 
              appName="Vibe Promote"
              problem="Marketing takes too long"
              audience="SaaS founders"
              hideEdit={true}
              hideLabel={true}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <PeriodSelector 
                selected={selectedPeriod}
                onChange={setSelectedPeriod}
              />
              
              <div className="flex gap-6 border-b border-[#1F1F1F]">
                {["All Platforms", "Reddit", "LinkedIn", "Product Hunt", "Indie Hackers"].map(tab => (
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
        )}

        {hasConnectedAccounts && <AnalyticsBuddy />}
      </main>
    </div>
  );
}