"use client";

import React, { useEffect, useState } from 'react';
import { 
  Search, 
  PenTool, 
  Zap,
  User,
  TrendingUp,
  Calendar,
  MessageSquare,
  ArrowRight,
  Activity,
  Link as LinkIcon,
  Sparkles,
  Target,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const { user } = useAuth();
  const [isPaid, setIsPaid] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    posts_generated: 0,
    posting_streak: 0,
    connected_channels: 0,
    audience_found: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // Check payment status
        const { data: paymentData } = await supabase
          .from('user_payments')
          .select('payment_status')
          .eq('email', user.email)
          .maybeSingle();
        
        if (paymentData?.payment_status) {
          setIsPaid(true);
        }

        // Fetch Stats
        const { data: statsData } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (statsData) {
          setStats(statsData);
        }

        // Fetch Brand Brain
        const { data: brain, error: brainError } = await supabase
          .from('brand_brains')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (brain) {
          setProfileData({
            appName: brain.app_name,
            stage: brain.current_stage || 'MVP',
            mainChannel: brain.primary_platform || 'Twitter / X',
            targetAudience: brain.target_customer,
            marketingGoal: brain.primary_cta || 'Drive Traffic'
          });
        } else if (!brainError) {
          navigate('/onboarding');
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, navigate]);

  const tools = [
    { 
      id: 'audience', 
      icon: Search, 
      name: 'User Finder', 
      desc: 'Find exactly who your buyers are and where they hang out.', 
      available: true,
      path: '/audience-spotter'
    },
    { 
      id: 'hook', 
      icon: PenTool, 
      name: 'Post Maker', 
      desc: 'Generate scroll-stopping posts for Twitter, LinkedIn, and Reddit.', 
      available: true,
      path: '/post-maker'
    },
    { 
      id: 'analytics', 
      icon: BarChart2, 
      name: 'Analytics', 
      desc: 'Track your performance and see what is working.', 
      available: true,
      path: '/dashboard/results-tracker'
    },
    { 
      id: 'copilot', 
      icon: Sparkles, 
      name: 'Co-pilot', 
      desc: 'Your 24/7 AI marketing assistant for strategy and ideas.', 
      available: true,
      path: '/dashboard/marketing-buddy'
    },
    { 
      id: 'poster', 
      icon: Calendar, 
      name: 'Auto Poster/Scheduler', 
      desc: 'Schedule and automate your content across all platforms.', 
      available: false 
    },
    { 
      id: 'viral', 
      icon: TrendingUp, 
      name: 'Virality Finder', 
      desc: 'Analyze what makes posts go viral in your niche.', 
      available: false 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-white">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {!isPaid && (
              <button 
                onClick={() => navigate('/pre-purchase')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-orange-500 text-white text-xs font-bold hover:bg-orange-500/5 transition-all bg-transparent"
              >
                <Zap className="w-3 h-3" />
                Unlock Full Access
              </button>
            )}
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* Welcome & Quick Action */}
          <section className="rounded-2xl p-6 border border-orange-500/40 bg-[#111111] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Welcome, {user?.email?.split('@')[0]}
              </h2>
              <p className="text-sm text-gray-500">Your marketing co-pilot is ready.</p>
            </div>
            <button 
              onClick={() => navigate('/audience-spotter')}
              className="px-4 py-2 rounded-lg border border-orange-500 text-white text-xs font-bold hover:bg-orange-500/5 transition-all flex items-center gap-2 bg-transparent"
            >
              Start User finder
              <ArrowRight className="w-3 h-3" />
            </button>
          </section>

          {/* App Update Prompt */}
          <section className="rounded-2xl p-6 border border-white/5 bg-[#111111] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Have an App update?</h2>
              <p className="text-sm text-gray-500">Keep your Brand Brain in sync with your latest features.</p>
            </div>
            <button 
              onClick={() => navigate('/onboarding')}
              className="px-4 py-2 rounded-lg border border-orange-500 text-white text-xs font-bold hover:bg-orange-500/5 transition-all flex items-center gap-2 bg-transparent"
            >
              <RefreshCw className="w-3 h-3" />
              Update brand brain
            </button>
          </section>

          {/* Brand Brain */}
          <section className="bg-[#111111] border border-orange-500/40 rounded-2xl p-6 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Your Brand Brain
                </h3>
                <Link to="/onboarding" className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors">
                  Edit Brain
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                  { label: 'App Name', value: profileData?.appName, icon: Sparkles },
                  { label: 'Stage', value: profileData?.stage, icon: Activity },
                  { label: 'Main Channel', value: profileData?.mainChannel, icon: LinkIcon },
                  { label: 'Target Audience', value: profileData?.targetAudience, icon: Target },
                  { label: 'Marketing Goal', value: profileData?.marketingGoal, icon: Zap },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className="w-3 h-3 text-gray-600" />
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-white line-clamp-2">{item.value || 'Not set'}</span>
                  </div>
                ))}
              </div>

              {/* Your Status Section */}
              <div className="mt-10 pt-8 border-t border-white/5">
                <h3 className="text-sm font-bold text-white mb-6">
                  Your Status
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Posts Generated</p>
                    <p className="text-xl font-bold text-white">{stats.posts_generated}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Posting Streak</p>
                    <p className="text-xl font-bold text-white">{stats.posting_streak} days</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Connected Channels</p>
                    <p className="text-xl font-bold text-white">{stats.connected_channels}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Audience Found</p>
                    <p className="text-xl font-bold text-white">{stats.audience_found}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tools */}
          <section className="space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-400" />
              Marketing Tools
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <div 
                  key={tool.id} 
                  className="group relative p-6 rounded-2xl border border-orange-500/40 bg-[#111111] transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 text-gray-400">
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white">{tool.name}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                    {tool.desc}
                  </p>
                  <button
                    disabled={!tool.available}
                    onClick={() => navigate(tool.path)}
                    className={cn(
                      "w-full py-2.5 rounded-lg text-xs font-bold transition-all border bg-transparent",
                      tool.available 
                        ? "border-white/10 text-white hover:bg-white/5" 
                        : "border-white/5 text-gray-700 cursor-not-allowed"
                    )}
                  >
                    {!tool.available ? 'Coming Soon' : 'Open Tool'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}