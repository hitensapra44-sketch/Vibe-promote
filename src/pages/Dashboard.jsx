"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  PenTool, 
  LogOut,
  Sparkles,
  ArrowRight,
  Zap,
  Lock,
  CheckCircle2,
  Circle,
  Menu,
  X,
  User,
  Rocket,
  TrendingUp,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import GridBackground from "@/components/ui/grid-background";
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
    { icon: Search, label: 'Audience Spotter', path: '/audience-spotter', available: true },
    { icon: PenTool, label: 'Post Maker', path: '/post-maker', available: true },
    { icon: TrendingUp, label: 'Virality Finder', path: '#', available: false },
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
      name: 'Virality Finder', 
      desc: 'Analyze what makes posts go viral in your niche.', 
      available: false 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-white font-poppins flex relative overflow-hidden">
      <GridBackground />

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
        "fixed lg:static inset-y-0 left-0 bg-bg-surface/80 backdrop-blur-xl border-r border-border-muted z-50 transition-all duration-300",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        sidebarCollapsed ? "lg:w-20" : "lg:w-64"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-end">
            <button 
              className="p-2 rounded-lg hover:bg-white/5 text-text-secondary transition-all"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => link.available && navigate(link.path)}
                className={cn(
                  "w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  link.active 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-text-secondary hover:text-white hover:bg-white/5",
                  sidebarCollapsed ? "justify-center" : "justify-between"
                )}
              >
                <div className="flex items-center gap-3">
                  <link.icon className="w-4 h-4" />
                  {!sidebarCollapsed && link.label}
                </div>
                {!sidebarCollapsed && !link.available && <Lock className="w-3 h-3 opacity-40" />}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border-muted space-y-4">
            {!sidebarCollapsed && (
              <div className="px-4 py-2">
                <p className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest mb-1">Account</p>
                <p className="text-xs text-text-secondary truncate mb-2">{user?.email}</p>
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  isPaid ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                )}>
                  {isPaid ? (
                    <><CheckCircle2 className="w-3 h-3" /> Lifetime Access 🟢</>
                  ) : (
                    <><Lock className="w-3 h-3" /> Free Tier 🔒</>
                  )}
                </div>
              </div>
            )}
            
            <button 
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all",
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
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        {/* Zone 1: Header Bar */}
        <header className="h-16 sm:h-20 border-b border-border-muted bg-bg-base/50 backdrop-blur-md flex items-center justify-between px-6 sm:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {!isPaid && (
              <button 
                onClick={() => navigate('/pre-purchase')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-all shadow-lg shadow-primary/20"
              >
                <Zap className="w-4 h-4" />
                Unlock Full Access
              </button>
            )}
            <div className="flex items-center gap-3 pl-4 border-l border-border-muted">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-text-secondary">Founder</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-bg-elevated border border-border-muted flex items-center justify-center text-sm font-bold text-primary">
                {user?.email?.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto w-full">
          {/* Zone 2: Welcome Banner */}
          <section className={cn(
            "relative rounded-3xl p-8 overflow-hidden border border-primary/30 bg-transparent"
          )}>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Welcome, {user?.email?.split('@')[0]}
              </h2>
              <p className="text-text-secondary">Your marketing co-pilot is ready</p>
              {!isPaid && (
                <p className="mt-4 text-amber-500 text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  You're on free tier.
                </p>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Zone 4: Your Profile Snapshot */}
            <section className="bg-transparent border border-primary/30 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Your Marketing Profile
                  </h3>
                  <Link to="/survey" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    Retake Survey
                  </Link>
                </div>
                
                <div className="space-y-6">
                  {[
                    { label: 'Stage', value: profileData?.focus },
                    { label: 'Main Channel', value: profileData?.channels },
                    { label: 'Product Type', value: profileData?.productType },
                    { label: 'Role', value: profileData?.role },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <span className="text-sm text-text-secondary">{item.label}</span>
                      <span className="text-sm font-bold text-white">{item.value || 'Not set'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Zone 5: Onboarding Checklist */}
            <section className="bg-transparent border border-primary/30 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-primary" />
                    Getting Started
                  </h3>
                  <span className="text-xs font-bold text-text-secondary/60">
                    {profileData ? (isPaid ? '4 of 5' : '3 of 5') : '1 of 5'} steps complete
                  </span>
                </div>

                <div className="w-full h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: profileData ? (isPaid ? '80%' : '60%') : '20%' }} 
                  />
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Joined the waitlist', done: true },
                    { label: 'Completed the survey', done: !!profileData },
                    { label: 'Created your account', done: true },
                    { label: 'Unlock lifetime access', done: isPaid, highlight: !isPaid },
                    { label: 'Run your first tool', done: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.done ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className={cn("w-5 h-5", item.highlight ? "text-amber-500" : "text-text-secondary/20")} />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        item.done ? "text-text-secondary line-through" : "text-white",
                        item.highlight && "text-amber-500"
                      )}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Zone 6: AI Tools Grid */}
          <section className="space-y-8">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Your AI Marketing Tools
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <div 
                  key={tool.id} 
                  className={cn(
                    "group relative p-6 rounded-3xl border transition-all duration-300 bg-transparent border-primary/30 hover:border-primary hover:-translate-y-1 overflow-hidden"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 pointer-events-none" />
                  
                  {/* Lock Overlay for Unpaid */}
                  {!isPaid && tool.available && (
                    <div className="absolute inset-0 z-10 bg-bg-base/40 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
                        <Lock className="w-5 h-5 text-amber-500" />
                      </div>
                      <p className="text-xs font-bold text-white mb-1">Locked</p>
                      <p className="text-[10px] text-text-secondary">Purchase lifetime access to unlock</p>
                    </div>
                  )}

                  <div className="relative z-0">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center mb-4",
                      tool.available ? "bg-primary/10 text-primary" : "bg-white/5 text-text-secondary/40"
                    )}>
                      <tool.icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white">{tool.name}</h4>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                        tool.available ? "bg-green-500/10 text-green-500" : "bg-white/5 text-text-secondary/40"
                      )}>
                        {tool.available ? 'Available' : 'Coming Soon'}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                      {tool.desc}
                    </p>
                    <button
                      disabled={!tool.available}
                      onClick={() => isPaid ? navigate(tool.path) : navigate('/pre-purchase')}
                      className={cn(
                        "w-full py-3 rounded-xl text-sm font-bold transition-all",
                        tool.available 
                          ? "bg-primary/10 text-primary hover:bg-primary hover:text-white" 
                          : "bg-white/5 text-text-secondary/40 cursor-not-allowed"
                      )}
                    >
                      {!tool.available ? 'Coming Soon' : (isPaid ? 'Open Tool' : 'Unlock to Access')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Zone 7: Recent Activity Feed */}
          <section className="bg-transparent border border-primary/30 rounded-3xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-8 text-left">Recent Activity</h3>
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-text-secondary/20" />
                </div>
                <p className="text-text-secondary font-medium">No activity yet.</p>
                <p className="text-sm text-text-secondary/60">Open a tool above to get started.</p>
              </div>
            </div>
          </section>

          {/* Zone 8: Bottom Footer Strip */}
          <footer className="pt-10 pb-6 border-t border-border-muted flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-secondary/40 font-medium">
              Vibe Promote © 2026
            </p>
            <div className="flex items-center gap-6">
              <button className="text-xs text-text-secondary/60 hover:text-white transition-colors">Support</button>
              <button className="text-xs text-text-secondary/60 hover:text-white transition-colors">Give Feedback</button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}