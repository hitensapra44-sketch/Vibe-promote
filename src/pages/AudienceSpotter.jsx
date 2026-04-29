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
  Globe,
  Twitter,
  Lock,
  Settings,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useAudienceSpotter } from '../hooks/useAudienceSpotter';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { generateAICall } from '../lib/ai';

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

export default function AudienceSpotter() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isConfigured, setIsConfigured] = useState(false);
  const [brain, setBrain] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Wizard State
  const [selectedPlatforms, setSelectedPlatforms] = useState(['reddit']);
  const [communities, setCommunities] = useState([]);
  const [newCommunity, setNewCommunity] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [frequency, setFrequency] = useState('Daily');

  const { signals, isLoading, startScan, updateSignalStatus } = useAudienceSpotter(user?.id);

  useEffect(() => {
    async function fetchBrainAndInit() {
      if (!user) return;
      try {
        const { data } = await supabase.from('brand_brains').select('*').eq('user_id', user.id).maybeSingle();
        if (data) {
          setBrain(data);
          
          // Check if already configured
          const { count } = await supabase
            .from('audience_signals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          if (count > 0) {
            setIsConfigured(true);
          } else {
            // Pre-fill from Brand Brain if starting wizard
            const brainKeywords = data.pain_phrases?.split(',').map(k => k.trim()).filter(Boolean) || [];
            if (brainKeywords.length > 0) {
              setKeywords(brainKeywords);
            } else {
              // Intelligently suggest if brain is empty
              suggestKeywords(data);
            }

            const brainSubs = data.primary_platform?.split(',').map(s => s.trim().replace('r/', '')).filter(Boolean) || [];
            if (brainSubs.length > 0) {
              setCommunities(brainSubs);
            }
          }
        }
      } finally {
        setIsInitialLoading(false);
      }
    }
    fetchBrainAndInit();
  }, [user]);

  const suggestKeywords = async (brainData) => {
    try {
      const systemPrompt = "Suggest 5 short keywords or phrases (2-3 words max) that people would use on Reddit to ask for help with a problem this product solves. Return ONLY a comma-separated list.";
      const userMsg = `App: ${brainData.app_name}. Description: ${brainData.app_description}. Problem: ${brainData.core_problem}.`;
      const result = await generateAICall(systemPrompt, userMsg);
      const suggested = result.split(',').map(k => k.trim()).filter(Boolean);
      setKeywords(suggested);
    } catch (e) { console.error("Keyword suggestion failed", e); }
  };

  const handleCreateSignal = async () => {
    if (keywords.length === 0) {
      toast.error("Add at least one keyword first");
      return;
    }

    const loadingToast = toast.loading("Setting up monitoring...");
    
    const { error } = await supabase
      .from('brand_brains')
      .update({ 
        pain_phrases: keywords.join(', '),
        primary_platform: communities.join(', ')
      })
      .eq('user_id', user.id);
    
    if (error) {
      toast.error("Failed to save configuration", { id: loadingToast });
    } else {
      toast.success("Monitoring started! We're scanning now...", { id: loadingToast });
      setIsConfigured(true);
      startScan();
    }
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

  const handleCopyAndOpen = (signal) => {
    navigator.clipboard.writeText(signal.suggested_reply);
    toast.success("Suggested reply copied!");
    window.open(signal.post_url, '_blank');
  };

  if (isInitialLoading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
        <Sidebar isPaid={true} />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8 sm:p-12">
          <div className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row gap-16">
            
            {/* Left: Step Indicator */}
            <div className="lg:w-48 flex flex-col gap-8 pt-8">
              <div className="relative flex flex-col gap-10">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-zinc-800" />
                {STEPS.map((s) => (
                  <div key={s.id} className="relative flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all border-2",
                      step === s.id ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : 
                      step > s.id ? "bg-primary border-primary text-white" : "bg-[#0A0A0A] border-zinc-800 text-zinc-500"
                    )}>
                      {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                    </div>
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      step === s.id ? "text-white" : "text-zinc-500"
                    )}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Step Content */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div>
                      <h1 className="text-4xl font-bold mb-4">Where should we listen?</h1>
                      <p className="text-zinc-500">Select the platforms to monitor for buying signals. At least one required.</p>
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
                          {p.comingSoon && <span className="absolute top-3 right-3 text-[8px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">Coming Soon</span>}
                          {!p.available && !p.comingSoon && <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-zinc-700" />}
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", selectedPlatforms.includes(p.id) ? "bg-primary" : "bg-zinc-800")}>
                            <p.icon className="w-6 h-6 text-white" />
                          </div>
                          <span className="font-bold text-sm">{p.name}</span>
                          {selectedPlatforms.includes(p.id) && (
                            <div className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Selected
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div>
                      <h1 className="text-4xl font-bold mb-4">Communities</h1>
                      <p className="text-zinc-500">Subreddits where we'll scan for high-intent conversations about your product.</p>
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">
                        <span>Subreddits Added</span>
                        <span>{communities.length}/15</span>
                      </div>
                      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden min-h-[100px]">
                        {communities.length === 0 ? (
                          <div className="p-12 text-center text-zinc-600 text-sm italic">No communities added yet</div>
                        ) : (
                          communities.map((c, i) => (
                            <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 last:border-0 group hover:bg-white/[0.02]">
                              <div className="flex items-center gap-3">
                                <span className="text-zinc-600 text-xs font-bold">{i + 1}</span>
                                <span className="text-primary text-xs font-bold">r/</span>
                                <span className="text-sm font-medium">{c}</span>
                              </div>
                              <button onClick={() => setCommunities(communities.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all bg-transparent">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div>
                      <h1 className="text-4xl font-bold mb-4">Keywords</h1>
                      <p className="text-zinc-500">Short-tail terms we'll use to find posts about your product. These are what trigger the alerts.</p>
                    </div>
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
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">
                        <span>Active Keywords</span>
                        <span>{keywords.length}/10</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {keywords.length === 0 && <p className="text-zinc-600 text-sm italic w-full text-center py-8">Add at least one keyword</p>}
                        {keywords.map((k, i) => (
                          <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold group">
                            <span className="opacity-50">#</span> {k}
                            <button onClick={() => setKeywords(keywords.filter((_, idx) => idx !== i))} className="hover:text-white transition-colors bg-transparent p-0.5">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex gap-3 mt-8">
                        <Sparkles className="w-5 h-5 text-zinc-500 shrink-0" />
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          We run a secondary AI filter that removes spam and bot noise. Keep your keywords broad like "marketing" rather than "my specific niche tool".
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div>
                      <h1 className="text-4xl font-bold mb-4">Review your signal</h1>
                      <p className="text-zinc-500">Everything looks good? Once you hit create, we'll start scanning for your buyers.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                          <Search className="w-5 h-5 text-zinc-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Product</p>
                          <h3 className="font-bold text-white">{brain?.app_name || 'Vibe Hype'}</h3>
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{brain?.app_description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-zinc-500" />
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Platforms</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedPlatforms.map(p => (
                              <span key={p} className="px-2 py-1 rounded bg-zinc-800 text-[10px] font-bold text-white uppercase tracking-wider">{p}</span>
                            ))}
                          </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-zinc-500" />
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Frequency</p>
                          </div>
                          <p className="text-xs font-bold text-white">{frequency} scanning</p>
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-zinc-500" />
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Target Filters</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {communities.map(c => <span key={c} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400">r/{c}</span>)}
                          {keywords.map(k => <span key={k} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400">#{k}</span>)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="mt-12 flex items-center justify-between">
                <button 
                  onClick={() => step > 1 && setStep(step - 1)}
                  className={cn("flex items-center gap-2 text-zinc-500 hover:text-white transition-all bg-transparent", step === 1 && "invisible")}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                {step < 4 ? (
                  <button 
                    onClick={() => setStep(step + 1)}
                    disabled={step === 1 && selectedPlatforms.length === 0}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all disabled:opacity-50"
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

  // Monitoring Dashboard View (Shown after setup)
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="p-8 sm:p-12 flex items-center justify-between border-b border-white/5 bg-[#0A0A0A]/50 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Buying Signals</h1>
              <p className="text-zinc-500 text-sm">AI-powered monitoring of high-intent conversations.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => startScan()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs font-bold hover:bg-zinc-800 transition-all bg-transparent"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                Scan Now
              </button>
            <button 
              onClick={() => setIsConfigured(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all bg-transparent text-xs font-bold"
            >
              <Settings className="w-3.5 h-3.5" /> Re-Configure
            </button>
          </div>
        </header>

        <div className="p-8 sm:p-12 max-w-6xl mx-auto w-full">
          {signals.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="w-10 h-10 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">Monitoring signals for {brain?.app_name || 'Vibe Hype'}</h2>
              <p className="text-zinc-500 max-w-md mx-auto text-sm leading-relaxed mb-8">
                We're actively scanning Reddit and Hacker News for high-intent conversations. Signals will appear here as soon as they're detected.
              </p>
              <div className="flex flex-wrap justify-center gap-2 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                 {keywords.map(k => <span key={k} className="px-3 py-1.5 rounded-lg bg-zinc-900 text-[10px] font-bold text-zinc-400">#{k}</span>)}
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-20">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Live</span>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{signals.length} Signals Found</p>
                 </div>
              </div>

              {signals.map((signal) => (
                <motion.div 
                  layout
                  key={signal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group"
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
                            <span className="text-zinc-700 text-xs">•</span>
                            <span className="text-zinc-500 text-xs font-medium">{new Date(signal.posted_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-lg">
                               <Sparkles className="w-3 h-3 text-green-500" />
                               <span className="text-green-500 text-[10px] font-bold uppercase tracking-wider">{signal.intent_type}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                               <Target className="w-3 h-3 text-white" />
                               <span className="text-white text-[10px] font-bold uppercase tracking-wider">{signal.intent_score}% Intent Score</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateSignalStatus({ id: signal.id, status: 'dismissed' })}
                          className="p-2.5 rounded-xl hover:bg-red-500/10 text-zinc-600 hover:text-red-500 transition-all bg-transparent"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => updateSignalStatus({ id: signal.id, status: 'reviewed' })}
                          className="p-2.5 rounded-xl hover:bg-green-500/10 text-zinc-600 hover:text-green-500 transition-all bg-transparent"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-3 leading-tight">{signal.post_title}</h2>
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-8 leading-relaxed font-medium">{signal.post_body}</p>

                    <div className="bg-[#1A1A1A] border-l-4 border-primary rounded-r-2xl p-5 mb-8 group-hover:bg-white/[0.03] transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Suggested Reply</span>
                      </div>
                      <p className="text-white text-sm italic leading-relaxed font-medium">"{signal.suggested_reply}"</p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                          <Zap className="w-4 h-4" />
                          <span className="text-xs font-bold">{signal.upvotes} Upvotes</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs font-bold">{signal.comment_count} Comments</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCopyAndOpen(signal)}
                        className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-black font-bold text-xs hover:scale-105 transition-all shadow-xl"
                      >
                        <Copy className="w-4 h-4" />
                        Copy & Open Post
                        <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </div>
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