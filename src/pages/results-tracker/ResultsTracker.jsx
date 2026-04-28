"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import BrandInfoPreview from '../../components/shared/BrandInfoPreview';
import PeriodSelector from '../../components/shared/PeriodSelector';
import ConnectAccounts from '../../components/results-tracker/ConnectAccounts';
import MetricCards from '../../components/results-tracker/MetricCards';
import PostPerformanceTable from '../../components/results-tracker/PostPerformanceTable';
import PlatformBreakdownBar from '../../components/results-tracker/PlatformBreakdownBar';
import AnalyticsBuddy from '../../components/results-tracker/AnalyticsBuddy';
import { cn } from "@/lib/utils";

export default function ResultsTracker() {
  const [hasConnectedAccounts, setHasConnectedAccounts] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("This Week");
  const [activePlatform, setActivePlatform] = useState("All Platforms");
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [breakdownMetric, setBreakdownMetric] = useState("views");

  const getMetrics = () => {
    if (activePlatform === "Reddit") {
      return {
        views: { value: 8420, change: 15, label: 'Views' },
        engagements: { value: 520, change: 8, label: 'Upvotes' },
        linkTaps: { value: 142, change: 42, label: 'Link Taps' },
        comments: { value: 89, change: 5, label: 'Comments' }
      };
    }
    if (activePlatform === "Product Hunt") {
      return {
        views: { value: 3100, change: 120, label: 'Views' },
        engagements: { value: 450, change: 85, label: 'Votes' },
        comments: { value: 112, change: 30, label: 'Comments' },
        linkTaps: { value: 94, change: 55, label: 'Link Taps' }
      };
    }
    return {
      views: { value: 12483, change: 23, label: 'Views' },
      engagements: { value: 847, change: -4, label: 'Engagements' },
      linkTaps: { value: 234, change: 61, label: 'Link Taps' },
      comments: { value: 156, change: 12, label: 'Comments' }
    };
  };

  const allMockPosts = [
    { title: "I spent 40 hours building a feature nobody wanted. Here's what I learned.", platform: "Reddit", views: 4200, engagements: 340, linkTaps: 89, date: "2 days ago" },
    { title: "Why most SaaS marketing feels like shouting into a void.", platform: "LinkedIn", views: 2100, engagements: 120, linkTaps: 45, date: "4 days ago" },
    { title: "Just hit 100 users! Here's the exact strategy we used.", platform: "Indie Hackers", views: 1800, engagements: 95, linkTaps: 32, date: "5 days ago" },
    { title: "Vibe Promote is live on Product Hunt!", platform: "Product Hunt", views: 1200, engagements: 210, linkTaps: 68, date: "1 week ago" },
    { title: "How to find your first 10 customers without spending a dime.", platform: "Reddit", views: 950, engagements: 45, linkTaps: 12, date: "1 week ago" },
    { title: "The future of AI marketing is agentic.", platform: "X", views: 800, engagements: 30, linkTaps: 5, date: "2 weeks ago" },
  ];

  const displayedPosts = showAllPosts ? allMockPosts : allMockPosts.slice(0, 4);

  const mockBreakdowns = {
    views: [
      { platform: 'Reddit', percentage: 68, color: '#FF4500' },
      { platform: 'LinkedIn', percentage: 19, color: '#0A66C2' },
      { platform: 'Product Hunt', percentage: 13, color: '#DA552F' }
    ],
    engagements: [
      { platform: 'Reddit', percentage: 55, color: '#FF4500' },
      { platform: 'LinkedIn', percentage: 25, color: '#0A66C2' },
      { platform: 'Product Hunt', percentage: 20, color: '#DA552F' }
    ],
    linkTaps: [
      { platform: 'Reddit', percentage: 40, color: '#FF4500' },
      { platform: 'LinkedIn', percentage: 30, color: '#0A66C2' },
      { platform: 'Product Hunt', percentage: 30, color: '#DA552F' }
    ],
    comments: [
      { platform: 'Reddit', percentage: 80, color: '#FF4500' },
      { platform: 'LinkedIn', percentage: 10, color: '#0A66C2' },
      { platform: 'Product Hunt', percentage: 10, color: '#DA552F' }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 relative">
        {!hasConnectedAccounts ? (
          <div className="max-w-[680px] mx-auto py-10 w-full">
            <div className="space-y-1 mb-8">
              <h1 className="text-white text-2xl font-semibold mt-4">Analytics</h1>
              <p className="text-zinc-400 text-sm mt-1">Connect your accounts to see what's working.</p>
            </div>
            
            <ConnectAccounts onConnect={() => setHasConnectedAccounts(true)} />
            
            <div className="text-center mt-8">
              <button 
                onClick={() => setHasConnectedAccounts(true)}
                className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors bg-transparent"
              >
                Skip for now, I'll connect later →
              </button>
            </div>
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
                {["All Platforms", "Reddit", "LinkedIn", "Product Hunt", "IH"].map(tab => (
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

            <MetricCards metrics={getMetrics()} />

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
                  breakdown={mockBreakdowns[breakdownMetric]} 
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