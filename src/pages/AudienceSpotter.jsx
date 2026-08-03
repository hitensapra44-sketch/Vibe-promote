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
  CheckCircle2,
  AtSign
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
import { completeOnboardingTask } from '../lib/onboarding';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { autoMarkTask } from '../lib/tasks';

const STEPS = [
  { id: 1, name: 'Platforms' },
  { id: 2, name: 'Communities' },
  { id: 3, name: 'Keywords' },
  { id: 4, name: 'Review' }
];

const PLATFORMS = [
  { id: 'reddit', name: 'Reddit', icon: MessageSquare, color: '#FF4500', available: true },
  { id: 'hn', name: 'Hacker News', icon: Globe, color: '#FF6600', available: true },
  { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: '#1DA1F2', available: true },
  { id: 'threads', name: 'Threads', icon: AtSign, color: '#000000', available: true },
];

const DISMISS_REASONS = [
  { id: 'bad_post', label: 'Bad post' },
  { id: 'bad_subreddit', label: 'Bad subreddit' },
  { id: 'bad_reply', label: 'Bad reply' },
  { id: 'dont_know', label: "Don't know, just don't feel like a good post" }
];

export default function AudienceSpotter() {
  const { user, plan } = useAuth();
  const queryClient = useQueryClient();
  const { limits } = usePlan();
  const { used: scansUsed, refetch: refetchUsage } = useUsage('user_finder');
  const [step, setStep] = useState(1);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('Platforms');
  const [brain, setBrain] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(1);
  const [copiedSignalId, setCopiedSignalId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  
  const [selectedPlatforms, setSelectedPlatforms] = useState(['reddit']);
  const [communities, setCommunities] = useState([]);
  const [newCommunity, setNewCommunity] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');

  // Editable product fields
  const [editAppName, setEditAppName] = useState('');
  const [editAppDescription, setEditAppDescription] = useState('');
  const [editTargetCustomer, setEditTargetCustomer] = useState('');

  const [dismissingId, setDismissingId] = useState(null);
  const [dismissReason, setDismissReason] = useState(null);

  const [replyModes, setReplyModes] = useState({});
  const [voiceSample, setVoiceSample] = useState('');
  const [replyCtaText, setReplyCtaText] = useState('');

  // On-demand reply generation states
  const [generatedReplies, setGeneratedReplies] = useState({});   // { [signalId]: string }
  const [generatingReply, setGeneratingReply] = useState({});     // { [signalId]: boolean }

  const { signals, isLoading, startScan, updateSignalStatus } = useAudienceSpotter(user?.id);

  const isLocked = limits.userFinder !== "unlimited" && scansUsed >= limits.userFinder;

  const maxKeywords = plan === 'free' ? 5 : plan === 'starter' ? 10 : 100;
  const maxCommunities = plan === 'free' ? 5 : plan === 'starter' ? 10 : 100;

  // Filter out signals that are not 'new'
  const activeSignals = useMemo(() => signals.filter(s => s.status === 'new'), [signals]);

  const filteredByTab = useMemo(() => {
    if (activeTab === 'all') return activeSignals;
    return activeSignals.filter(s => s.platform === activeTab);
  }, [activeTab, activeSignals]);

  const availableTabs = useMemo(() => {
    const tabs = [{ id: 'all', label: 'All' }];
    if (selectedPlatforms.includes('reddit')) tabs.push({ id: 'reddit', label: 'Reddit' });
    if (selectedPlatforms.includes('twitter')) tabs.push({ id: 'x', label: 'X' });
    if (selectedPlatforms.includes('threads')) tabs.push({ id: 'threads', label: 'Threads' });
    if (selectedPlatforms.includes('hn')) tabs.push({ id: 'hacker_news', label: 'Hacker News' });
    return tabs;
  }, [selectedPlatforms]);

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
        const savedVoice = localStorage.getItem('vh_voice_sample');
        if (savedVoice) setVoiceSample(savedVoice);
        const savedCta = localStorage.getItem('vh_reply_cta');
        if (savedCta) setReplyCtaText(savedCta);

        const { data: brainData } = await supabase.from('brand_brains').select('*').eq('user_id', user.id).maybeSingle();
        const { count } = await supabase.from('audience_signals').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        const savedConfig = localStorage.getItem('vh_audience_config');
        
        if (brainData) {
          setBrain(brainData);
          setEditAppName(brainData.app_name || '');
          setEditAppDescription(brainData.app_description || '');
          setEditTargetCustomer(brainData.target_customer || '');
          
          // Load from brand brain if they exist
          let brainKeywords = [];
          let brainCommunities = [];
          let brainPlatforms = [];
          
          if (brainData.audience_keywords) {
            try {
              brainKeywords = JSON.parse(brainData.audience_keywords);
            } catch (e) {
              brainKeywords = brainData.audience_keywords.split(',').map(k => k.trim()).filter(Boolean);
            }
          } else if (brainData.pain_phrases) {
            brainKeywords = brainData.pain_phrases.split(',').map(k => k.trim()).filter(Boolean);
          }

          if (brainData.audience_communities) {
            try {
              brainCommunities = JSON.parse(brainData.audience_communities);
            } catch (e) {
              brainCommunities = brainData.audience_communities.split(',').map(c => c.trim()).filter(Boolean);
            }
          }

          if (brainData.audience_platforms) {
            try {
              brainPlatforms = JSON.parse(brainData.audience_platforms);
            } catch (e) {
              brainPlatforms = brainData.audience_platforms.split(',').map(p => p.trim()).filter(Boolean);
            }
          }

          // Fallback if empty
          if (brainKeywords.length === 0) {
            brainKeywords = [brainData.core_problem].filter(Boolean);
          }
          if (brainCommunities.length === 0) {
            brainCommunities = ['SaaS', 'startups', 'indiehackers', 'SideProject', 'entrepreneur'];
          }
          if (brainPlatforms.length === 0) {
            brainPlatforms = ['reddit'];
          }

          setKeywords(brainKeywords.slice(0, maxKeywords));
          setCommunities(brainCommunities.slice(0, maxCommunities));
          setSelectedPlatforms(brainPlatforms);
        }

        if (count > 0) {
          setIsConfigured(true);
        } else if (savedConfig) {
          const config = JSON.parse(savedConfig);
          if (config.isScanning) {
            setIsConfigured(true);
            setKeywords(config.keywords.slice(0, maxKeywords));
            setSelectedPlatforms(config.platforms);
            setCommunities(config.communities.slice(0, maxCommunities));
            startScan({ keywords: config.keywords.slice(0, maxKeywords), platforms: config.platforms, communities: config.communities.slice(0, maxKeywords) });
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
          setCurrentDay(Math.min(15, diffDays + 1));
        }
      } finally {
        setIsInitialLoading(false);
      }
    }
    init();
  }, [user]);

  const handleRescan = async () => {
    if (isLocked) {
      toast.error(`You've used all ${limits.userFinder} scans this month. Upgrade to get more.`);
      navigate('/pricing');
      return;
    }
    
    try {
      await startScan({ keywords, platforms: selectedPlatforms, communities });
      
      // Auto-mark scan task complete
      autoMarkTask(user.id, '/audience-spotter', 'Find');
      
      await markTaskComplete(user.id, 'run_user_finder', supabase);
      await completeOnboardingTask(user.id, 'run_scan');
      queryClient.invalidateQueries({ queryKey: ['onboarding_status', user.id] });
      queryClient.invalidateQueries({ queryKey: ['growth-state'] });
      
      await incrementUsage(supabase, user.id, 'user_finder');
      refetchUsage();
    } catch (err) {
      // Error logging handled in hook
    }
  };

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
    
    try {
      await startScan({ keywords, platforms: selectedPlatforms, communities });
      
      // Auto-mark scan task complete
      autoMarkTask(user.id, '/audience-spotter', 'Find');
      
      await markTaskComplete(user.id, 'run_user_finder', supabase);
      await completeOnboardingTask(user.id, 'run_scan');
      queryClient.invalidateQueries({ queryKey: ['onboarding_status', user.id] });
      queryClient.invalidateQueries({ queryKey: ['growth-state'] });
      
      await incrementUsage(supabase, user.id, 'user_finder');
      refetchUsage();
    } catch (err) {
      // Error logging handled in hook
    }
  };

  const handleSaveChanges = async () => {
    if (isLocked) {
      toast.error(`You've used all ${limits.userFinder} scans this month. Upgrade to get more.`);
      navigate('/pricing');
      return;
    }
    setIsConfigured(true);

    try {
      localStorage.setItem('vh_voice_sample', voiceSample);
      localStorage.setItem('vh_reply_cta', replyCtaText);

      const { error } = await supabase
        .from('brand_brains')
        .update({
          app_name: editAppName,
          app_description: editAppDescription,
          target_customer: editTargetCustomer,
          audience_keywords: JSON.stringify(keywords),
          audience_platforms: JSON.stringify(selectedPlatforms),
          audience_communities: JSON.stringify(communities)
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setBrain(prev => ({
        ...prev,
        app_name: editAppName,
        app_description: editAppDescription,
        target_customer: editTargetCustomer,
        audience_keywords: JSON.stringify(keywords),
        audience_platforms: JSON.stringify(selectedPlatforms),
        audience_communities: JSON.stringify(communities)
      }));

      toast.success("Settings saved successfully!");
      
      await startScan({ keywords, platforms: selectedPlatforms, communities });
      
      // Auto-mark scan task complete
      autoMarkTask(user.id, '/audience-spotter', 'Find');
      
      await markTaskComplete(user.id, 'run_user_finder', supabase);
      await completeOnboardingTask(user.id, 'run_scan');
      queryClient.invalidateQueries({ queryKey: ['onboarding_status', user.id] });
      queryClient.invalidateQueries({ queryKey: ['growth-state'] });
      
      await incrementUsage(supabase, user.id, 'user_finder');
      refetchUsage();
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error("Failed to save settings.");
    }
  };

  const addCommunity = () => {
    if (communities.length >= maxCommunities) {
      toast.error(`Your plan limits you to ${maxCommunities} subreddits.`);
      return;
    }
    if (newCommunity && !communities.includes(newCommunity)) {
      setCommunities([...communities, newCommunity.replace('r/', '').trim()]);
      setNewCommunity('');
    }
  };

  const addKeyword = () => {
    if (keywords.length >= maxKeywords) {
      toast.error(`Your plan limits you to ${maxKeywords} keywords.`);
      return;
    }
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

  const handleGenerateReply = async (signal) => {
    const mode = replyModes[signal.id] || 'helpful';
    setGeneratingReply(prev => ({ ...prev, [signal.id]: true }));
    
    const prompt = `
    You are a helpful reply assistant for a SaaS founder.
    
    Product: ${brain?.app_name || 'their product'}
    Description: ${brain?.app_description || ''}
    Target audience: ${brain?.target_customer || ''}
    ${replyCtaText ? `CTA to include subtly: ${replyCtaText}` : ''}
    ${voiceSample ? `Write in this founder's voice/tone (use as style reference only): ${voiceSample}` : ''}
    
    Reddit post title: ${signal.post_title}
    Reddit post body: ${signal.post_body || ''}
    
    Reply tone: ${mode}
    - helpful: genuinely helpful, no promotion, solve their problem directly
    - expert: authoritative and knowledgeable, share insight/experience
    - founder_story: share a brief personal founder experience related to their problem
    - soft_promo: helpful first, then naturally mention the product without being pushy
    
    Write a Reddit reply in the selected tone. Keep it concise (3-5 sentences max). Sound human, not like AI. Do not use bullet points. Do not start with "I". Return ONLY the reply text, nothing else.
    `;
    
    try {
      const result = await generateAICall(prompt, "Generate the reply now.", null, 'copilot');
      setGeneratedReplies(prev => ({ ...prev, [signal.id]: result }));
    } catch (err) {
      console.error("Error generating reply:", err);
      toast.error("Failed to generate reply.");
    } finally {
      setGeneratingReply(prev => ({ ...prev, [signal.id]: false }));
    }
  };

  if (isInitialLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  if (showSettings) {
    const tabs = ['Platforms', 'Monitoring', 'Reply Voice', 'Product', 'Notifications'];
    return (
      <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
        <Sidebar isPaid={true} />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8 sm:p-12">
          <div className="max-w-5xl mx-auto w-full">
            <button onClick={() => setShowSettings(false)} className="flex items-center gap-2 text-foreground/60 hover:text-foreground mb-8 bg-transparent border-none cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Back to User Finder
            </button>

            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                <Settings className="w-6 h-6 text-foreground/60" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Signal Settings</h1>
                <p className="text-foreground/60 text-sm">Configure how we monitor the internet for buying signals.</p>
              </div>
            </div>

            <div className="flex gap-8 border-b border-foreground/5 mb-10">
              {tabs.map(t => (
                <button
                  key={t}
                  onClick={() => setSettingsTab(t)}
                  className={cn(
                    "pb-4 text-sm font-bold transition-all bg-transparent relative border-none cursor-pointer",
                    settingsTab === t ? "text-primary" : "text-foreground/60 hover:text-foreground/80"
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
                    {PLATFORMS.map(p => {
                      const isSelected = selectedPlatforms.includes(p.id);
                      const isLockedPlatform = (p.id === 'twitter' || p.id === 'threads') && plan === 'free';
                      return (
                        <div 
                          key={p.id} 
                          onClick={() => {
                            if (!p.available) return;
                            if (isLockedPlatform) {
                              toast.error("X and Threads monitoring is a Pro feature. Please upgrade your plan.");
                              navigate('/pricing');
                              return;
                            }
                            if (isSelected) {
                              if (selectedPlatforms.length > 1) {
                                setSelectedPlatforms(selectedPlatforms.filter(id => id !== p.id));
                              } else {
                                toast.error("Select at least one platform");
                              }
                            } else {
                              setSelectedPlatforms([...selectedPlatforms, p.id]);
                            }
                          }}
                          className={cn(
                            "p-8 rounded-2xl border transition-all flex flex-col items-center gap-4 text-center cursor-pointer",
                            !p.available ? "opacity-40 border-foreground/10 bg-foreground/5 cursor-not-allowed" :
                            isLockedPlatform ? "border-foreground/10 bg-foreground/5 hover:border-orange-500/30" :
                            isSelected ? "border-primary bg-primary/5" : "border-foreground/10 bg-foreground/5 hover:border-foreground/20"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                            isLockedPlatform ? "bg-orange-50/10 text-orange-500" :
                            isSelected ? "bg-primary/10 text-primary" : "bg-foreground/5 text-foreground"
                          )}>
                            <p.icon className="w-6 h-6" />
                          </div>
                          <span className={cn("font-bold text-sm", isSelected ? "text-primary" : "text-foreground")}>{p.name}</span>
                          {!p.available && <span className="text-[10px] font-bold text-primary uppercase">Locked</span>}
                          {isLockedPlatform && <span className="text-[10px] font-bold text-orange-500 uppercase">Pro Feature</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {settingsTab === 'Monitoring' && (
                <div className="space-y-12">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Keywords</h2>
                      <span className="text-xs text-foreground/60 font-bold uppercase">Limit: {keywords.length}/{maxKeywords}</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="e.g. email outreach"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                        disabled={keywords.length >= maxKeywords}
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-6 py-4 text-foreground focus:outline-none focus:border-primary transition-all disabled:opacity-50"
                      />
                      <button 
                        onClick={addKeyword} 
                        disabled={keywords.length >= maxKeywords}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-all bg-transparent border-none cursor-pointer disabled:opacity-50"
                      >
                        <Plus className="w-5 h-5 text-foreground" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((k, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                          {k}
                          <button onClick={() => setKeywords(keywords.filter((_, idx) => idx !== i))} className="hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0.5">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Communities</h2>
                      <span className="text-xs text-foreground/60 font-bold uppercase">Limit: {communities.length}/{maxCommunities}</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="e.g. SaaS or r/startups"
                        value={newCommunity}
                        onChange={(e) => setNewCommunity(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCommunity()}
                        disabled={communities.length >= maxCommunities}
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-6 py-4 text-foreground focus:outline-none focus:border-primary transition-all disabled:opacity-50"
                      />
                      <button 
                        onClick={addCommunity} 
                        disabled={communities.length >= maxCommunities}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-all bg-transparent border-none cursor-pointer disabled:opacity-50"
                      >
                        <Plus className="w-5 h-5 text-foreground" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {communities.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/80 text-xs font-bold">
                          r/{c}
                          <button onClick={() => setCommunities(communities.filter((_, idx) => idx !== i))} className="hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0.5">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'Reply Voice' && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold">Your Reply Voice</h2>
                    <p className="text-foreground/60 text-sm">
                      Paste a reply you wrote that felt like you. AI uses this as tone context.
                    </p>
                    <textarea
                      value={voiceSample}
                      onChange={(e) => setVoiceSample(e.target.value)}
                      placeholder="Paste a reply you've written before that felt natural..."
                      className="w-full h-40 bg-foreground/5 border border-foreground/10 rounded-xl px-6 py-4 text-foreground text-sm focus:outline-none focus:border-primary resize-none placeholder-foreground/30"
                    />
                  </div>

                  <div className="mt-10 border-t border-foreground/10 pt-8 space-y-4">
                    <h2 className="text-xl font-bold">Current CTA</h2>
                    <p className="text-foreground/60 text-sm">
                      What's the call-to-action you want people to take after reading your reply?
                    </p>
                    <input
                      type="text"
                      value={replyCtaText}
                      onChange={(e) => setReplyCtaText(e.target.value)}
                      placeholder="e.g. Check out vibepromote.tech — free to try"
                      className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-6 py-4 text-foreground text-sm focus:outline-none focus:border-primary transition-all placeholder-foreground/30"
                    />
                  </div>
                </div>
              )}

              {settingsTab === 'Product' && (
                <div className="space-y-8">
                  <div className="p-8 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-1">App Name</p>
                        <input 
                          type="text"
                          value={editAppName}
                          onChange={(e) => setEditAppName(e.target.value)}
                          className="w-full bg-background border border-foreground/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-1">Description</p>
                        <textarea
                          rows={3}
                          value={editAppDescription}
                          onChange={(e) => setEditAppDescription(e.target.value)}
                          className="w-full bg-background border border-foreground/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none leading-relaxed"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-1">Target Audience</p>
                        <input 
                          type="text"
                          value={editTargetCustomer}
                          onChange={(e) => setEditTargetCustomer(e.target.value)}
                          className="w-full bg-background border border-foreground/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-foreground/5 flex justify-end">
              <button 
                onClick={() => {
                  handleSaveChanges();
                  setShowSettings(false);
                }}
                className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-lg shadow-primary/20 border-none cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const config = JSON.parse(localStorage.getItem('vh_audience_config') || '{}');

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="p-8 sm:p-12 flex items-center justify-between border-b border-foreground/5 bg-background sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">User Finder</h1>
              <p className="text-foreground/60 text-sm">Find real people actively looking for what you built.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isLocked && (
              <>
                <button 
                  onClick={handleRescan}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground text-xs font-bold hover:bg-foreground/10 transition-all bg-transparent border-none cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                  {isLoading ? "Scanning..." : "Scan Now"}
                </button>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/20 transition-all bg-transparent text-xs font-bold cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" /> Re-Configure
                </button>
              </>
            )}
          </div>
        </header>

        <div className="p-8 sm:p-12 max-w-6xl mx-auto w-full">
          <div className="mb-8 flex items-center justify-between bg-foreground/5 border border-foreground/5 rounded-xl px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider">
                {plan === 'free' ? 'Free Tier' : plan === 'starter' ? 'Starter Tier' : 'Pro Tier'} Usage:
              </span>
              <span className="text-sm font-bold text-orange-500">
                {limits.userFinder === 'unlimited' ? 'Unlimited' : `${scansUsed}/${limits.userFinder} searches`}
              </span>
            </div>
            {limits.userFinder !== 'unlimited' && (
              <div className="w-32 bg-foreground/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all duration-300" 
                  style={{ width: `${Math.min(100, (scansUsed / limits.userFinder) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {isLocked ? (
            <div className="animate-in fade-in duration-500 max-w-3xl mx-auto text-center py-12 space-y-12">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">26+ potential user posts found — upgrade to access them</h2>
                <p className="text-foreground/60 text-sm max-w-md mx-auto">Upgrade to access this feature again and unlock unlimited high-intent buyer leads.</p>
                <div className="pt-4">
                  <Link 
                    to="/pricing" 
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base transition-all shadow-lg shadow-orange-500/20 no-underline"
                  >
                    Upgrade Now <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
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
              <p className="text-foreground/60 max-w-md mx-auto text-sm leading-relaxed mb-8">
                you will see all the potential users post here when its found
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {keywords.map(k => (
                  <span key={k} className="px-3 py-1 rounded-full bg-foreground/5 border border-foreground/5 text-foreground/60 text-[10px] font-bold uppercase">#{k}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-20">
              <div className="flex gap-8 border-b border-foreground/5 mb-8">
                {availableTabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "pb-4 text-sm font-bold transition-all bg-transparent relative border-none cursor-pointer",
                      activeTab === t.id ? "text-primary" : "text-foreground/60 hover:text-foreground/80"
                    )}
                  >
                    {t.label}
                    {activeTab === t.id && (
                      <motion.div 
                        layoutId="active-signal-tab" 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
                      />
                    )}
                  </button>
                ))}
              </div>

              {filteredByTab.length === 0 ? (
                <div className="py-20 text-center text-foreground/60 text-sm">
                  No new signals found for this platform.
                </div>
              ) : (
                filteredByTab.map((signal) => (
                  <motion.div 
                    layout
                    key={signal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-foreground/5 border border-foreground/10 rounded-2xl overflow-hidden hover:border-foreground/20 transition-all group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-lg",
                            signal.platform === 'reddit' ? "bg-[#FF4500]" : 
                            signal.platform === 'x' ? "bg-black" : 
                            signal.platform === 'threads' ? "bg-black border border-white/10" : 
                            "bg-[#FF6600]"
                          )}>
                            {signal.platform === 'reddit' ? 'r/' : 
                             signal.platform === 'x' ? 'X' : 
                             signal.platform === 'threads' ? '@' : 
                             'HN'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-foreground font-bold text-sm">{signal.subreddit}</span>
                              {signal.author && signal.author !== 'unknown' && (
                                <>
                                  <span className="text-foreground/40 text-xs">•</span>
                                  <span className="text-foreground/60 text-xs font-medium">by u/{signal.author}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 bg-foreground/5 border border-foreground/10 px-2.5 py-1 rounded-lg">
                                 <Target className="w-3 h-3 text-foreground" />
                                 <span className="text-foreground text-[10px] font-bold uppercase tracking-wider">Potential User Score: {signal.intent_score}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <h2 className="text-xl font-bold text-foreground mb-3 leading-tight">{signal.post_title}</h2>
                      <p className="text-foreground/60 text-sm line-clamp-2 mb-8 leading-relaxed font-medium">{signal.post_body}</p>

                      <div className="mb-4 space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {['helpful', 'expert', 'founder_story', 'soft_promo'].map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setReplyModes(prev => ({ ...prev, [signal.id]: mode }))}
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all bg-transparent border-none cursor-pointer",
                                (replyModes[signal.id] || 'helpful') === mode 
                                  ? "bg-primary/10 border-primary text-primary" 
                                  : "bg-foreground/5 border border-foreground/10 text-foreground/60 hover:border-foreground/20"
                              )}
                            >
                              {mode.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => handleGenerateReply(signal)}
                          disabled={generatingReply[signal.id]}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/10 border-none cursor-pointer"
                        >
                          {generatingReply[signal.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          {generatedReplies[signal.id] ? "Regenerate Reply →" : "Generate Reply →"}
                        </button>
                      </div>

                      {generatedReplies[signal.id] && (
                        <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-5 mb-8 animate-in fade-in duration-300">
                          <p className="text-foreground text-sm italic leading-relaxed font-medium">"{generatedReplies[signal.id]}"</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-6 border-t border-foreground/5">
                        <div className="flex items-center gap-6">
                          <button 
                            onClick={() => window.open(signal.post_url, '_blank')}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs hover:scale-105 transition-all shadow-xl border-none cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open Post
                          </button>
                          <div className="flex items-center gap-3 border-l border-foreground/10 pl-6">
                            <button 
                              onClick={() => {
                                updateSignalStatus({ id: signal.id, status: 'replied' });
                                toast.success("Marked as replied!");
                                autoMarkTask(user.id, '/audience-spotter', 'Reply');
                              }}
                              className="p-2 rounded-lg border border-foreground/10 text-foreground/60 hover:text-green-500 hover:bg-green-500/10 transition-all bg-transparent border-none cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDismiss(signal.id)}
                              className="p-2 rounded-lg border border-foreground/10 text-foreground/60 hover:text-red-400 hover:bg-red-400/10 transition-all bg-transparent border-none cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}