"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import BrandInfoPreview from '../../components/shared/BrandInfoPreview';
import PeriodSelector from '../../components/shared/PeriodSelector';
import ConnectAccounts from '../../components/results-tracker/ConnectAccounts';
import MetricCards from '../../components/results-tracker/MetricCards';
import PostPerformanceTable from '../../components/results-tracker/PostPerformanceTable';
import PlatformBreakdownBar from '../../components/results-tracker/PlatformBreakdownBar';
import StrategyBuddyPanel from '../../components/results-tracker/StrategyBuddyPanel';
import { cn } from "@/lib/utils";

export default function ResultsTracker() {
  const [hasConnectedAccounts, setHasConnectedAccounts] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("This Week");
  const [activePlatform, setActivePlatform] = useState("All Platforms");

  const mockMetrics = {
    views: { value: 12483, change: 23, label: 'Views' },
    engagements: { value: 847, change: -4, label: 'Engagements' },
    linkTaps: { value: 234, change: 61, label: 'Link Taps' },
    comments: { value: 156, change: 12, label: 'Comments' }
  };

  const mockPosts = [
    { title: "I spent 40 hours building a feature nobody wanted. Here's what I learned.", platform: "Reddit", views: 4200, engagements: 340, linkTaps: 89, date: "2 days ago", isBest: true },
    { title: "Why most SaaS marketing feels like shouting into a void.", platform: "LinkedIn", views: 2100, engagements: 120, linkTaps: 45, date: "4 days ago" },
    { title: "Just hit 100 users! Here's the exact strategy we used.", platform: "Indie Hackers", views: 1800, engagements: 95, linkTaps: 32, date: "5 days ago" },
    { title: "Vibe Promote is live on Product Hunt!", platform: "Product Hunt", views: 1200, engagements: 210, linkTaps: 68, date: "1 week ago" }
  ];

  const mockBreakdown = [
    { platform: 'Reddit', percentage: 68, color: '#FF4500' },
    { platform: 'LinkedIn', percentage: 19, color: '#0A66C2' },
    { platform: 'Product Hunt', percentage: 13, color: '#DA552F' }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto w-full space-y-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-white">Results Tracker</h1>
          </div>

          {!hasConnectedAccounts ? (
            <div className="space-y-6">
              <ConnectAccounts />
              <div className="text-center">
                <button 
                  onClick={() => setHasConnectedAccounts(true)}
                  className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors bg-transparent"
                >
                  Skip for now, I'll connect later →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <BrandInfoPreview 
                appName="Vibe Promote"
                problem="Marketing takes too long"
                audience="SaaS founders"
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

              <MetricCards metrics={mockMetrics} />

              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 min-w-0">
                  <PostPerformanceTable posts={mockPosts} />
                </div>
                <div className="lg:w-72 flex-shrink-0">
                  <PlatformBreakdownBar breakdown={mockBreakdown} />
                </div>
              </div>

              <StrategyBuddyPanel isLoading={false} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}