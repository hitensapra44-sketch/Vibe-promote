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
  FileText,
  Target,
  Activity,
  Link as LinkIcon,
  Flame
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
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const { data: paymentData } = await supabase
          .from('user_payments')
          .select('payment_status')
          .eq('email', user.email)
          .single();
        
        if (paymentData?.payment_status) {
          setIsPaid(true);
        }

        const { data: brain } = await supabase
          .from('brand_brains')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (brain) {
          setProfileData({
            appName: brain.app_name,
            stage: brain.current_stage || 'MVP',
            mainChannel: brain.primary_platform || 'Twitter / X',
            targetAudience: brain.target_customer,
            marketingGoal: brain.primary_cta || 'Drive Traffic'
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const tools = [
    { 
      id: 'audience', 
      icon: Search, 
      name: 'Audience Spotter', 
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
      id: 'poster', 
      icon: Calendar, 
      name: 'Auto Poster/Scheduler', 
      desc: 'Schedule and automate your content across all platforms.', 
      available: false 
    },
    { 
      id: 'helper', 
      icon: MessageSquare, 
      name: 'Agentic Helper', 
      desc: 'Your 24/7 AI marketing assistant for strategy and ideas.', 
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

      {/* Main Content */}
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
          {/* Welcome Banner */}
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
              Start Audience finder
              <ArrowRight className="w-3 h-3" />
            </button>
          </section>

          {/* Your Profile Section */}
          <section className="bg-[#111111] border border-orange-500/40 rounded-2xl p-6 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Your Profile
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
            </div>

            <div className="pt-8 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">Current Stage Metrics</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Post Generated', value: '0', icon: FileText },
                  { label: 'Audience Found', value: '0', icon: Search },
                  { label: 'Connected Channel', value: '0', icon: LinkIcon },
                  { label: 'Posting Streak', value: '0 days', icon: Flame },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{item.label}</p>
                      <p className="text-lg font-bold text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recent Posts Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Recent Posts
            </h3>
            {recentPosts.length === 0 ? (
              <div className="p-12 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <PenTool className="w-6 h-6 text-gray-700" />
                </div>
                <p className="text-sm font-medium text-gray-500">No posts generated yet.</p>
                <button 
                  onClick={() => navigate('/post-maker')}
                  className="mt-4 text-xs font-bold text-orange-500 hover:underline bg-transparent"
                >
                  Create your first post →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {/* Posts would be mapped here */}
              </div>
            )}
          </section>

          {/* Tools Grid */}
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
                    onClick={() => isPaid ? navigate(tool.path) : navigate('/pre-purchase')}
                    className={cn(
                      "w-full py-2.5 rounded-lg text-xs font-bold transition-all border bg-transparent",
                      tool.available 
                        ? "border-white/10 text-white hover:bg-white/5" 
                        : "border-white/5 text-gray-700 cursor-not-allowed"
                    )}
                  >
                    {!tool.available ? 'Coming Soon' : (isPaid ? 'Open Tool' : 'Unlock Access')}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <footer className="pt-8 pb-6 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] text-gray-700 font-medium">
              Vibe Promote © 2026
            </p>
            <div className="flex items-center gap-4">
              <button className="text-[10px] text-gray-700 hover:text-white transition-colors bg-transparent">Support</button>
              <button className="text-[10px] text-gray-700 hover:text-white transition-colors bg-transparent">Feedback</button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}