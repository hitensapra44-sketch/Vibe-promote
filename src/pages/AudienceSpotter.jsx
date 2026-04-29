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
  ArrowLeft,
  ArrowRight,
  Globe,
  Twitter,
  Facebook,
  Lock,
  Settings,
  RefreshCw,
  Search,
  Mail,
  Clock
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useAudienceSpotter } from '../hooks/useAudienceSpotter';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

const STEPS = [
  { id: 1, name: 'Platforms' },
  { id: 2, name: 'Communities' },
  { id: 3, name: 'Keywords' },
  { id: 4, name: 'Review' }
];

const PLATFORMS = [
  { id: 'reddit', name: 'Reddit', icon: MessageSquare, color: '#FF4500', available: true },
  { id: 'hn', name: 'Hacker News', icon: Globe, color: '#FF6600', available: true },
  { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: '#1DA1F2', available: false, pro: true },
  { id: 'bluesky', name: 'Bluesky', icon: Globe, color: '#0560ff', available: false, pro: true },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2', available: false, pro: true },
];

export default function AudienceSpotter() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isConfigured, setIsConfigured] = useState(false);
  const [brain, setBrain] = useState(null);
  
  // Wizard State
  const [selectedPlatforms, setSelectedPlatforms] = useState(['reddit']);
  const [communities, setCommunities] = useState([]);
  const [newCommunity, setNewCommunity] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [emailDigest, setEmailDigest] = useState(true);

  const { signals, isLoading, startScan, updateSignalStatus } = useAudienceSpotter(user?.id);

  useEffect(() => {
    async function fetchBrain() {
      if (!user) return;
      const { data } = await supabase.from('brand_brains').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setBrain(data);
        // If they already have keywords/platforms, we might want to skip to monitoring
        // but for this flow we'll assume they start fresh or can re-configure
        if (data.pain_phrases || data.primary_platform) {
          setIsConfigured(true);
          setKeywords(data.pain_phrases?.split(',').map(k => k.trim()).filter(Boolean) || []);
          setCommunities(data.primary_platform?.split(',').map(s => s.trim()).filter(Boolean) || []);
        }
      }
    }
    fetchBrain();
  }, [user]);

  const handleCreateSignal = async () => {
    const { error } = await supabase
      .from('brand_brains')
      .update({ 
        pain_phrases: keywords.join(', '),
        primary_platform: communities.join(', ')
      })
      .eq('user_id', user.id);
    
    if (error) {
      toast.error("Failed to save configuration");
    } else {
      toast.success("Monitoring started!");
      setIsConfigured(true);
      startScan();
    }
  };

  const addCommunity = () => {
    if (newCommunity && !communities.includes(newCommunity)) {
      setCommunities([...communities, newCommunity.replace('r/', '')]);
      setNewCommunity('');
    }
  };

  const addKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword]);
      setNewKeyword('');
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
        <Sidebar isPaid={true} />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8 sm:p-12">
          <div className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row gap-16">
            
            {/* Left: Step Indicator */}
            <div className="lg:w-48 flex flex-col gap-8">
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm mb-4 bg-transparent">
                <ArrowLeft className="w-4 h-4" /> Buying Signals
              </button>
              
              <div className="relative flex flex-col gap-10">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-zinc-800" />
                {STEPS.map((s) => (
                  <div key={s.id} className="relative flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all border-2",
                      step === s.id ? "bg-[#E11D48] border-[#E11D48] text-white" : 
                      step > s.id ? "bg-[#E11D48] border-[#E11D48] text-white" : "bg-[#0A0A0A] border-zinc-800 text-zinc-500"
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
                            "relative p-8 rounded-2xl border transition-all flex flex-col items-center justify-center gap-4 text-center group",
                            !p.available ? "opacity-40 cursor-not-allowed border-zinc-900 bg-zinc-900/20" : 
                            selectedPlatforms.includes(p.id) ? "border-[#E11D48] bg-[#E11D48]/5" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                          )}
                        >
                          {p.pro && <span className="absolute top-3 right-3 text-[8px] font-bold text-[#E11D48] uppercase tracking-widest">PRO</span>}
                          {!p.available && <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-zinc-700" />}
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", selectedPlatforms.includes(p.id) ? "bg-[#E11D48]" : "bg-zinc-800")}>
                            <p.icon className="w-6 h-6 text-white" />
                          </div>
                          <span className="font-bold text-sm">{p.name}</span>
                          {selectedPlatforms.includes(p.id) && (
                            <div className="bg-[#E11D48] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
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
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[#E11D48] transition-all"
                      />
                      <button onClick={addCommunity} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all bg-transparent">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <span>Subreddits</span>
                        <span>{communities.length}/15</span>
                      </div>
                      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                        {communities.length === 0 ? (
                          <div className="p-8 text-center text-zinc-600 text-sm italic">No communities added yet</div>
                        ) : (
                          communities.map((c, i) => (
                            <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 last:border-0 group">
                              <div className="flex items-center gap-3">
                                <span className="text-zinc-600 text-xs font-bold">{i + 1}</span>
                                <span className="text-[#E11D48] text-xs font-bold">r/</span>
                                <span className="text-sm font-medium">{c}</span>
                              </div>
                              <button onClick={() => setCommunities(communities.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all bg-transparent">
                                <X className="w-4 h-4" />
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
                      <p className="text-zinc-500">Short-tail terms we'll use to find posts about your product across all selected platforms.</p>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="e.g. email outreach"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[#E11D48] transition-all"
                      />
                      <button onClick={addKeyword} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all bg-transparent">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <span>Keywords</span>
                        <span>{keywords.length}/10</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {keywords.map((k, i) => (
                          <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E11D48]/10 border border-[#E11D48]/20 text-[#E11D48] text-xs font-bold">
                            <span className="opacity-50">#</span> {k}
                            <button onClick={() => setKeywords(keywords.filter((_, idx) => idx !== i))} className="hover:text-white transition-colors bg-transparent">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex gap-3">
                        <Sparkles className="w-5 h-5 text-zinc-500 shrink-0" />
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          These keywords help us find relevant posts across platforms. Keep them short and broad — we run a separate filtering process on top that removes spam, off-topic content, and AI-generated noise.
                        </p>
                      </div>
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
                      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                          <Search className="w-5 h-5 text-zinc-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Product</p>
                          <h3 className="font-bold text-white">{brain?.app_name || 'Vibe Hype'}</h3>
                          <p className="text-xs text-zinc-500 mt-1">{brain?.app_description}</p>
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                          <Globe className="w-5 h-5 text-zinc-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Platforms</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedPlatforms.map(p => (
                              <div key={p} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold">
                                <div className="w-4 h-4 rounded bg-[#FF6600] flex items-center justify-center text-[8px]">{p === 'hn' ? 'Y' : 'r/'}</div>
                                {p === 'hn' ? 'Hacker News' : 'Reddit'}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                          <Target className="w-5 h-5 text-zinc-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Communities</p>
                          <div className="flex flex-wrap gap-2">
                            {communities.map(c => (
                              <div key={c} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400">
                                <span className="text-[#E11D48]">r/</span>{c}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5 text-zinc-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Keywords</p>
                          <div className="flex flex-wrap gap-2">
                            {keywords.map(k => (
                              <div key={k} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400">
                                <span className="text-[#E11D48]">#</span>{k}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5 text-zinc-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Frequency</p>
                            <p className="text-sm font-bold text-white">{frequency}</p>
                          </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex gap-4 items-center justify-between">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                              <Mail className="w-5 h-5 text-zinc-500" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Email Digest</p>
                              <p className="text-[10px] text-zinc-500">Receive a summary when new signals are found.</p>
                            </div>
                          </div>
                          <div 
                            onClick={() => setEmailDigest(!emailDigest)}
                            className={cn("w-10 h-5 rounded-full relative cursor-pointer transition-all", emailDigest ? "bg-[#E11D48]" : "bg-zinc-800")}
                          >
                            <div className={cn("absolute top-1 w-3 h-3 rounded-full bg-white transition-all", emailDigest ? "right-1" : "left-1")} />
                          </div>
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
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold transition-all disabled:opacity-50"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={handleCreateSignal}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold transition-all shadow-lg shadow-[#E11D48]/20"
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

  // Monitoring Dashboard View
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="p-8 sm:p-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E11D48]/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-[#E11D48]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Buying Signals</h1>
              <p className="text-zinc-500 text-sm">AI-powered monitoring of high-intent conversations across social platforms.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsConfigured(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all bg-transparent"
          >
            <Settings className="w-4 h-4" /> Configure
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-[#E11D48]/20 animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-[#E11D48]/10 flex items-center justify-center">
              <RefreshCw className="w-10 h-10 text-[#E11D48] animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Monitoring signals for {brain?.app_name || 'Vibe Hype'}</h2>
          <p className="text-zinc-500 max-w-md mx-auto text-sm leading-relaxed">
            We're actively scanning social platforms for high-intent conversations. Signals will appear here as they're detected.
          </p>
        </div>
      </main>
    </div>
  );
}