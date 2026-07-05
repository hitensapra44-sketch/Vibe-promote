"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  PenTool, 
  Sparkles,
  ArrowRight,
  Flame,
  Target,
  CheckSquare,
  Square,
  AlertCircle,
  Lock,
  CheckCircle2,
  Activity,
  Settings,
  MessageSquare,
  Globe
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const [isPaid, setIsPaid] = useState(false);
  const [brain, setBrain] = useState(null);
  const [stats, setStats] = useState({
    postsGenerated: 0,
    audiencesFound: 0,
    connectedChannels: 0,
    consistencyStreak: 0,
  });
  const [recentSignals, setRecentSignals] = useState([]);
  const [todayPostCount, setTodayPostCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [hasReplied, setHasReplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // 1. Payment status
        const { data: paymentData } = await supabase
          .from('user_payments')
          .select('payment_status')
          .eq('email', user.email)
          .maybeSingle();
        
        if (paymentData?.payment_status) setIsPaid(true);

        // 2. Fetch Brand Brain
        const { data: brainData } = await supabase
          .from('brand_brains')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (brainData) setBrain(brainData);

        // 3. Fetch counts
        const { count: postCount } = await supabase
          .from('social_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: channelCount } = await supabase
          .from('social_accounts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: audienceCount } = await supabase
          .from('audience_signals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // 4. Fetch 3 most recent audience signals
        const { data: signalsData } = await supabase
          .from('audience_signals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        if (signalsData) setRecentSignals(signalsData);

        // 5. Check if any replies have happened
        const { count: repliedCount } = await supabase
          .from('audience_signals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .neq('status', 'new');
        setHasReplied((repliedCount || 0) > 0);

        // 6. Check if today's post is generated
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { count: todayPosts } = await supabase
          .from('social_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', todayStart.toISOString());
        setTodayPostCount(todayPosts || 0);

        // 7. Fetch streak from user_progress
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

        // 8. Derive Recent Activity
        const activityList = [];

        // Latest social post
        const { data: latestPost } = await supabase
          .from('social_posts')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (latestPost) {
          activityList.push({
            type: 'post',
            label: 'Post generated',
            timestamp: new Date(latestPost.created_at)
          });
        }

        // Latest audience signal
        const { data: latestSignal } = await supabase
          .from('audience_signals')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (latestSignal) {
          activityList.push({
            type: 'signal',
            label: 'Opportunity found',
            timestamp: new Date(latestSignal.created_at)
          });
        }

        // Latest social account connection
        const { data: latestAccount } = await supabase
          .from('social_accounts')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (latestAccount) {
          activityList.push({
            type: 'account',
            label: 'Account connected',
            timestamp: new Date(latestAccount.created_at)
          });
        }

        // Brand Brain creation
        if (brainData && brainData.created_at) {
          activityList.push({
            type: 'brain',
            label: 'Brand Brain updated',
            timestamp: new Date(brainData.created_at)
          });
        }

        // Sort by recency
        activityList.sort((a, b) => b.timestamp - a.timestamp);
        setRecentActivity(activityList.slice(0, 4));

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
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Scoring Heuristic
  const baseScore = 5;
  const connectedBonus = stats.connectedChannels > 0 ? 1 : 0;
  const streakBonus = stats.consistencyStreak > 0 ? 1 : 0;
  const audienceBonus = stats.audiencesFound > 0 ? 1.5 : 0;
  const postBonus = stats.postsGenerated > 0 ? 1.5 : 0;
  const rawScore = baseScore + connectedBonus + streakBonus + audienceBonus + postBonus;
  const healthScore = Math.min(10, Math.round(rawScore * 10) / 10);

  // Checklist Items
  const checklistItems = [];
  if (stats.audiencesFound > 0) {
    checklistItems.push({
      id: 'reply',
      label: 'Reply to a founder',
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

  // Dynamic Alert Conditions
  const isBrainStale = brain && brain.created_at && (new Date() - new Date(brain.created_at) > 60 * 24 * 60 * 60 * 1000);
  const hasNoChannels = stats.connectedChannels === 0;
  const hasPendingReplies = stats.audiencesFound > 0 && !hasReplied;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-foreground/5 bg-background flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-foreground">Dashboard</h1>
          </div>
          <Link 
            to="/brand-brain" 
            className="text-xs font-bold text-foreground/60 hover:text-foreground transition-colors"
          >
            Update Brand Brain
          </Link>
        </header>

        <div className="p-6 sm:p-8 space-y-8 max-w-4xl mx-auto w-full pb-24">

          {/* 10. Dynamic Alerts */}
          <AnimatePresence>
            {(isBrainStale || hasNoChannels || hasPendingReplies) && (
              <div className="space-y-3">
                {isBrainStale && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-yellow-600 text-xs font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Your Brand Brain hasn't been updated recently.</span>
                    </div>
                    <Link to="/brand-brain" className="font-bold hover:underline">Update now</Link>
                  </motion.div>
                )}
                {hasNoChannels && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 text-xs font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>No channel connected yet.</span>
                    </div>
                    <Link to="/connected-accounts" className="font-bold hover:underline">Connect channel</Link>
                  </motion.div>
                )}
                {hasPendingReplies && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 text-orange-500 text-xs font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>You have pending opportunities waiting for a reply.</span>
                    </div>
                    <Link to="/audience-spotter" className="font-bold hover:underline">View opportunities</Link>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>

          {/* 1. Greeting */}
          <section className="py-2">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {getGreeting()}, {user?.email?.split('@')[0]}
            </h2>
          </section>

          {/* 2. Marketing Health */}
          <section className="rounded-2xl p-6 border border-orange-500/40 bg-foreground/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-lg bg-orange-500/10 text-orange-500 font-bold text-lg">
                  {healthScore}/10
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Marketing Health</h3>
                  {healthScore < 7 ? (
                    <p className="text-xs text-red-500 font-medium">
                      {stats.connectedChannels === 0 ? "No channels connected yet" : "Consistency streak is flat"}
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 font-medium">Your marketing is on track</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/70">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {stats.postsGenerated} posts generated
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {stats.connectedChannels} channels connected
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

          {/* 3. People To Talk To */}
          <section className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">People to talk to</h3>
            </div>

            {!isPaid ? (
              /* Locked/Preview State for Unpaid Users */
              <div className="relative rounded-xl overflow-hidden border border-foreground/10 p-8 text-center space-y-4 bg-foreground/5">
                <div className="absolute inset-0 bg-background/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6">
                  <Lock className="w-8 h-8 text-orange-500 mb-3" />
                  <h4 className="text-sm font-bold text-foreground mb-1">Unlock high-intent buyer leads</h4>
                  <p className="text-xs text-foreground/60 max-w-xs mb-4">Upgrade to Pro to view and reply to real-time opportunities scanned from communities.</p>
                  <button 
                    onClick={() => navigate('/pricing')}
                    className="px-6 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-lg shadow-orange-500/20"
                  >
                    Unlock Access
                  </button>
                </div>
                <div className="space-y-3 opacity-20 select-none pointer-events-none">
                  <div className="p-4 rounded-xl bg-foreground/5 border border-foreground/5 flex justify-between">
                    <div className="text-left">
                      <span className="text-xs font-bold text-orange-500">r/SaaS</span>
                      <h4 className="text-sm font-bold text-foreground">Looking for a marketing tool...</h4>
                    </div>
                  </div>
                </div>
              </div>
            ) : recentSignals.length > 0 ? (
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
              <div className="py-8 text-center space-y-4">
                <p className="text-sm text-foreground/60">No opportunities scanned yet.</p>
                <button 
                  onClick={() => navigate('/audience-spotter')}
                  className="px-4 py-2 rounded-lg border border-foreground/10 text-foreground text-xs font-bold hover:bg-foreground/5 transition-all bg-transparent"
                >
                  Open User Finder
                </button>
              </div>
            )}
          </section>

          {/* 4. What To Post Today */}
          <section className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">What to post today</h3>
            </div>
            {todayPostCount > 0 ? (
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-green-600">Today's post is generated</h4>
                  <p className="text-xs text-foreground/60 mt-1">You have successfully generated a post for today. Keep up the consistency!</p>
                </div>
                <button 
                  onClick={() => navigate('/dashboard/results-tracker')}
                  className="px-4 py-2.5 rounded-lg border border-foreground/10 text-foreground text-xs font-bold hover:bg-foreground/5 transition-all bg-transparent"
                >
                  View Analytics
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-foreground/5 border border-foreground/5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground">You haven't generated today's post yet</h4>
                  <p className="text-xs text-foreground/60 mt-1">Create highly engaging, platform-native posts tailored to your brand voice.</p>
                </div>
                <button 
                  onClick={() => navigate('/post-maker')}
                  className="px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all flex-shrink-0"
                >
                  Generate
                </button>
              </div>
            )}
          </section>

          {/* 5. Analytics Summary */}
          <section className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Analytics Summary</h3>
            {hasNoChannels ? (
              <div className="py-6 text-center space-y-4">
                <p className="text-sm text-foreground/60">Connecting accounts unlocks performance tracking across your channels.</p>
                <button 
                  onClick={() => navigate('/connected-accounts')}
                  className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all"
                >
                  Connect Accounts
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background border border-foreground/10 rounded-xl p-5">
                  <span className="text-xs font-bold text-foreground/50 uppercase tracking-widest block mb-1">Total Posts</span>
                  <span className="text-2xl font-bold text-foreground">{stats.postsGenerated}</span>
                </div>
                <div className="bg-background border border-foreground/10 rounded-xl p-5">
                  <span className="text-xs font-bold text-foreground/50 uppercase tracking-widest block mb-1">Opportunities Found</span>
                  <span className="text-2xl font-bold text-foreground">{stats.audiencesFound}</span>
                </div>
              </div>
            )}
          </section>

          {/* 6. Today's Checklist */}
          {checklistItems.length > 0 && (
            <section className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground">Today's Checklist</h3>
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

          {/* 7. Recent Activity */}
          <section className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-foreground/5 last:border-none">
                    <span className="text-foreground/80 font-medium">{act.label}</span>
                    <span className="text-xs text-foreground/40">{formatRelativeTime(act.timestamp)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground/60 text-center py-4">
                No activity yet. Generate your first post or run a scan to get started.
              </p>
            )}
          </section>

          {/* 8. What's New */}
          <section className="rounded-2xl p-5 border border-orange-500/20 bg-orange-500/[0.02] space-y-2 max-w-md mx-auto sm:mx-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-wider">What's New</h3>
            </div>
            <ul className="space-y-1.5 text-[11px] text-foreground/80 pl-1">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Add original reply context to make better replies in User Finder.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>X and Threads search is available now!</span>
              </li>
            </ul>
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