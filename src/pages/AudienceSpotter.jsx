"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Target, 
  MessageSquare, 
  Twitter, 
  Globe, 
  Loader2, 
  Sparkles,
  ArrowLeft,
  X,
  Check,
  AlertCircle,
  Hash,
  Bell,
  Calendar,
  Settings,
  Plus,
  ChevronRight,
  Mail,
  Lock,
  Zap
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { generateAICall } from '../lib/ai';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

const platforms = [
  { id: 'reddit', name: 'Reddit', icon: 'r/', color: 'bg-[#FF4500]', active: true },
  { id: 'hn', name: 'Hacker News', icon: 'Y', color: 'bg-[#FF6600]', active: true },
  { id: 'twitter', name: 'X (Twitter)', icon: <Twitter className="w-4 h-4" />, color: 'bg-[#1F1F1F]', active: false, pro: true, comingSoon: true },
  { id: 'bluesky', name: 'Bluesky', icon: '🦋', color: 'bg-[#1F1F1F]', active: false, pro: true, comingSoon: true },
];

export default function AudienceSpotter() {
  const { user } = useAuth();
  const [brain, setBrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  
  // Flow State: 'monitoring' | 'setup'
  const [view, setView] = useState('setup'); 
  const [currentStep, setCurrentStep] = useState(1); // 1: Platforms, 2: Communities, 3: Keywords, 4: Review

  // Setup Data
  const [selectedPlatforms, setSelectedPlatforms] = useState(['reddit']);
  const [communities, setCommunities] = useState([
    'SaaS', 'marketing', 'growthhacker', 'digitalmarketing', 'SaaSMarketing', 
    'startups', 'Entrepreneur', 'BrandMarketing', 'copywriting', 'MarTech'
  ]);
  const [newCommunity, setNewCommunity] = useState('');
  const [keywords, setKeywords] = useState([
    'SaaS marketing', 'brand vibe', 'marketing strategy', 'brand building', 
    'customer engagement', 'audience connection', 'brand identity'
  ]);
  const [newKeyword, setNewKeyword] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      const { data: paymentData } = await supabase
        .from('user_payments')
        .select('payment_status')
        .eq('email', user.email)
        .maybeSingle();
      
      if (paymentData?.payment_status) {
        setIsPaid(true);
      }

      const { data } = await supabase
        .from('brand_brains')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setBrain(data);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const togglePlatform = (id) => {
    const platform = platforms.find(p => p.id === id);
    if (!platform.active) return;
    
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const handleAddCommunity = (e) => {
    e.preventDefault();
    if (newCommunity.trim() && !communities.includes(newCommunity.trim())) {
      setCommunities([...communities, newCommunity.trim()]);
      setNewCommunity('');
    }
  };

  const handleAddKeyword = (e) => {
    e.preventDefault();
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleCreateSignal = () => {
    toast.success("Signal created! Monitoring started.");
    setView('monitoring');
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  const steps = [
    { id: 1, name: 'Platforms' },
    { id: 2, name: 'Communities' },
    { id: 3, name: 'Keywords' },
    { id: 4, name: 'Review' }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {view === 'monitoring' ? (
          <div className="flex-1 flex flex-col p-8">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Buying Signals</h1>
                  <p className="text-[#52525B] text-sm">AI-powered monitoring of high-intent conversations across social platforms.</p>
                </div>
              </div>
              <button 
                onClick={() => setView('setup')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm font-medium hover:bg-white/5 transition-all bg-transparent"
              >
                <Settings className="w-4 h-4" />
                Configure
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h2 className="text-lg font-bold mb-2">Monitoring signals for {brain?.app_name || 'Vibe Hype'}</h2>
              <p className="text-[#52525B] text-sm max-w-md">
                We're actively scanning social platforms for high-intent conversations. Signals will appear here as they're detected.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row">
            {/* Left Sidebar Progress */}
            <div className="w-full lg:w-64 p-8 lg:pt-24 flex flex-col items-center lg:items-start">
              <button onClick={() => navigate('/dashboard')} className="text-[#52525B] text-sm flex items-center gap-2 hover:text-white mb-12">
                <ArrowLeft className="w-4 h-4" /> Buying Signals
              </button>

              <div className="relative space-y-12">
                {/* Vertical Line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-[#1F1F1F]" />
                
                {steps.map((s) => (
                  <div key={s.id} className="relative flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all duration-300",
                      currentStep > s.id ? "bg-primary text-white" : 
                      currentStep === s.id ? "bg-[#0A0A0A] border-2 border-primary text-primary" : 
                      "bg-[#0A0A0A] border-2 border-[#1F1F1F] text-[#52525B]"
                    )}>
                      {currentStep > s.id ? <Check className="w-4 h-4" /> : s.id}
                    </div>
                    <span className={cn(
                      "text-sm font-bold transition-all duration-300",
                      currentStep >= s.id ? "text-white" : "text-[#52525B]"
                    )}>
                      {s.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 lg:pt-24 max-w-4xl">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div>
                      <h1 className="text-4xl font-bold mb-4">Where should we listen?</h1>
                      <p className="text-[#A1A1AA] text-sm">Select the platforms to monitor for buying signals. At least one required.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {platforms.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => togglePlatform(p.id)}
                          className={cn(
                            "relative p-6 rounded-2xl border transition-all flex flex-col items-center justify-center gap-4 min-h-[160px]",
                            selectedPlatforms.includes(p.id) 
                              ? "bg-primary/5 border-primary" 
                              : "bg-[#111111] border-white/10 hover:border-primary/30",
                            !p.active && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {p.comingSoon && (
                            <span className="absolute top-3 right-3 text-[#52525B] text-[8px] font-bold uppercase tracking-widest flex items-center gap-1">
                              Coming Soon <Lock className="w-2 h-2" />
                            </span>
                          )}
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white",
                            p.color
                          )}>
                            {p.icon}
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-white">{p.name}</p>
                            {selectedPlatforms.includes(p.id) && (
                              <div className="mt-2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Selected
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-end pt-8">
                      <button 
                        onClick={() => setCurrentStep(2)}
                        disabled={selectedPlatforms.length === 0}
                        className="px-10 py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                      >
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div>
                      <h1 className="text-4xl font-bold mb-4">Communities</h1>
                      <p className="text-[#A1A1AA] text-sm">Subreddits where we'll scan for high-intent conversations about your product.</p>
                    </div>

                    <form onSubmit={handleAddCommunity} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="e.g. SaaS or r/startups"
                          value={newCommunity}
                          onChange={(e) => setNewCommunity(e.target.value)}
                          className="w-full bg-[#111111] border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all bg-transparent"
                      >
                        <Plus className="w-5 h-5 text-[#52525B]" />
                      </button>
                    </form>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest">SUBREDDITS</p>
                        <p className="text-[#52525B] text-[10px] font-bold">{communities.length}/15</p>
                      </div>
                      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto">
                          {communities.map((c, i) => (
                            <div key={c} className="flex items-center justify-between px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all group">
                              <div className="flex items-center gap-4">
                                <span className="text-[#52525B] text-xs font-bold w-4">{i + 1}</span>
                                <span className="text-primary text-xs font-bold">r/</span>
                                <span className="text-white text-sm font-medium">{c}</span>
                              </div>
                              <button 
                                onClick={() => setCommunities(communities.filter(x => x !== c))}
                                className="opacity-0 group-hover:opacity-100 text-[#52525B] hover:text-white transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-8">
                      <button onClick={() => setCurrentStep(1)} className="text-[#52525B] text-sm font-bold flex items-center gap-2 hover:text-white bg-transparent">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button 
                        onClick={() => setCurrentStep(3)}
                        className="px-10 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                      >
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div>
                      <h1 className="text-4xl font-bold mb-4">Keywords</h1>
                      <p className="text-[#A1A1AA] text-sm">Short-tail terms we'll use to find posts about your product across all selected platforms.</p>
                    </div>

                    <form onSubmit={handleAddKeyword} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="e.g. email outreach"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          className="w-full bg-[#111111] border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all bg-transparent"
                      >
                        <Plus className="w-5 h-5 text-[#52525B]" />
                      </button>
                    </form>

                    <div className="space-y-4">
                      <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest">Keywords ({keywords.length}/10)</p>
                      <div className="flex flex-wrap gap-2">
                        {keywords.map((word) => (
                          <span key={word} className="bg-primary/10 text-primary text-xs font-bold px-3 py-2 rounded-full border border-primary/20 flex items-center gap-2">
                            <Hash className="w-3 h-3" />
                            {word}
                            <button onClick={() => setKeywords(keywords.filter(k => k !== word))} className="hover:text-white">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#111111] border border-white/10 p-4 rounded-xl flex gap-4">
                      <AlertCircle className="w-5 h-5 text-[#52525B] flex-shrink-0 mt-0.5" />
                      <p className="text-[#52525B] text-xs leading-relaxed">
                        These keywords help us find relevant posts across platforms. Keep them short and broad — we run a separate filtering process on top that removes spam, off-topic content, and AI-generated noise.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-8">
                      <button onClick={() => setCurrentStep(2)} className="text-[#52525B] text-sm font-bold flex items-center gap-2 hover:text-white bg-transparent">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button 
                        onClick={() => setCurrentStep(4)}
                        className="px-10 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                      >
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div>
                      <h1 className="text-4xl font-bold mb-4">Review your signal</h1>
                      <p className="text-[#A1A1AA] text-sm">Everything looks good? Hit create and we'll start monitoring.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Product Summary */}
                      <div className="bg-[#111111] border border-white/10 rounded-xl p-6 flex gap-6">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                          <Search className="w-5 h-5 text-[#52525B]" />
                        </div>
                        <div>
                          <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest mb-1">Product</p>
                          <h3 className="text-white font-bold mb-1">{brain?.app_name || 'Vibe Hype'}</h3>
                          <p className="text-[#52525B] text-xs">{brain?.app_description || 'Vibe Hype helps SaaS companies transform their marketing efforts into a strong brand "vibe."'}</p>
                        </div>
                      </div>

                      {/* Platforms Summary */}
                      <div className="bg-[#111111] border border-white/10 rounded-xl p-6 flex gap-6">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                          <Globe className="w-5 h-5 text-[#52525B]" />
                        </div>
                        <div>
                          <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest mb-3">Platforms</p>
                          <div className="flex gap-2">
                            {selectedPlatforms.map(id => {
                              const p = platforms.find(x => x.id === id);
                              return (
                                <span key={id} className="bg-[#1F1F1F] text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                                  <div className={cn("w-3 h-3 rounded-sm flex items-center justify-center text-[8px] text-white font-black", p.color)}>
                                    {p.icon}
                                  </div>
                                  {p.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Communities Summary */}
                      <div className="bg-[#111111] border border-white/10 rounded-xl p-6 flex gap-6">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-[#52525B]" />
                        </div>
                        <div>
                          <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest mb-3">Communities</p>
                          <div className="flex flex-wrap gap-2">
                            {communities.map(c => (
                              <span key={c} className="bg-[#1F1F1F] text-[#A1A1AA] text-[10px] font-bold px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#52525B]/20 flex items-center justify-center text-[6px] text-[#52525B] font-black">r/</div>
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Keywords Summary */}
                      <div className="bg-[#111111] border border-white/10 rounded-xl p-6 flex gap-6">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                          <Hash className="w-5 h-5 text-[#52525B]" />
                        </div>
                        <div>
                          <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest mb-3">Keywords</p>
                          <div className="flex flex-wrap gap-2">
                            {keywords.map(k => (
                              <span key={k} className="bg-[#1F1F1F] text-[#A1A1AA] text-[10px] font-bold px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#52525B]/20 flex items-center justify-center text-[6px] text-[#52525B] font-black">#</div>
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-8">
                      <button onClick={() => setCurrentStep(3)} className="text-[#52525B] text-sm font-bold flex items-center gap-2 hover:text-white bg-transparent">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button 
                        onClick={handleCreateSignal}
                        className="px-8 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                      >
                        <Zap className="w-4 h-4" />
                        Create Signal
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}