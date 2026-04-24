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
  Lock,
  CheckCircle2,
  Circle,
  Menu,
  X,
  User,
  Rocket,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Settings
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
            role: answers.find(a => a.question_id === 2)?.answer || '—',
            channels: answers.find(a => a.question_id === 4)?.answer || '—',
            productType: answers.find(a => a.question_id === 5)?.answer || '—',
            focus: answers.find(a => a.question_id === 6)?.answer || '—',
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
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: true, available: true },
    { icon: Search, label: 'Audience Spotter', path: '/audience-spotter', available: true },
    { icon: PenTool, label: 'Post Maker', path: '/post-maker', available: true },
    { icon: TrendingUp, label: 'Viral Post Analyzer', path: '#', available: false },
    { icon: Settings, label: 'Settings', path: '#', available: true },
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
      id: 'viral', 
      icon: TrendingUp, 
      name: 'Viral Post Analyzer', 
      desc: 'Analyze what makes posts go viral in your niche.', 
      available: false 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] font-poppins flex relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 bg-[#111111] border-r border-[#1F1F1F] z-50 transition-all duration-300",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        sidebarCollapsed ? "lg:w-20" : "lg:w-[220px]"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            {!sidebarCollapsed && (
              <Link to="/" className="flex items-center gap-2 group">
                <Sparkles className="w-4 h-4 text-[#F97316]" />
                <span className="text-[#FAFAFA] font-semibold text-lg tracking-tight">Vibe Hype</span>
              </Link>
            )}
            {sidebarCollapsed && (
              <Sparkles className="w-5 h-5 text-[#F97316] mx-auto" />
            )}
            <button className="lg:hidden" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-5 h-5 text-[#71717A]" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => link.available && navigate(link.path)}
                className={cn(
                  "w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all group",
                  link.active 
                    ? "bg-[#1A1A1A] text-[#FAFAFA] border-l-2 border-[#F97316] rounded-l-none" 
                    : "text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#161616]",
                  sidebarCollapsed ? "justify-center" : "justify-between"
                )}
              >
                <div className="flex items-center gap-3">
                  <link.icon className={cn("w-4 h-4", link.active ? "text-[#FAFAFA]" : "text-[#71717A]")} />
                  {!sidebarCollapsed && link.label}
                </div>
                {!sidebarCollapsed && !link.available && <Lock className="w-3 h-3 text-[#3F3F46]" />}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-[#1F1F1F] space-y-4">
            {!sidebarCollapsed && (
              <div className="px-2">
                <p className="text-[12px] text-[#71717A] truncate">{user?.email}</p>
                <div className={cn(
                  "mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  isPaid ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#1F1F1F] text-[#71717A] border-[#2F2F2F]"
                )}>
                  {isPaid ? "Lifetime Access" : "Free Preview"}
                </div>
              </div>
            )}
            
            <button 
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[#71717A] hover:text-[#FAFAFA] transition-all",
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
        <header className="h-16 sm:h-20 border-b border-[#1F1F1F] flex items-center justify-between px-8 sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-[#FAFAFA]">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {!isPaid && (
              <button 
                onClick={() => navigate('/pre-purchase')}
                className="px-3 py-1.5 rounded-md border border-[#F97316] text-[#F97316] text-[12px] font-medium hover:bg-[#F97316]/5 transition-all"
              >
                Upgrade
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-[#1F1F1F] border border-[#2F2F2F] flex items-center justify-center text-[12px] font-medium text-[#FAFAFA]">
              {user?.email?.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-10 max-w-6xl mx-auto w-full">
          <section>
            <h2 className="text-2xl font-semibold text-[#FAFAFA]">Good morning, {user?.email?.split('@')[0]}.</h2>
            <p className="text-[#71717A] text-sm mt-1">Here's where your marketing stands today.</p>
            {!isPaid && (
              <div className="mt-4 flex items-center gap-2 text-[#F59E0B] text-[13px]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                Free preview — 2 tools locked
              </div>
            )}
          </section>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'ACCOUNT STATUS', value: isPaid ? 'Lifetime Access ✓' : 'Free Preview' },
              { label: 'TOOLS UNLOCKED', value: isPaid ? '6 of 6' : '1 of 6' },
              { label: 'SURVEY', value: profileData ? 'Completed' : 'Pending' },
              { label: 'MEMBER SINCE', value: new Date(user?.created_at).toLocaleDateString() },
            ].map((stat, i) => (
              <div key={i} className="bg-[#141414] border border-[#1F1F1F] rounded-lg p-4 px-5">
                <p className="text-[11px] font-medium text-[#71717A] uppercase tracking-[0.08em]">{stat.label}</p>
                <p className="text-base font-medium text-[#FAFAFA] mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Profile Card */}
            <section className="bg-[#141414] border border-[#1F1F1F] rounded-lg p-6">
              <h3 className="text-[11px] font-medium text-[#71717A] uppercase tracking-[0.08em] mb-6">MARKETING PROFILE</h3>
              <div className="space-y-0">
                {[
                  { label: 'Stage', value: profileData?.focus },
                  { label: 'Main Channel', value: profileData?.channels },
                  { label: 'Product Type', value: profileData?.productType },
                  { label: 'Role', value: profileData?.role },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-[#1F1F1F] last:border-0">
                    <span className="text-sm text-[#71717A]">{item.label}</span>
                    <span className="text-sm font-medium text-[#FAFAFA]">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Checklist Card */}
            <section className="bg-[#141414] border border-[#1F1F1F] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-medium text-[#71717A] uppercase tracking-[0.08em]">GETTING STARTED</h3>
                <span className="text-[12px] text-[#71717A]">
                  {profileData ? (isPaid ? '4 of 5' : '3 of 5') : '1 of 5'} complete
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Joined the waitlist', done: true },
                  { label: 'Completed the survey', done: !!profileData },
                  { label: 'Created your account', done: true },
                  { label: 'Unlock lifetime access', done: isPaid, current: !isPaid },
                  { label: 'Run your first tool', done: false, future: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                    ) : (
                      <Circle className={cn("w-4 h-4", item.current ? "text-[#F97316]" : "text-[#3F3F46]")} />
                    )}
                    <span className={cn(
                      "text-sm",
                      item.done ? "text-[#71717A] line-through" : item.current ? "text-[#FAFAFA] font-medium" : "text-[#52525B]"
                    )}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* AI Tools Grid */}
          <section className="space-y-6">
            <h3 className="text-[11px] font-medium text-[#71717A] uppercase tracking-[0.08em]">AI MARKETING TOOLS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tools.map((tool) => (
                <div 
                  key={tool.id} 
                  className="group bg-[#141414] border border-[#1F1F1F] rounded-lg p-5 flex flex-col hover:bg-[#161616] hover:border-[#2F2F2F] transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <tool.icon className="w-4 h-4 text-[#71717A]" />
                    <span className={cn(
                      "text-[10px] font-medium uppercase tracking-widest",
                      tool.available ? "text-[#22C55E]" : "text-[#3F3F46]"
                    )}>
                      {tool.available ? 'AVAILABLE' : 'COMING SOON'}
                    </span>
                  </div>
                  <h4 className="text-[15px] font-semibold text-[#FAFAFA] flex items-center gap-2">
                    {tool.name}
                    {!isPaid && tool.available && <Lock className="w-3 h-3 text-[#3F3F46]" />}
                  </h4>
                  <p className="text-[13px] text-[#71717A] mt-1 mb-6 line-clamp-2">
                    {tool.desc}
                  </p>
                  <button
                    disabled={!tool.available}
                    onClick={() => isPaid ? navigate(tool.path) : navigate('/pre-purchase')}
                    className={cn(
                      "w-full py-2 rounded-md text-sm font-medium transition-all mt-auto",
                      !tool.available 
                        ? "bg-[#111111] border border-[#1F1F1F] text-[#3F3F46] cursor-not-allowed"
                        : isPaid 
                          ? "bg-[#1F1F1F] border border-[#2F2F2F] text-[#FAFAFA] hover:bg-[#2F2F2F]" 
                          : "bg-transparent border border-[#2A1F14] text-[#F97316] hover:bg-[#F97316]/5"
                    )}
                  >
                    {!tool.available ? 'Coming Soon' : (isPaid ? 'Open Tool' : 'Unlock to Access')}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <h3 className="text-[11px] font-medium text-[#71717A] uppercase tracking-[0.08em] mb-4">RECENT ACTIVITY</h3>
            <div className="h-20 flex items-center justify-center border border-[#1F1F1F] rounded-lg bg-transparent">
              <p className="text-[14px] text-[#52525B]">No activity yet. Open a tool to get started.</p>
            </div>
          </section>

          <footer className="pt-10 pb-6 border-t border-[#1F1F1F] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-[#71717A]">Vibe Hype © 2026</p>
            <div className="flex items-center gap-6">
              <button className="text-[12px] text-[#71717A] hover:text-[#FAFAFA] transition-colors">Support</button>
              <button className="text-[12px] text-[#71717A] hover:text-[#FAFAFA] transition-colors">Feedback</button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}