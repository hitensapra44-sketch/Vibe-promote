"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  MessageSquare, 
  Loader2, 
  Sparkles,
  X,
  Check,
  Zap,
  Copy,
  Plus,
  ArrowRight,
  ArrowLeft,
  Globe,
  Twitter,
  Settings,
  RefreshCw,
  ExternalLink,
  Trash2,
  Clock,
  Brain,
  Bell,
  Volume2,
  AlertCircle,
  Lock,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { generateAICall } from '../lib/ai';
import { useAudienceSpotter } from '../hooks/useAudienceSpotter';
import moment from 'moment';
import { usePlan } from '../lib/usePlan';
import { useUsage, incrementUsage } from '../lib/useUsage';
import { markTaskComplete } from '../components/TaskWidget';
import { Link, useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 1, name: 'Platforms' },
  { id: 2, name: 'Communities' },
  { id: 3, name: 'Keywords' },
  { id: 4, name: 'Review' }
];

const PLATFORMS = [
  { id: 'reddit', name: 'Reddit', icon: MessageSquare, color: '#FF4500', available: true },
  { id: 'hn', name: 'Hacker News', icon: Globe, color: '#FF6600', available: true },
  { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: '#1DA1F2', available: false, comingSoon: true },
  { id: 'bluesky', name: 'Bluesky', icon: Globe, color: '#0560ff', available: false, comingSoon: true },
];

const DISMISS_REASONS = [
  { id: 'bad_post', label: 'Bad post' },
  { id: 'bad_subreddit', label: 'Bad subreddit' },
  { id: 'bad_reply', label: 'Bad reply' },
  { id: 'dont_know', label: "Don't know, just don't feel like a good post" }
];

