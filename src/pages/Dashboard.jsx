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
  Clock,
  Calendar,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [isPaid, setIsPaid] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

        const { data: answers } = await supabase
          .from('user_answers')
          .select('question_id, answer')
          .eq('user_id', user.id);

        if (answers && answers.length > 0) {
          const mappedData = {
            role: answers.find(a => a.question_id === 2)?.answer || 'Not set',
            channels: answers.find(a => a.question_id === 4)?.answer || 'Not set',
            productType: answers.find(a => a.question_id === 5)?.answer || 'Not set',
            focus: answers.find(a => a.question_id === 6)?.answer || 'Not set',
            appInfo: answers.find(a => a.question_id === 1)?.answer || 'Not set'
          };
          setProfileData(mappedData);
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
    { icon: TrendingUp, label: 'Virality Finder', path: '#', available: false, comingSoon: true },
    { icon: MessageSquare, label: 'Agentic Helper', path: '#', available: false, comingSoon: true },
    { icon: Calendar, label: 'Auto Poster', path: '#', available: false, comingSoon: true },
  ];

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
              className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 transition-all"
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
                  "w-full flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all group",
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
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all",
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
            <button className="lg:hidden p-2 -ml-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold text-white">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {!isPaid && (
              <button 
                onClick={() => navigate('/pre-purchase')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-orange-500 text-white text-xs font-bold hover:bg-orange-500/5 transition-all"
              >
                <Zap className="w-3 h-3" />
                Unlock Full Access
              </button>
            )}
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="w-7 h-7 rounded-md bg-[#111111] border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                {user?.email?.substring(0, 2).toUpperCase()}
              </div>
            </div>
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
              className="px-4 py-2 rounded-lg border border-orange-500 text-white text-xs font-bold hover:bg-orange-500/5 transition-all flex items-center gap-2"
            >
              Start Audience finder
              <ArrowRight className="w-3 h-3" />
            </button>
          </section>

          {/* Your Profile Snapshot - Expanded */}
          <section className="bg-[#111111] border border-orange-500/40 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Your Profile
              </h3>
              <Link to="/survey" className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors">
                Retake Survey
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Stage', value: profileData?.focus },
                { label: 'Main Channel', value: profileData?.channels },
                { label: 'Product Type', value: profileData?.productType },
                { label: 'Role', value: profileData?.role },
              ].map((item, i) => (
                <div key={i} className="flex flex-col p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">{item.label}</span>
                  <span className="text-sm font-bold text-white">{item.value || 'Not set'}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Tools Grid */}
          <section className="space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-400" />
              AI Marketing Tools
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
                      "w-full py-2.5 rounded-lg text-xs font-bold transition-all border",
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
              <button className="text-[10px] text-gray-700 hover:text-white transition-colors">Support</button>
              <button className="text-[10px] text-gray-700 hover:text-white transition-colors">Feedback</button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}