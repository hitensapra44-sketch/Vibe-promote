"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import MetricCards from '../../components/results-tracker/MetricCards';
import PlatformBreakdownBar from '../../components/results-tracker/PlatformBreakdownBar';
import StrategyBuddyPanel from '../../components/results-tracker/StrategyBuddyPanel';
import PostPerformanceTable from '../../components/results-tracker/PostPerformanceTable';
import AnalyticsBuddy from '../../components/results-tracker/AnalyticsBuddy';
import PeriodSelector from '../../components/shared/PeriodSelector';
import BrandInfoPreview from '../../components/shared/BrandInfoPreview';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import { TrendingUp, Sparkles, Filter, ChevronDown, Lock, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
import { markTaskComplete } from '../../components/TaskWidget';
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';

export default function ResultsTracker() {
  const { user, plan } = useAuth();
  const [isPaid, setIsPaid] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("This Week");
  const [activePlatform, setActivePlatform] = useState("All Platforms");
  const [activeMetric, setActiveMetric] = useState("views");
  const [loading, setLoading] = useState(true);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [brand, setBrain] = useState(null);

  // Mark analytics check task as complete
  useEffect(() => {
    if (user?.id) {
      markTaskComplete(user.id, 'analytics_d4', supabase);
      markTaskComplete(user.id, 'analytics_week1_d7', supabase);
      markTaskComplete(user.id, 'analytics_d10', supabase);
      markTaskComplete(user.id, 'analytics_final_d15', supabase);
    }
  }, [user?.id]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const { data: paymentData } = await supabase
          .from('user_payments')
          .select('payment_status')
          .eq('email', user.email)
          .maybeSingle();
        if (paymentData?.payment_status) setIsPaid(true);

        const { data: brainData } = await supabase.from('brand_brains').select('*').eq('user_id', user.id).maybeSingle();
        setBrain(brainData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Mock data generator for preview
  const data = useMemo(() => {
    const isThisWeek = selectedPeriod === "This Week";
    const multiplier = isThisWeek ? 1 : 0.85;

    return {
      metrics: {
        views: { label: 'Views', value: Math.floor(12400 * multiplier), change: isThisWeek ? 12.5 : -5.2 },
        engagements: { label: 'Engagement', value: Math.floor(842 * multiplier), change: isThisWeek ? 8.1 : -2.1 },
        comments: { label: 'Comments', value: Math.floor(156 * multiplier), change: isThisWeek ? 14.2 : 3.5 },
        linkTaps: { label: 'Link Taps', value: Math.floor(412 * multiplier), change: isThisWeek ? 18.7 : -8.4 },
      },
      breakdown: [
        { platform: 'Reddit', percentage: 45, color: '#FF4500' },
        { platform: 'X', percentage: 25, color: '#000000' },
        { platform: 'Threads', percentage: 15, color: '#333333' },
        { platform: 'LinkedIn', percentage: 10, color: '#0A66C2' },
        { platform: 'Other', percentage: 5, color: '#71717a' },
      ],
      posts: [
        { title: "I spent 3 months building a fitness app and got 16 downloads. Here's what I learned about validation.", platform: 'Reddit', upvotes: 420, comments: 84, engagement: 504, url: 'https://reddit.com', date: '2 days ago', linkTaps: 112 },
        { title: "Building a SaaS is 10% coding, 90% finding people who actually have the problem.", platform: 'X', upvotes: 124, comments: 12, engagement: 136, url: 'https://x.com', date: 'Yesterday', linkTaps: 45 },
        { title: "Unpopular opinion: You don't need a marketing team, you need a marketing system.", platform: 'LinkedIn', upvotes: 89, comments: 24, engagement: 113, url: 'https://linkedin.com', date: '3 days ago', linkTaps: 67 },
      ]
    };
  }, [selectedPeriod]);

  const bestPost = useMemo(() => [...data.posts].sort((a, b) => b.engagement - a.engagement)[0], [data]);
  const worstPost = useMemo(() => [...data.posts].sort((a, b) => a.engagement - b.engagement)[0], [data]);
  const zeroEngagementCount = useMemo(() => data.posts.filter(p => p.engagement === 0).length, [data]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  const isFreeUser = plan === 'free';

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-foreground/5 bg-background flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-foreground">Results Tracker</h1>
          </div>
          <div className="flex items-center gap-3">
            <PeriodSelector selected={selectedPeriod} onChange={setSelectedPeriod} />
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full pb-24">
          
          {isFreeUser ? (
             /* Locked State for Free Users */
             <div className="max-w-3xl mx-auto py-12 w-full flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in duration-500">
             <div className="space-y-4">
               <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto">
                 <Lock className="w-8 h-8 text-orange-500" />
               </div>
               <h2 className="text-3xl font-bold text-foreground max-w-xl mx-auto leading-tight">
                 Access your social insights and marketing buddy now
               </h2>
               <p className="text-foreground/60 text-sm max-w-md mx-auto">
                 Upgrade to Pro to connect your accounts and track your performance in real-time.
               </p>
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
          ) : (
            /* Active Dashboard for Pro Users */
            <>
              {brand && (
                <BrandInfoPreview 
                  appName={brand.app_name} 
                  problem={brand.core_problem} 
                  audience={brand.target_customer} 
                />
              )}

              <MetricCards metrics={data.metrics} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <PlatformBreakdownBar 
                    breakdown={data.breakdown} 
                    metric={activeMetric}
                    onMetricChange={setActiveMetric}
                  />
                  <PostPerformanceTable 
                    posts={data.posts} 
                    showAll={showAllPosts}
                    onToggleShowAll={() => setShowAllPosts(!showAllPosts)}
                    platform={activePlatform}
                  />
                </div>
                
                <div className="space-y-6">
                  <StrategyBuddyPanel />
                  
                  <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp size={16} className="text-primary" />
                      <span className="text-sm font-bold">Trending Topics</span>
                    </div>
                    <div className="space-y-3">
                      {['#buildinpublic', '#indiehackers', '#saas'].map(tag => (
                        <div key={tag} className="flex items-center justify-between group cursor-pointer">
                          <span className="text-zinc-500 text-xs group-hover:text-foreground transition-colors">{tag}</span>
                          <span className="text-[10px] font-bold text-green-500">+12% reach</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <AnalyticsBuddy 
        isLocked={isFreeUser}
        dataContext={{
          selectedPeriod,
          activePlatform,
          posts: data.posts,
          metrics: data.metrics,
          breakdown: data.breakdown,
          bestPost,
          worstPost,
          zeroEngagementCount
        }} 
      />
    </div>
  );
}