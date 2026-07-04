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
  Moon,
  Activity,
  CheckSquare,
  Square
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
  const [recentSignals, setRecentSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
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

        // Fetch 3 most recent audience signals
        const { data: signalsData } = await supabase
          .from('audience_signals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (signalsData) {
          setRecentSignals(signalsData);
        }

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Compute Marketing Health Score
  const baseScore = 5;
  const connectedBonus = stats.connectedChannels > 0 ? 1 : 0;
  const streakBonus = stats.consistencyStreak > 0 ? 1 : 0;
  const audienceBonus = stats.audiencesFound > 0 ? 1.5 : 0;
  const postBonus = stats.postsGenerated > 0 ? 1.5 : 0;
  const rawScore = baseScore + connectedBonus + streakBonus + audienceBonus + postBonus;
  const healthScore = Math.min(10, Math.round(rawScore * 10) / 10);
  const healthStatus = healthScore >= 7 ? "You're on track" : "A few things need attention";

  // Generate Checklist Items
  const checklistItems = [];
  if (stats.audiencesFound > 0) {
    checklistItems.push({
      id: 'reply',
      label: 'Reply to a founder in User Finder',
      path: '/audience-spotter'
    });
  }
  if (stats.postsGenerated < 3) {
    checklistItems.push({
      id: 'post',
      label: "Generate today's post",
      path: '/post-maker'
    });
  }
  if (stats.connectedChannels === 0) {
    checklistItems.push({
      id: 'connect',
      label: 'Connect a channel',
      path: '/connected-accounts'
    });
  }

  const toggleChecklist = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
              onClick={() => setShowGuide(true)}
              className="px-3 py-1.5 rounded-lg border border-foreground/10 text-foreground/70 text-xs font-bold hover:bg-foreground/5 transition-all bg-transparent"
            >
              Quick Tour
            </button>
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-8 max-w-4xl mx-auto w-full">

          {/* 1. Header Greeting */}
          <section className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {getGreeting()}, {user?.email?.split('@')[0]}
            </h2>
            <p className="text-sm text-foreground/60">Here is your marketing overview for today.</p>
          </section>

          {/* 2. Marketing Health Card */}
          <section className="rounded-2xl p-6 border border-orange-500/40 bg-foreground/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-lg bg-orange-500/10 text-orange-500 font-bold text-lg">
                  {healthScore}/10
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Marketing Health</h3>
                  <p className="text-xs text-foreground/60">{healthStatus}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/70">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {stats.postsGenerated} posts generated
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {stats.audiencesFound} opportunities found
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {stats.consistencyStreak}-day streak
                </span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/progress')}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              Track Your Progress
              <ArrowRight className="w-3 h-3" />
            </button>
          </section>

          {/* 3. Today's Opportunities */}
          <section className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Search className="w-4 h-4 text-orange-500" />
                🔥 People to talk to
              </h3>
            </div>
            {recentSignals.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {recentSignals.map((signal) => (
                    <div 
                      key={signal.id} 
                      className="flex items-start justify-between gap-4 p-4 rounded-xl bg-foreground/5 border border-foreground/5 hover:border-foreground/10 transition-all"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-orange-500">
                            {signal.platform === 'reddit' ? `r/${signal.subreddit}` : signal.subreddit || signal.platform || 'Community'}
                          </span>
                          <span className="text-[10px] text-foreground/40">•</span>
                          <span className="text-[10px] text-foreground/50 font-medium">Score: {signal.intent_score}%</span>
                        </div>
                        <h4 className="text-sm font-bold text-foreground truncate">
                          {signal.post_title}
                        </h4>
                        <p className="text-xs text-foreground/60 line-clamp-2 leading-relaxed">
                          {signal.post_body}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/audience-spotter?id=${signal.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all flex-shrink-0 self-center"
                      >
                        Reply
                      </button>
                    </div>
                  ))}
                </div>
                <div className="pt-2 text-right">
                  <Link 
                    to="/audience-spotter" 
                    className="text-xs font-bold text-orange-500 hover:underline inline-flex items-center gap-1"
                  >
                    View all {stats.audiencesFound} opportunities →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <p className="text-sm text-foreground/60">No new opportunities loaded yet — open User Finder to scan.</p>
                <button 
                  onClick={() => navigate('/audience-spotter')}
                  className="px-4 py-2 rounded-lg border border-foreground/10 text-foreground text-xs font-bold hover:bg-foreground/5 transition-all bg-transparent"
                >
                  Open User Finder
                </button>
              </div>
            )}
          </section>

          {/* 4. Content Opportunities */}
          <section className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <PenTool className="w-4 h-4 text-orange-500" />
                ✍️ What to post today
              </h3>
            </div>
            <div className="p-4 rounded-xl bg-foreground/5 border border-foreground/5 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-foreground">Generate today's post</h4>
                <p className="text-xs text-foreground/60 mt-1">Create highly engaging, platform-native posts tailored to your brand voice.</p>
              </div>
              <button 
                onClick={() => navigate('/post-maker')}
                className="px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all flex-shrink-0"
              >
                Generate
              </button>
            </div>
          </section>

          {/* 5. Momentum Section */}
          <section className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Momentum
            </h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground/5 border border-foreground/5 text-xs font-medium">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>{stats.consistencyStreak}-day posting streak</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground/5 border border-foreground/5 text-xs font-medium">
                <PenTool className="w-4 h-4 text-orange-500" />
                <span>{stats.postsGenerated} posts generated</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground/5 border border-foreground/5 text-xs font-medium">
                <Target className="w-4 h-4 text-orange-500" />
                <span>{stats.audiencesFound} opportunities found</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground/5 border border-foreground/5 text-xs font-medium">
                <Hash className="w-4 h-4 text-orange-500" />
                <span>{stats.connectedChannels} channels connected</span>
              </div>
            </div>
          </section>

          {/* 6. Today's Checklist */}
          {checklistItems.length > 0 && (
            <section className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-orange-500" />
                Today's Checklist
              </h3>
              <div className="space-y-3">
                {checklistItems.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-foreground/5 border border-foreground/5 hover:border-foreground/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleChecklist(item.id)}
                          className="text-orange-500 hover:text-orange-600 transition-colors bg-transparent p-0"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5 text-foreground/30" />
                          )}
                        </button>
                        <span className={cn("text-sm font-medium", isChecked && "line-through text-foreground/40")}>
                          {item.label}
                        </span>
                      </div>
                      {!isChecked && (
                        <button 
                          onClick={() => navigate(item.path)}
                          className="text-xs font-bold text-orange-500 hover:underline bg-transparent"
                        >
                          Go →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 7. What's New & App Update */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* New Update Section */}
            <div className="rounded-2xl p-5 border border-orange-500/20 bg-orange-500/[0.02] space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">New Update</h3>
              </div>
              <ul className="space-y-2 text-xs text-foreground/80 pl-1">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Add original reply context to make better replies in User Finder.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>X and Threads search is available now!</span>
                </li>
              </ul>
            </div>

            {/* App Update Section */}
            <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-5 flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                  Have an app update?
                </h3>
                <p className="text-xs text-foreground/70">Keep your brand brain up to date with the latest features.</p>
              </div>
              <button 
                onClick={() => navigate('/brand-brain')}
                className="w-full py-2 rounded-lg border border-foreground/10 text-foreground text-xs font-bold hover:bg-foreground/5 transition-all flex items-center justify-center gap-2 bg-transparent"
              >
                Update brand brain
                <ArrowRight className="w-3 h-3" />
              </button>
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