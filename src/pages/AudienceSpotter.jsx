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
  Lock,
  Settings,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  Clock,
  Wand2
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { generateAICall } from '../lib/ai';
import { useNavigate } from 'react-router-dom';
import { useAudienceSpotter } from '../hooks/useAudienceSpotter';

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
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isConfigured, setIsConfigured] = useState(false);
  const [brain, setBrain] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  
  const [selectedPlatforms, setSelectedPlatforms] = useState(['reddit']);
  const [communities, setCommunities] = useState([]);
  const [newCommunity, setNewCommunity] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [frequency, setFrequency] = useState('Daily');

  const { signals, isLoading, startScan, updateSignalStatus } = useAudienceSpotter(user?.id);

  const skipSubreddits = useMemo(() => {
    return selectedPlatforms.includes('hn') && !selectedPlatforms.includes('reddit');
  }, [selectedPlatforms]);

  const filteredSteps = useMemo(() => {
    if (skipSubreddits) {
      return STEPS.filter(s => s.id !== 2);
    }
    return STEPS;
  }, [skipSubreddits]);

  useEffect(() => {
    async function fetchBrainAndInit() {
      if (!user) return;
      try {
        const { data } = await supabase.from('brand_brains').select('*').eq('user_id', user.id).maybeSingle();
        if (data) {
          setBrain(data);
          
          // Check if already configured by looking for signals
          const { count } = await supabase
            .from('audience_signals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          if (count > 0) {
            setIsConfigured(true);
            // Load existing config if available
            if (data.audience_keywords) setKeywords(JSON.parse(data.audience_keywords));
            if (data.audience_platforms) setSelectedPlatforms(JSON.parse(data.audience_platforms));
            if (data.audience_communities) setCommunities(JSON.parse(data.audience_communities));
          } else {
            suggestFilters(data);
          }
        }
      } finally {
        setIsInitialLoading(false);
      }
    }
    fetchBrainAndInit();
  }, [user]);

  const suggestFilters = async (brainData) => {
    if (!brainData) return;
    setIsAIAnalyzing(true);
    try {
      const systemPrompt = `You are an elite Growth Marketing Strategist. Analyze this SaaS product and identify exactly where its buyers hang out and what phrases they use when actively searching for solutions. Return ONLY a JSON object with: subreddits: Array of 10 highly targeted subreddits (without 'r/'), keywords: Array of EXACTLY 10 highly-specific, intent-driven search phrases.`;
      const result = await generateAICall(systemPrompt, `App: ${brainData.app_name}. Problem: ${brainData.core_problem}`);
      const parsed = JSON.parse(result);
      if (parsed.subreddits) setCommunities(parsed.subreddits);
      if (parsed.keywords) setKeywords(parsed.keywords.slice(0, 10));
    } catch (e) { 
      console.error("AI Analysis failed", e);
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  const handleCreateSignal = async () => {
    if (keywords.length === 0) {
      toast.error("Add at least one keyword first");
      return;
    }
    setIsConfigured(true);
    startScan({ keywords, platforms: selectedPlatforms, communities });
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

  const getScoreLabel = (score) => {
    if (score >= 90) return `${score}% — Very likely your user`;
    if (score >= 75) return `${score}% — Strong match`;
    return `${score}% — Possible match`;
  };

  if (isInitialLoading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

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
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
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
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div>
                        <h1 className="text-4xl font-bold mb-4">Keywords</h1>
                        <p className="text-zinc-500">High-intent search phrases that trigger buyer discovery.</p>
                      </div>
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
                      <p className="text-zinc-500">Everything looks good? We'll start scanning for your buyers.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {communities.map(c => <span key={c} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400">r/{c}</span>)}
                        {keywords.map(k => <span key={k} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400">#{k}</span>)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-12 flex items-center justify-between">
                <button 
                  onClick={() => setStep(step - 1)}
                  className={cn("flex items-center gap-2 text-zinc-500 hover:text-white transition-all bg-transparent", step === 1 && "invisible")}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                {step < 4 ? (
                  <button 
                    onClick={() => setStep(step + 1)}
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
             <button 
                onClick={() => startScan({ keywords, platforms: selectedPlatforms, communities })}
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
              <h2 className="text-xl font-bold mb-2">Scanning for users...</h2>
              <p className="text-zinc-500 max-w-md mx-auto text-sm leading-relaxed">
                We're searching Reddit and Hacker News for high-intent conversations from the last 24 hours.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-20">
              {signals.map((signal) => (
                <motion.div 
                  layout
                  key={signal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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
                               <span className="text-white text-[10px] font-bold uppercase tracking-wider">Potential User Score: {getScoreLabel(signal.intent_score)}</span>
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
                            onClick={() => updateSignalStatus(signal.id, 'replied')}
                            className={cn(
                              "p-2 rounded-lg border transition-all bg-transparent",
                              signal.status === 'replied' ? "border-green-500 bg-green-500/10 text-green-500" : "border-zinc-800 text-zinc-500 hover:text-green-500"
                            )}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => updateSignalStatus(signal.id, 'dismissed')}
                            className={cn(
                              "p-2 rounded-lg border transition-all bg-transparent",
                              signal.status === 'dismissed' ? "border-red-500 bg-red-500/10 text-red-500" : "border-zinc-800 text-zinc-500 hover:text-red-500"
                            )}
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