export default function AudienceSpotter() {
  const { user, plan } = useAuth();
  const { limits } = usePlan();
  const { used: scansUsed } = useUsage('user_finder');
  const [step, setStep] = useState(1);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('Platforms');
  const [brain, setBrain] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(1);
  const navigate = useNavigate();
  
  const [selectedPlatforms, setSelectedPlatforms] = useState(['reddit']);
  const [communities, setCommunities] = useState([]);
  const [newCommunity, setNewCommunity] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');

  const [dismissingId, setDismissingId] = useState(null);
  const [dismissReason, setDismissReason] = useState(null);

  const { signals, isLoading, startScan, updateSignalStatus } = useAudienceSpotter(user?.id);

  const isLocked = limits.userFinder !== "unlimited" && scansUsed >= limits.userFinder;

  // Filter out signals that are not 'new'
  const activeSignals = useMemo(() => signals.filter(s => s.status === 'new'), [signals]);

  const skipSubreddits = useMemo(() => {
    return selectedPlatforms.includes('hn') && !selectedPlatforms.includes('reddit');
  }, [selectedPlatforms]);

  const filteredSteps = useMemo(() => {
    if (skipSubreddits) return STEPS.filter(s => s.id !== 2);
    return STEPS;
  }, [skipSubreddits]);

  useEffect(() => {
    async function init() {
      if (!user) return;
      try {
        const { data: brainData } = await supabase.from('brand_brains').select('*').eq('user_id', user.id).maybeSingle();
        const { count } = await supabase.from('audience_signals').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        const savedConfig = localStorage.getItem('vh_audience_config');
        
        if (brainData) {
          setBrain(brainData);
          
          // Autofill logic for new users
          if (count === 0 && !savedConfig) {
            // Suggest keywords from pain phrases or core problem (up to 15)
            const suggestedKeywords = brainData.pain_phrases 
              ? brainData.pain_phrases.split(',').map(k => k.trim()).filter(Boolean)
              : [brainData.core_problem].filter(Boolean);
            setKeywords(suggestedKeywords.slice(0, 15));

            // Suggest 10 high-traffic communities
            setCommunities([
              'SaaS', 
              'startups', 
              'indiehackers', 
              'SideProject', 
              'entrepreneur', 
              'GrowthHacking', 
              'marketing', 
              'Business', 
              'smallbusiness', 
              'solopreneur'
            ]);
          }
        }

        if (count > 0) {
          setIsConfigured(true);
          if (brainData?.audience_keywords) setKeywords(JSON.parse(brainData.audience_keywords));
          if (brainData?.audience_platforms) setSelectedPlatforms(JSON.parse(brainData.audience_platforms));
          if (brainData?.audience_communities) setCommunities(JSON.parse(brainData.audience_communities));
        } else if (savedConfig) {
          const config = JSON.parse(savedConfig);
          if (config.isScanning) {
            setIsConfigured(true);
            setKeywords(config.keywords);
            setSelectedPlatforms(config.platforms);
            setCommunities(config.communities);
            startScan({ keywords: config.keywords, platforms: config.platforms, communities: config.communities });
          }
        }

        // Fetch current day
        const { data: tasksData } = await supabase
          .from('user_tasks')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1);
        if (tasksData && tasksData[0]) {
          const firstDate = new Date(tasksData[0].created_at);
          firstDate.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const diffTime = Math.abs(today.getTime() - firstDate.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          setCurrentDay(Math.min(4, diffDays + 1));
        }
      } finally {
        setIsInitialLoading(false);
      }
    }
    init();
  }, [user]);

  const handleCreateSignal = async () => {
    if (limits.userFinder !== "unlimited" && scansUsed >= limits.userFinder) {
      toast.error(`You've used all ${limits.userFinder} scans this month. Upgrade to get more.`);
      return;
    }
    if (keywords.length === 0) {
      toast.error("Add at least one keyword first");
      return;
    }
    setIsConfigured(true);
    startScan({ keywords, platforms: selectedPlatforms, communities });
    await incrementUsage(supabase, user.id, 'user_finder');
    markTaskComplete(user.id, 'run_user_finder', supabase);
  };

  const addCommunity = () => {
    if (newCommunity && !communities.includes(newCommunity)) {
      setCommunities([...communities, newCommunity.replace('r/', '').trim()]);
      setNewCommunity('');
    }
  };

  const addKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleNext = () => {
    if (step === 1 && skipSubreddits) {
      setStep(3);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 3 && skipSubreddits) {
      setStep(1);
    } else {
      setStep(step - 1);
    }
  };

  const handleDismiss = (id) => {
    setDismissingId(id);
    setDismissReason(null);
  };

  const confirmDismiss = () => {
    if (!dismissReason) return;
    updateSignalStatus({ id: dismissingId, status: 'dismissed' });
    setDismissingId(null);
    setDismissReason(null);
    toast.success("Post removed. We'll use this feedback to improve.");
  };

  if (isInitialLoading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  if (showSettings) {
    const tabs = ['Platforms', 'Monitoring', 'Reply Voice', 'Product', 'Notifications'];
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
        <Sidebar isPaid={true} />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8 sm:p-12">
          <div className="max-w-5xl mx-auto w-full">
            <button onClick={() => setShowSettings(false)} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 bg-transparent">
              <ArrowLeft className="w-4 h-4" /> Back to User Finder
            </button>

            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                <Settings className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Signal Settings</h1>
                <p className="text-zinc-500 text-sm">Configure how we monitor the internet for buying signals.</p>
              </div>
            </div>

            <div className="flex gap-8 border-b border-white/5 mb-10">
              {tabs.map(t => (
                <button
                  key={t}
                  onClick={() => setSettingsTab(t)}
                  className={cn(
                    "pb-4 text-sm font-bold transition-all bg-transparent relative",
                    settingsTab === t ? "text-primary" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {t}
                  {settingsTab === t && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
              ))}
            </div>

            <div className="animate-in fade-in duration-500">
              {settingsTab === 'Platforms' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Where should we listen?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PLATFORMS.map(p => (
                      <div key={p.id} className={cn("p-8 rounded-2xl border transition-all flex flex-col items-center gap-4 text-center", p.available ? "border-zinc-800 bg-zinc-900/40" : "opacity-40 border-zinc-900 bg-zinc-900/20")}>
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                          <p.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-sm">{p.name}</span>
                        {!p.available && <span className="text-[10px] font-bold text-primary uppercase">Pro</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab === 'Monitoring' && (
                <div className="space-y-12">
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold">Keywords</h2>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="e.g. email outreach"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all"
                      />
                      <button onClick={addKeyword} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all bg-transparent">
                        <Plus className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((k, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                          {k}
                          <button onClick={() => setKeywords(keywords.filter((_, idx) => idx !== i))} className="hover:text-white transition-colors bg-transparent p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h2 className="text-xl font-bold">Communities</h2>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="e.g. SaaS or r/startups"
                        value={newCommunity}
                        onChange={(e) => setNewCommunity(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCommunity()}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all"
                      />
                      <button onClick={addCommunity} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all bg-transparent">
                        <Plus className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {communities.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 border border-white/5 text-zinc-300 text-xs font-bold">
                          r/{c}
                          <button onClick={() => setCommunities(communities.filter((_, idx) => idx !== i))} className="hover:text-white transition-colors bg-transparent p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'Product' && (
                <div className="space-y-8">
                  <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{brain?.app_name}</h3>
                        <p className="text-zinc-500 text-sm">Using your Brand Brain for filtering.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Description</p>
                        <p className="text-sm text-zinc-300">{brain?.app_description}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Target Audience</p>
                        <p className="text-sm text-zinc-300">{brain?.target_customer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(settingsTab === 'Reply Voice' || settingsTab === 'Notifications') && (
                <div className="py-20 text-center">
                  <p className="text-zinc-500">Coming soon in the next update.</p>
                </div>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => {
                  handleCreateSignal();
                  setShowSettings(false);
                }}
                className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-lg shadow-primary/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
        <Sidebar isPaid={true} />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8 sm:p-12">
          <div className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row gap-16">
            <div className="lg:w-48 flex flex-col gap-8 pt-8">
              <div className="relative flex flex-col gap-10">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-zinc-800" />
                {filteredSteps.map((s, idx) => (
                  <div key={s.id} className="relative flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all border-2",
                      step === s.id ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : 
                      step > s.id ? "bg-primary border-primary text-white" : "bg-[#0A0A0A] border-zinc-800 text-zinc-500"
                    )}>
                      {step > s.id ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      step === s.id ? "text-white" : "text-zinc-500"
                    )}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div>
                      <h1 className="text-4xl font-bold mb-4">Where should we listen?</h1>
                      <p className="text-zinc-500">Select the platforms to monitor for buying signals.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {PLATFORMS.map((p) => (
                        <div 
                          key={p.id}
                          onClick={() => p.available && setSelectedPlatforms(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                          className={cn(
                            "relative p-8 rounded-2xl border transition-all flex flex-col items-center justify-center gap-4 text-center group cursor-pointer",
                            !p.available ? "opacity-40 cursor-not-allowed border-zinc-900 bg-zinc-900/20" : 
                            selectedPlatforms.includes(p.id) ? "border-primary bg-primary/5" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                          )}
                        >
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", selectedPlatforms.includes(p.id) ? "bg-primary" : "bg-zinc-800")}>
                            <p.icon className="w-6 h-6 text-white" />
                          </div>
                          <span className="font-bold text-sm">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div>
                      <h1 className="text-4xl font-bold mb-4">Communities</h1>
                      <p className="text-zinc-500">Subreddits where we'll scan for high-intent conversations.</p>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="e.g. SaaS or r/startups"
                        value={newCommunity}
                        onChange={(e) => setNewCommunity(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCommunity()}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all"
                      />
                      <button onClick={addCommunity} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all bg-transparent">
                        <Plus className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden min-h-[100px]">
                      {communities.map((c, i) => (
                        <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 last:border-0 group hover:bg-white/[0.02]">
                          <div className="flex items-center gap-3">
                            <span className="text-primary text-xs font-bold">r/</span>
                            <span className="text-sm font-medium">{c}</span>
                          </div>
                          <button onClick={() => setCommunities(communities.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all bg-transparent">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div>
                      <h1 className="text-4xl font-bold mb-4">Keywords</h1>
                      <p className="text-zinc-500">High-intent search phrases that trigger buyer discovery.</p>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="e.g. AI copywriting tool for SaaS"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all"
                      />
                      <button onClick={addKeyword} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all bg-transparent">
                        <Plus className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((k, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold group">
                          {k}
                          <button onClick={() => setKeywords(keywords.filter((_, idx) => idx !== i))} className="hover:text-white transition-colors bg-transparent p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div>
                      <h1 className="text-4xl font-bold mb-4">Review your signal</h1>
                      <p className="text-zinc-500">Everything looks good? Hit create and we'll start monitoring.</p>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Product Section */}
                      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          <Brain className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Product</p>
                          <h3 className="text-lg font-bold text-white mb-1">{brain?.app_name}</h3>
                          <p className="text-xs text-zinc-400 leading-relaxed">{brain?.app_description}</p>
                        </div>
                      </div>

                      {/* Platforms Section */}
                      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          <Globe className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Platforms</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedPlatforms.map(p => (
                              <span key={p} className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Communities Section */}
                      {!skipSubreddits && (
                        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-5 h-5 text-zinc-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Communities</p>
                            <div className="flex flex-wrap gap-2">
                              {communities.map(c => (
                                <span key={c} className="px-3 py-1 rounded-lg bg-zinc-800 border border-white/5 text-zinc-400 text-[10px] font-bold">
                                  r/{c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Keywords Section */}
                      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          <Target className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Keywords</p>
                          <div className="flex flex-wrap gap-2">
                            {keywords.map(k => (
                              <span key={k} className="px-3 py-1 rounded-lg bg-zinc-800 border border-white/5 text-zinc-400 text-[10px] font-bold">
                                #{k}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-12 flex items-center justify-between">
                <button 
                  onClick={handleBack}
                  className={cn("flex items-center gap-2 text-zinc-500 hover:text-white transition-all bg-transparent", step === 1 && "invisible")}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                {step < 4 ? (
                  <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={handleCreateSignal}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-lg shadow-primary/20"
                  >
                    <Zap className="w-4 h-4" /> Create Signal
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const config = JSON.parse(localStorage.getItem('vh_audience_config') || '{}');

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="p-8 sm:p-12 flex items-center justify-between border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">User Finder</h1>
              <p className="text-zinc-500 text-sm">Find real people actively looking for what you built.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isLocked && (
              <>
                <button 
                  onClick={() => startScan({ keywords, platforms: selectedPlatforms, communities })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs font-bold hover:bg-zinc-800 transition-all bg-transparent"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                  Scan Now
                </button>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all bg-transparent text-xs font-bold"
                >
                  <Settings className="w-3.5 h-3.5" /> Re-Configure
                </button>
              </>
            )}
          </div>
        </header>

        <div className="p-8 sm:p-12 max-w-6xl mx-auto w-full">
          {/* Tier Usage Limits UI */}
          <div className="mb-8 flex items-center justify-between bg-[#111111] border border-white/5 rounded-xl px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {plan === 'free' ? 'Free Tier' : plan === 'starter' ? 'Starter Tier' : 'Pro Tier'} Usage:
              </span>
              <span className="text-sm font-bold text-orange-500">
                {limits.userFinder === 'unlimited' ? 'Unlimited' : `${scansUsed}/${limits.userFinder} searches`}
              </span>
            </div>
            {limits.userFinder !== 'unlimited' && (
              <div className="w-32 bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all duration-300" 
                  style={{ width: `${Math.min(100, (scansUsed / limits.userFinder) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {isLocked ? (
            /* TASK 3 — Audience Spotter Upgrade Section */
            <div className="animate-in fade-in duration-500 max-w-3xl mx-auto text-center py-12 space-y-12">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-3xl font-bold text-white">26+ potential user posts found — upgrade to access them</h2>
                <p className="text-zinc-400 text-sm max-w-md mx-auto">Upgrade to access this feature again and unlock unlimited high-intent buyer leads.</p>
                <div className="pt-4">
                  <Link 
                    to="/pricing" 
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base transition-all shadow-lg shadow-orange-500/20"
                  >
                    Upgrade Now <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              {/* Comparison Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-6">
                {/* Box 1: Doing it manually */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-5 h-5" />
                    <h3 className="font-bold text-white text-base">Doing it manually</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-zinc-400">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Takes forever</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Can get you banned if reply is bad</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>More effort than results</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Hard to consistently find users</span>
                    </li>
                  </ul>
                </div>

                {/* Box 2: Using Vibe Promote */}
                <div className="bg-[#111111] border border-orange-500/30 rounded-2xl p-6 space-y-4 bg-orange-500/[0.02]">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-bold text-white text-base">Using Vibe Promote</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-zinc-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Find users on autopilot</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Takes less than 5 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Ready-to-paste replies designed to get users and upvotes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Better quality replies (not “you are banned from this sub”)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <p className="text-zinc-500 text-sm font-medium">
                ⚡ 100+ builders are finding users on autopilot
              </p>
            </div>
          ) : activeSignals.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <RefreshCw className={cn("w-10 h-10 text-primary", isLoading && "animate-spin")} style={{ animationDuration: '3s' }} />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">
                {isLoading ? "Scanning for potential users..." : "Monitoring for new signals..."}
              </h2>
              <p className="text-zinc-500 max-w-md mx-auto text-sm leading-relaxed mb-8">
                you will see all the potential users post here when its found
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {keywords.map(k => (
                  <span key={k} className="px-3 py-1 rounded-full bg-zinc-900 border border-white/5 text-zinc-500 text-[10px] font-bold uppercase">#{k}</span>
                ))}
              </div>
              {config.scanStartedAt && (
                <p className="text-zinc-600 text-xs">
                  Last scan started {moment(config.scanStartedAt).fromNow()}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6 pb-20">
              {activeSignals.map((signal) => (
                <motion.div 
                  layout
                  key={signal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-lg",
                          signal.platform === 'reddit' ? "bg-[#FF4500]" : "bg-[#FF6600]"
                        )}>
                          {signal.platform === 'reddit' ? 'r/' : 'HN'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-white font-bold text-sm">{signal.subreddit}</span>
                            <span className="text-zinc-700 text-xs">•</span>
                            <span className="text-zinc-500 text-xs font-medium">by u/{signal.author}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                               <Target className="w-3 h-3 text-white" />
                               <span className="text-white text-[10px] font-bold uppercase tracking-wider">Potential User Score: {signal.intent_score}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-3 leading-tight">{signal.post_title}</h2>
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-8 leading-relaxed font-medium">{signal.post_body}</p>

                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-8">
                      <p className="text-[10px] text-zinc-500 italic mb-2">⚠ AI-generated — review and edit before sending</p>
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Suggested Reply</span>
                      </div>
                      <p className="text-white text-sm italic leading-relaxed font-medium">"{signal.suggested_reply}"</p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-zinc-600">
                          <Zap className="w-4 h-4" />
                          <span className="text-xs font-bold">{signal.upvotes} Upvotes</span>
                        </div>
                        <div className="flex items-center gap-3 border-l border-zinc-800 pl-6">
                          <button 
                            onClick={() => {
                              updateSignalStatus({ id: signal.id, status: 'replied' });
                              toast.success("Marked as replied!");
                              const replyTaskKey = `reply_posts_d${currentDay}`;
                              markTaskComplete(user.id, replyTaskKey, supabase);
                            }}
                            className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-green-500 hover:bg-green-500/10 transition-all bg-transparent"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDismiss(signal.id)}
                            className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all bg-transparent"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(signal.suggested_reply);
                            toast.success("Reply copied!");
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 text-white font-bold text-xs hover:bg-zinc-700 transition-all bg-transparent border border-zinc-700"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy Reply
                        </button>
                        <button 
                          onClick={() => window.open(signal.post_url, '_blank')}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:scale-105 transition-all shadow-xl"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open Post
                        </button>
                      </div>
                    </div>

                    {/* Feedback Box for Dismissal */}
                    <AnimatePresence>
                      {dismissingId === signal.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-6 pt-6 border-t border-white/5 overflow-hidden"
                        >
                          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <AlertCircle className="w-4 h-4 text-primary" />
                              <h3 className="text-sm font-bold">Why didn't you like this post?</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                              {DISMISS_REASONS.map(reason => (
                                <button
                                  key={reason.id}
                                  onClick={() => setDismissReason(reason.id)}
                                  className={cn(
                                    "px-4 py-2.5 rounded-lg border text-xs font-medium text-left transition-all",
                                    dismissReason === reason.id 
                                      ? "bg-primary/10 border-primary text-primary" 
                                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                                  )}
                                >
                                  {reason.label}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <button 
                                onClick={() => setShowSettings(true)}
                                className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest bg-transparent"
                              >
                                Change Configuration →
                              </button>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setDismissingId(null)}
                                  className="px-4 py-2 rounded-lg text-xs font-bold text-zinc-500 hover:text-white bg-transparent"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={confirmDismiss}
                                  disabled={!dismissReason}
                                  className="px-6 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all disabled:opacity-50"
                                >
                                  Remove Post
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}