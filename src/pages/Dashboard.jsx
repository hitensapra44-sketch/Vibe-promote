"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  PenTool, 
  LogOut,
  Sparkles,
  Zap,
  Menu,
  User,
  TrendingUp,
  PanelLeftClose,
  PanelLeftOpen,
  Brain,
  Calendar,
  MessageSquare,
  ArrowRight,
  FileText,
  Flame,
  Target,
  Twitter,
  Linkedin,
  Hash,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [isPaid, setIsPaid] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    postsGenerated: 0,
    audiencesFound: 0,
    consistencyStreak: 0,
    daysActive: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // Payment status
        const { data: paymentData } = await supabase
          .from('user_payments')
          .select('payment_status')
          .eq('email', user.email)
          .single();
        
        if (paymentData?.payment_status) setIsPaid(true);

        // Survey answers
        const { data: answers } = await supabase
          .from('user_answers')
          .select('question_id, answer')
          .eq('user_id', user.id);

        if (answers && answers.length > 0) {
          setProfileData({
            appName: answers.find(a => a.question_id === 1)?.answer || 'Not set',
            role: answers.find(a => a.question_id === 2)?.answer || 'Not set',
            channels: answers.find(a => a.question_id === 4)?.answer || 'Not set',
            productType: answers.find(a => a.question_id === 5)?.answer || 'Not set',
            focus: answers.find(a => a.question_id === 6)?.answer || 'Not set',
          });
        }

        // Days active since signup
        if (user?.created_at) {
          const created = new Date(user.created_at);
          const now = new Date();
          // @ts-ignore
          const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
          setStats(prev => ({ ...prev, daysActive: diff }));
        }

        // Posts generated — ready for when post_maker saves to DB
        const { data: postsData } = await supabase
          .from('generated_posts')
          .select('id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (postsData) {
          setRecentPosts(postsData.slice(0, 3));
          setStats(prev => ({ ...prev, postsGenerated: postsData.length }));

          // Consistency streak: count consecutive days with at least 1 post
          if (postsData.length > 0) {
            const postDays = [...new Set(postsData.map(p => 
              new Date(p.created_at).toDateString()
            ))];
            let streak = 0;
            const today = new Date();
            for (let i = 0; i < 30; i++) {
              const day = new Date(today);
              day.setDate(today.getDate() - i);
              if (postDays.includes(day.toDateString())) {
                streak++;
              } else {
                break;
              }
            }
            setStats(prev => ({ ...prev, consistencyStreak: streak }));
          }
        }

        // Audiences found — ready for when audience spotter saves results
        const { data: audienceData } = await supabase
          .from('audience_results')
          .select('id')
          .eq('user_id', user.id);

        if (audienceData) {
          setStats(prev => ({ ...prev, audiencesFound: audienceData.length }));
        }

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: true },
    { icon: Brain, label: 'Brand Brain', path: '/onboarding', available: true },
    { icon: Search, label: 'Audience Spotter', path: '/audience-spotter', available: true },
    { icon: PenTool, label: 'Post Maker', path: '/post-maker', available: true },
    { icon: MessageSquare, label: 'Co-Pilot', path: '/marketing-buddy', available: true },
    { icon: TrendingUp, label: 'Virality Finder', path: '#', available: false, comingSoon: true },
    { icon: Calendar, label: 'Auto Poster', path: '#', available: false, comingSoon: true },
  ];

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
      id: 'copilot', 
      icon: MessageSquare, 
      name: 'Co-Pilot', 
      desc: 'Your AI marketing assistant for strategy and content ideas.', 
      available: true,
      path: '/marketing-buddy'
    },
    { 
      id: 'analytics', 
      icon: TrendingUp, 
      name: 'Analytics', 
      desc: 'Track performance and insights across all your marketing channels.', 
      available: false 
    },
    { 
      id: 'poster', 
      icon: Calendar, 
      name: 'Auto Poster/Scheduler', 
      desc: 'Schedule and automate your content across all platforms.', 
      available: false 
    },
  ];

  // Which channels the user selected (parsed from comma-separated answer)
  const userChannels = profileData?.channels?.toLowerCase() || '';
  const channelStatus = [
    { name: 'Twitter / X', icon: Twitter, connected: userChannels.includes('twitter') || userChannels.includes('x') },
    { name: 'LinkedIn', icon: Linkedin, connected: userChannels.includes('linkedin') },
    { name: 'Reddit', icon: Hash, connected: userChannels.includes('reddit') },
  ];

  const statCards = [
    {
      label: 'Posts Generated',
      value: stats.postsGenerated,
      icon: FileText,
      suffix: '',
    },
    {
      label: 'Audiences Found',
      value: stats.audiencesFound,
      icon: Target,
      suffix: '',
    },
    {
      label: 'Day Streak',
      value: stats.consistencyStreak,
      icon: Flame,
      suffix: stats.consistencyStreak === 1 ? ' day' : ' days',
    },
    {
      label: 'Days Active',
      value: stats.daysActive,
      icon: Calendar,
      suffix: stats.daysActive === 1 ? ' day' : ' days',
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
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 bg-[#111111] border-r border-white/5 z-50 transition-all duration-300 h-screen overflow-hidden",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        sidebarCollapsed ? "lg:w-16" : "lg:w-56"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-bold tracking-tight">Vibe Promote</span>
              </div>
            )}
            <button 
              className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 transition-all bg-transparent"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          <nav className="flex-1 px-3 py-2 space-y-0.5">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => link.available && navigate(link.path)}
                className={cn(
                  "w-full flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all group bg-transparent",
                  link.active 
                    ? "bg-white/5 text-white" 
                    : "text-gray-500 hover:text-white hover:bg-white/5",
                  sidebarCollapsed ? "justify-center" : "justify-between"
                )}
              >
                <div className="flex items-center gap-3">
                  <link.icon className="w-4 h-4" />
                  {!sidebarCollapsed && (
                    <div className="flex flex-col items-start">
                      <span>{link.label}</span>
                      {link.comingSoon && (
                        <span className="text-[8px] text-orange-500/60 font-bold uppercase tracking-tighter">Coming Soon</span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-white/5 space-y-3">
            {!sidebarCollapsed && (
              <div className="px-2">
                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Account</p>
                <p className="text-[10px] text-gray-500 truncate mb-2">{user?.email}</p>
                <div className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border",
                  isPaid ? "border-green-500/30 text-green-500" : "border-orange-500/30 text-orange-500"
                )}>
                  {isPaid ? "Lifetime" : "Free Tier"}
                </div>
              </div>
            )}
            
            <button 
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all bg-transparent",
                sidebarCollapsed ? "justify-center" : ""
              )}
            >
              <LogOut className="w-4 h-4" />
              {!sidebarCollapsed && "Log Out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 bg-transparent" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-white">Dashboard</h1>
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
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
            >
              Start User Finder
              <ArrowRight className="w-3 h-3" />
            </button>
          </section>

          {/* App Update Section */}
          <section className="rounded-2xl p-6 border border-orange-500/40 bg-[#111111] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Have an app update?
              </h3>
              <p className="text-sm text-gray-500">Keep your brand brain up to date with the latest information.</p>
            </div>
            <button 
              onClick={() => navigate('/onboarding')}
              className="px-4 py-2 rounded-lg border border-orange-500 text-white text-xs font-bold hover:bg-orange-500/5 transition-all flex items-center gap-2 bg-transparent"
            >
              Update Brand Brain
              <ArrowRight className="w-3 h-3" />
            </button>
          </section>

          {/* ── YOUR PROFILE ── */}
          <section className="bg-[#111111] border border-orange-500/40 rounded-2xl p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Your Profile
              </h3>
              <Link to="/survey" className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors">
                Retake Survey →
              </Link>
            </div>

            {/* App Name + Target Audience + Platforms + Marketing Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">App Name</span>
                <span className="text-base font-bold text-white truncate">{profileData?.appName || 'Not set'}</span>
              </div>
              <div className="flex flex-col p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Target Audience</span>
                <span className="text-sm font-bold text-white">{profileData?.targetAudience || 'Not set'}</span>
              </div>
              <div className="flex flex-col p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Platforms</span>
                <span className="text-sm font-bold text-white">{profileData?.platforms || 'Not set'}</span>
              </div>
              <div className="flex flex-col p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Marketing Goal</span>
                <span className="text-sm font-bold text-white">{profileData?.marketingGoal || 'Not set'}</span>
              </div>
            </div>

            {/* Activity Status */}
            <div>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Activity Status</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statCards.map((stat, i) => (
                  <div key={i} className="flex flex-col p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">{stat.label}</span>
                    <span className="text-xl font-bold text-white">
                      {stat.value}
                      <span className="text-xs font-medium text-gray-500 ml-1">{stat.suffix}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </section>
          {/* ── END YOUR PROFILE ── */}

          {/* Recent Posts Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Recent Posts
            </h3>
            {recentPosts.length === 0 ? (
              <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                <p className="text-xs text-gray-500">No posts generated yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {/* Posts will be mapped here once post_maker saves to DB */}
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