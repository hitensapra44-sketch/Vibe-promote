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
  XCircle,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import Sidebar from '../components/Sidebar';
import AppGuide from '../components/AppGuide';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isPaid, setIsPaid] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    postsGenerated: 0,
    audiencesFound: 0,
    connectedChannels: 0,
    consistencyStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show guide on first login
    const hasSeenGuide = localStorage.getItem('vh_has_seen_guide');
    if (!hasSeenGuide) {
      setShowGuide(true);
      localStorage.setItem('vh_has_seen_guide', 'true');
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // Payment status
        const { data: paymentData } = await supabase
          .from('user_payments')
          .select('payment_status')
          .eq('email', user.email)
          .maybeSingle();
        
        if (paymentData?.payment_status) setIsPaid(true);

        // Fetch Brand Brain data for profile
        const { data: brainData } = await supabase
          .from('brand_brains')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (brainData) {
          setProfileData({
            appName: brainData.app_name || 'Not set',
            targetAudience: brainData.target_customer || 'Not set',
            platforms: brainData.primary_platform || 'Not set',
            marketingGoal: brainData.primary_cta || 'Not set',
          });
        }

        // Fetch social posts for count
        const { count: postCount } = await supabase
          .from('social_posts')
          .select('platform, created_at', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Connected channels count
        const { count: channelCount } = await supabase
          .from('social_accounts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Audiences found count
        const { count: audienceCount } = await supabase
          .from('audience_signals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch streak from user_progress table to sync with Progress Page
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('streak')
          .eq('user_id', user.id)
          .maybeSingle();

        const streak = progressData?.streak || 0;

        setStats({
          postsGenerated: postCount || 0,
          audiencesFound: audienceCount || 0,
          connectedChannels: channelCount || 0,
          consistencyStreak: streak,
        });

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
      available: true,
      path: '/dashboard/results-tracker'
    },
     { 
      id: 'poster', 
      icon: Calendar, 
      name: 'Auto Poster/Scheduler', 
      desc: 'Schedule and automate your content across all platforms.', 
      available: false 
    },
  ];

  const statCards = [
    {
      label: 'Post Generated',
      value: stats.postsGenerated,
      icon: PenTool,
      suffix: '',
    },
    {
      label: 'Audience Found',
      value: stats.audiencesFound,
      icon: Target,
      suffix: '',
    },
    {
      label: 'Connect Channels',
      value: stats.connectedChannels,
      icon: Hash,
      suffix: '',
    },
    {
      label: 'Streak',
      value: stats.consistencyStreak,
      icon: Flame,
      suffix: stats.consistencyStreak === 1 ? ' day' : ' days',
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-background/80 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-foreground/5 bg-background flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 bg-transparent" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-foreground">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-foreground/5 transition-colors text-foreground bg-transparent border-none cursor-pointer flex items-center justify-center"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-zinc-700" />}
            </button>
            <button 
              onClick={() => setShowGuide(true)}
              className="px-3 py-1.5 rounded-lg border border-foreground/10 text-foreground/70 text-xs font-bold hover:bg-foreground/5 transition-all bg-transparent"
            >
              Quick Tour
            </button>
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">

          <section className="rounded-2xl p-6 border border-orange-500/40 bg-foreground/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                Welcome, {user?.email?.split('@')[0]}
              </h2>
              <p className="text-sm text-foreground/70">Your marketing co-pilot is ready.</p>
            </div>
            <button 
              onClick={() => navigate('/progress')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              Track Your Progress
              <ArrowRight className="w-3 h-3" />
            </button>
          </section>

          {/* App Update Section */}
          <section className="bg-foreground/5 border border-orange-500/40 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">
                Have an app update?
              </h3>
              <p className="text-xs text-foreground/70">Keep your brand brain up to date with the latest features.</p>
            </div>
            <button 
              onClick={() => navigate('/brand-brain')}
              className="px-4 py-2 rounded-lg border border-foreground/10 text-foreground text-xs font-bold hover:bg-foreground/5 transition-all flex items-center gap-2 bg-transparent"
            >
              Update brand brain
              <ArrowRight className="w-3 h-3" />
            </button>
          </section>

          <section className="bg-foreground/5 border border-orange-500/40 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-foreground/70" />
                Your Profile
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col p-4 rounded-xl border border-foreground/5 bg-foreground/5">
                <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest mb-1">App Name</span>
                <span className="text-base font-bold text-foreground truncate">{profileData?.appName}</span>
              </div>
              <div className="flex flex-col p-4 rounded-xl border border-foreground/5 bg-foreground/5">
                <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest mb-1">Target Audience</span>
                <span className="text-sm font-bold text-foreground truncate">{profileData?.targetAudience}</span>
              </div>
              <div className="flex flex-col p-4 rounded-xl border border-foreground/5 bg-foreground/5">
                <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest mb-1">Platforms</span>
                <span className="text-sm font-bold text-foreground truncate">{profileData?.platforms}</span>
              </div>
              <div className="flex flex-col p-4 rounded-xl border border-foreground/5 bg-foreground/5">
                <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest mb-1">Marketing Goal</span>
                <span className="text-sm font-bold text-foreground truncate">{profileData?.marketingGoal}</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest mb-3">Activity Status</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statCards.map((stat, i) => (
                  <div key={i} className="flex flex-col p-4 rounded-xl border border-foreground/5 bg-foreground/5">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className="w-3 h-3 text-foreground/70" />
                      <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <span className="text-xl font-bold text-foreground">
                      {stat.value}
                      <span className="text-xs font-medium text-foreground/70 ml-1">{stat.suffix}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-foreground/70" />
              Marketing Tools
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <div 
                  key={tool.id} 
                  className="group relative p-6 rounded-2xl border border-orange-500/40 bg-foreground/5 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center mb-4 text-foreground/70">
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-foreground">{tool.name}</h4>
                  </div>
                  <p className="text-xs text-foreground/70 mb-6 leading-relaxed">
                    {tool.desc}
                  </p>
                  <button
                    disabled={!tool.available}
                    onClick={() => isPaid ? navigate(tool.path) : navigate('/pricing')}
                    className={cn(
                      "w-full py-2.5 rounded-lg text-xs font-medium transition-all border bg-transparent",
                      tool.available 
                        ? "border-foreground/10 text-foreground hover:bg-foreground/5" 
                        : "border-foreground/5 text-foreground/30 cursor-not-allowed"
                    )}
                  >
                    {!tool.available ? 'Coming Soon' : (isPaid ? 'Open Tool' : 'Unlock Access')}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <footer className="pt-8 pb-6 border-t border-foreground/5 flex items-center justify-between">
            <p className="text-[10px] text-foreground/60 font-medium">
              Vibe Promote © 2026
            </p>
          </footer>
        </div>
      </main>

      {showGuide && <AppGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
}
</dyad-file>

<dyad-write path="src/components/landing/HeroSection.jsx" description="Making the curved connection lines bright orange and highly visible.">
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Link as LinkIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('https://');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url || url === 'https://') return;
    localStorage.setItem('onboarding_url', url);
    navigate('/auth');
  };

  const leftPlatforms = [
    { id: 'reddit', name: 'Reddit', img: '/images/reddit.png', top: '20%', left: '8%' },
    { id: 'x', name: 'X / Twitter', img: '/images/x.png', top: '45%', left: '4%' },
    { id: 'indiehackers', name: 'Indie Hackers', img: '/images/indiehackers.png', top: '70%', left: '10%' },
  ];

  const rightPlatforms = [
    { id: 'hackernews', name: 'Hacker News', img: '/images/hackernews.png', top: '20%', right: '8%' },
    { id: 'threads', name: 'Threads', img: '/images/threads.png', top: '45%', right: '4%' },
    { id: 'producthunt', name: 'Product Hunt', img: '/images/producthunt.png', top: '70%', right: '10%' },
  ];

  return (
    <section id="hero" className="bg-white min-h-screen flex items-center justify-center py-24 md:py-32 relative overflow-hidden">
      {/* Elegant Curved SVG Connection Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left Lines */}
          <motion.path
            d="M 150 200 Q 350 250 720 350"
            stroke="#F97316"
            strokeWidth="2.5"
            strokeOpacity="0.75"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 100 450 Q 300 450 720 380"
            stroke="#F97316"
            strokeWidth="2.5"
            strokeOpacity="0.75"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 180 700 Q 380 650 720 410"
            stroke="#F97316"
            strokeWidth="2.5"
            strokeOpacity="0.75"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          {/* Right Lines */}
          <motion.path
            d="M 1290 200 Q 1090 250 720 350"
            stroke="#F97316"
            strokeWidth="2.5"
            strokeOpacity="0.75"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, 20] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 1340 450 Q 1140 450 720 380"
            stroke="#F97316"
            strokeWidth="2.5"
            strokeOpacity="0.75"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, 20] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 1260 700 Q 1060 650 720 410"
            stroke="#F97316"
            strokeWidth="2.5"
            strokeOpacity="0.75"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, 20] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>

      {/* Left Side Platforms */}
      <div className="absolute inset-y-0 left-0 w-1/4 pointer-events-none hidden lg:block z-10">
        {leftPlatforms.map((p) => (
          <motion.div
            key={p.id}
            className="absolute pointer-events-auto flex flex-col items-center gap-2"
            style={{ top: p.top, left: p.left }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: p.id === 'x' ? 1 : p.id === 'indiehackers' ? 2 : 0 }}
          >
            <div className="w-16 h-16 rounded-full bg-white border border-zinc-100 shadow-md flex items-center justify-center p-3 hover:scale-110 hover:shadow-lg hover:border-orange-500/30 transition-all duration-300 cursor-pointer">
              <img src={p.img} alt={p.name} className="w-full h-full object-contain rounded-full" />
            </div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{p.name}</span>
          </motion.div>
        ))}
      </div>

      {/* Right Side Platforms */}
      <div className="absolute inset-y-0 right-0 w-1/4 pointer-events-none hidden lg:block z-10">
        {rightPlatforms.map((p) => (
          <motion.div
            key={p.id}
            className="absolute pointer-events-auto flex flex-col items-center gap-2"
            style={{ top: p.top, right: p.right }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: p.id === 'threads' ? 1 : p.id === 'producthunt' ? 2 : 0 }}
          >
            <div className="w-16 h-16 rounded-full bg-white border border-zinc-100 shadow-md flex items-center justify-center p-3 hover:scale-110 hover:shadow-lg hover:border-orange-500/30 transition-all duration-300 cursor-pointer">
              <img src={p.img} alt={p.name} className="w-full h-full object-contain rounded-full" />
            </div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{p.name}</span>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-8 max-w-full">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-geist text-[10px] sm:text-xs font-bold tracking-wider text-zinc-600 uppercase text-center">
            Built for founders who love building, not marketing
          </span>
        </div>

        {/* H1 */}
        <h1 className="font-geist font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-zinc-900 leading-tight tracking-tight max-w-4xl mb-6">
          Get Users Without Becoming <br />
          <span className="text-orange-500">Full-Time Marketer.</span>
        </h1>

        {/* Subtext */}
        <p className="font-geist font-normal text-sm sm:text-base md:text-lg text-zinc-500 max-w-3xl leading-relaxed mb-10">
          Stop wasting hours figuring out what to post, where your users hang out, and why growth feels so hard. Vibe Promote helps you find buyers, sharpen positioning, create content that sounds human, and grow your SaaS without marketing becoming another full-time job.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 w-full max-w-lg">
          <form onSubmit={handleSubmit} className="relative group w-full mb-2" style={{ zIndex: 10 }}>
            <div className="absolute inset-0 bg-orange-500/5 blur-xl group-hover:bg-orange-500/10 transition-all opacity-50" />
            <div className="relative flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="url"
                  placeholder="https://your-awesome-saas.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:border-orange-500 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!url || url === 'https://'}
                className="px-6 py-3.5 rounded-xl bg-white text-zinc-900 border-2 border-orange-500 hover:bg-orange-50 hover:shadow-[0_4px_12px_rgba(249,115,22,0.15)] font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-orange-500" /> Start for free
              </button>
            </div>
          </form>

          <div className="flex gap-4 flex-wrap justify-center">
            <a href="#how-it-works"
              className="font-geist font-bold text-sm sm:text-base text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 px-8 py-3 rounded-xl transition-all duration-250"
            >
              See how it works
            </a>
          </div>
          
          {/* Trust points under the button */}
          <div className="flex gap-6 flex-wrap justify-center mt-4 text-xs sm:text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-orange-500 font-bold">✓</span> no credit card required
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-500 font-bold">✓</span> 100% private, no data to train models
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}