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
import Sidebar from '../components/Sidebar';
import AppGuide from '../components/AppGuide';

export default function Dashboard() {
  const { user, logout } = useAuth();
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
          <button 
            onClick={() => setShowGuide(true)}
            className="px-3 py-1.5 rounded-lg border border-foreground/10 text-foreground/70 text-xs font-bold hover:bg-foreground/5 transition-all bg-transparent"
          >
            Quick Tour
          </button>
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
              <Link to="/onboarding" className="text-[10px] font-bold text-foreground/70 hover:text-foreground transition-colors">
                Edit Brand Brain →
              </Link>
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

<dyad-write path="src/pages/BrandBrainView.jsx" description="Updating color classes in BrandBrainView.jsx to support light theme.">
"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import Sidebar from '../components/Sidebar';
import { 
  Brain, 
  RefreshCw, 
  Target, 
  Zap, 
  MessageSquare, 
  Sparkles, 
  Globe, 
  PenTool, 
  Activity,
  Tag,
  Edit2,
  Check,
  X,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

export default function BrandBrainView() {
  const { user } = useAuth();
  const [brain, setBrain] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showUpdateBox, setShowUpdateBox] = useState(false);
  const [updateText, setUpdateText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const { data: paymentData } = await supabase
          .from('user_payments')
          .select('payment_status')
          .eq('email', user.email)
          .maybeSingle();
        
        if (paymentData?.payment_status) {
          setIsPaid(true);
        }

        const { data, error } = await supabase
          .from('brand_brains')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          setBrain(data);
        } else if (!error) {
          navigate('/onboarding');
        }
      } catch (err) {
        console.error("Error fetching brand brain:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, navigate]);

  const handleSaveField = async (field) => {
    try {
      const { error } = await supabase
        .from('brand_brains')
        .update({ [field]: editValue })
        .eq('user_id', user.id);

      if (error) throw error;

      setBrain({ ...brain, [field]: editValue });
      setEditingField(null);
      toast.success(`${field.replace('_', ' ')} updated!`);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update field.");
    }
  };

  const handleSaveUpdate = async () => {
    if (!updateText.trim()) return;
    try {
      const { error } = await supabase
        .from('brand_brains')
        .update({ latest_update: updateText })
        .eq('user_id', user.id);

      if (error) throw error;

      setBrain({ ...brain, latest_update: updateText });
      setUpdateText("");
      setShowUpdateBox(false);
      toast.success("App update recorded!");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to save update. Make sure your database is updated.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  const InfoCard = ({ label, field, value, icon: Icon, isTags = false }) => {
    const isEditing = editingField === field;

    return (
      <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-6 space-y-4 relative group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
              <Icon className="w-4 h-4 text-foreground/60" />
            </div>
            <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">{label}</span>
          </div>
          {!isEditing && (
            <button 
              onClick={() => {
                setEditingField(field);
                setEditValue(value || "");
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-foreground/5 rounded-md transition-all bg-transparent"
            >
              <Edit2 className="w-3 h-3 text-foreground/60" />
            </button>
          )}
        </div>

        <div className="pl-1">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-background border border-orange-500/30 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-orange-500 transition-all resize-none min-h-[80px]"
              />
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => setEditingField(null)}
                  className="p-1.5 rounded-md hover:bg-foreground/5 text-foreground/60 transition-all bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleSaveField(field)}
                  className="p-1.5 rounded-md bg-orange-500 text-white transition-all"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : isTags ? (
            <div className="flex flex-wrap gap-2">
              {value?.split(',').map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-xs text-foreground/80">
                  {tag.trim()}
                </span>
              ))}
              {!value && <span className="text-xs text-foreground/60">Not set</span>}
            </div>
          ) : (
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {value || 'Not set'}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-foreground/5 bg-background flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-foreground">Brand Brain</h1>
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* Update Prompt */}
          <section className="rounded-2xl p-6 border border-foreground/5 bg-foreground/5 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">Have an App update?</h2>
                <p className="text-sm text-foreground/60">Keep your Brand Brain in sync with your latest features.</p>
              </div>
              <button 
                onClick={() => setShowUpdateBox(!showUpdateBox)}
                className="px-4 py-2 rounded-lg border border-orange-500 text-foreground text-xs font-bold hover:bg-orange-500/5 transition-all flex items-center gap-2 bg-transparent"
              >
                <Plus className="w-3 h-3" />
                Update brand brain
              </button>
            </div>

            {showUpdateBox && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
                <textarea
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="Describe your update (e.g. Added a new pricing tier, launched the mobile app...)"
                  className="w-full bg-background border border-foreground/10 rounded-xl p-4 text-sm text-foreground focus:outline-none focus:border-orange-500 transition-all resize-none min-h-[120px]"
                />
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setShowUpdateBox(false)}
                    className="px-4 py-2 text-xs font-bold text-foreground/60 hover:text-foreground transition-all bg-transparent"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveUpdate}
                    className="px-6 py-2 rounded-lg bg-orange-500 text-white text-xs font-bold transition-all"
                  >
                    Save Update
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Latest Update Box */}
          {brain?.latest_update && (
            <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 relative">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Latest Update</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                "{brain.latest_update}"
              </p>
            </section>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-1">
              <InfoCard label="App Name" field="app_name" value={brain?.app_name} icon={Sparkles} />
            </div>
            <div className="md:col-span-2">
              <InfoCard label="App Description" field="app_description" value={brain?.app_description} icon={MessageSquare} />
            </div>
            
            <InfoCard label="Target Audience" field="target_customer" value={brain?.target_customer} icon={Target} />
            <InfoCard label="Core Problem" field="core_problem" value={brain?.core_problem} icon={Activity} />
            <InfoCard label="Unique Advantage" field="unique_differentiator" value={brain?.unique_differentiator} icon={Zap} />

            <div className="md:col-span-2">
              <InfoCard label="Pain Phrases" field="pain_phrases" value={brain?.pain_phrases} icon={Tag} isTags={true} />
            </div>

            <InfoCard label="Brand Tone" field="brand_tone" value={brain?.brand_tone} icon={Brain} />
            <InfoCard label="Writing Style" field="writing_style" value={brain?.writing_style} icon={PenTool} />
            <InfoCard label="Primary Platforms" field="primary_platform" value={brain?.primary_platform} icon={Globe} isTags={true} />
            
            <div className="md:col-span-3">
              <InfoCard label="Primary Call to Action" field="primary_cta" value={brain?.primary_cta} icon={Zap} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}