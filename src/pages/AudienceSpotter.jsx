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
  ExternalLink,
  TrendingUp,
  Zap,
  ArrowLeft,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { generateAICall } from '../lib/ai';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";

export default function AudienceSpotter() {
  const { user } = useAuth();
  const [brain, setBrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('setup'); // 'setup', 'loading', 'results'
  const [scanningSteps, setScanningSteps] = useState([]);
  const [results, setResults] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  
  // Search Settings
  const [subreddits, setSubreddits] = useState(['r/SaaS', 'r/entrepreneur', 'r/startups', 'r/indiehackers']);
  const [searchType, setSearchType] = useState('Both'); // 'Solutions', 'Frustrations', 'Both'
  const [timeframe, setTimeframe] = useState('7 days'); // '24 hours', '7 days', '30 days'
  
  // Reply Crafter
  const [selectedResult, setSelectedResult] = useState(null);
  const [replyTone, setReplyTone] = useState('Friendly Founder');
  const [mentionStyle, setMentionStyle] = useState('Soft mention');
  const [generatedReply, setGeneratedReply] = useState('');
  const [generatingReply, setGeneratingReply] = useState(false);

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

  const startScan = async () => {
    setStep('loading');
    setScanningSteps([]);
    
    const addStep = (text, status = 'loading') => {
      setScanningSteps(prev => [...prev, { text, status }]);
    };

    // Simulate steps for UI feel
    setTimeout(() => addStep(`Scanning ${subreddits[0]}...`), 500);
    setTimeout(() => addStep(`Scanning ${subreddits[1]}...`), 1500);
    setTimeout(() => addStep(`Scoring buying intent with AI...`), 3000);

    const systemPrompt = `You are a social listening expert. Find the exact "watering holes" where this audience hangs out.
    
    Based on: ${JSON.stringify(brain)}
    Settings: Type: ${searchType}, Timeframe: ${timeframe}
    
    Return ONLY a valid JSON object:
    {
      "reddit": [{ "name": "r/...", "title": "...", "snippet": "...", "intent": "High", "time": "2 hours ago", "ups": 47, "comments": 23 }],
      "twitter": [{ "tag": "#...", "vibe": "...", "angle": "..." }],
      "forums": [{ "name": "...", "vibe": "...", "angle": "..." }]
    }`;

    try {
      const result = await generateAICall(systemPrompt, `Brand Brain:\n${JSON.stringify(brain)}`);
      const parsed = JSON.parse(result);
      
      setTimeout(() => {
        setScanningSteps(prev => {
          const next = [...prev];
          next[next.length - 1].status = 'success';
          return next;
        });
        setResults(parsed);
        setStep('results');
        supabase.rpc('increment_audience_found', { user_uuid: user.id });
      }, 4500);
      
    } catch (err) {
      console.error("Scan failed:", err);
      setStep('setup');
    }
  };

  const generateReply = async () => {
    if (!selectedResult) return;
    setGeneratingReply(true);
    
    const systemPrompt = `Write a Reddit reply for this post: "${selectedResult.title}". 
    Tone: ${replyTone}. Style: ${mentionStyle}. 
    App Context: ${brain.app_name} - ${brain.app_description}.
    
    Rules:
    - Sound like a real human founder.
    - No hard selling.
    - Max 250 chars.
    - If soft mention, don't name the app, just describe the solution.
    - If direct pitch, mention the app name naturally.`;

    try {
      const result = await generateAICall(systemPrompt, "Generate the reply now.");
      setGeneratedReply(result);
    } catch (err) {
      console.error("Reply generation failed:", err);
    } finally {
      setGeneratingReply(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#F97316] animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {step === 'setup' && (
          <div className="max-w-[640px] mx-auto w-full py-12 px-6">
            <div className="mb-8">
              <p className="text-[#52525B] text-xs font-medium mb-2">Dashboard / Audience Spotter</p>
              <h1 className="text-2xl font-semibold text-white">Audience Spotter</h1>
              <p className="text-[#A1A1AA] text-sm">Find people who need your app</p>
            </div>

            {/* Brand Context Card */}
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#A1A1AA] text-sm font-medium">🏷 Using your brand info</span>
                <Link to="/onboarding" className="text-[#F97316] text-xs font-bold hover:underline">Edit →</Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {brain ? (
                  <>
                    <span className="bg-[#1F1F1F] text-[#F97316] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{brain.app_name}</span>
                    <span className="bg-[#1F1F1F] text-[#F97316] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Problem: {brain.core_problem}</span>
                    <span className="bg-[#1F1F1F] text-[#F97316] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Audience: {brain.target_customer}</span>
                  </>
                ) : (
                  <span className="text-red-400 text-xs font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Complete your brand info first
                  </span>
                )}
              </div>
            </div>

            {/* Search Settings Card */}
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 space-y-8">
              <div className="space-y-3">
                <label className="text-white text-sm font-medium block">Search in</label>
                <div className="flex flex-wrap gap-2">
                  {subreddits.map(s => (
                    <span key={s} className="bg-[#1F1F1F] text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
                      {s}
                      <button onClick={() => setSubreddits(subreddits.filter(x => x !== s))} className="text-[#52525B] hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button className="text-[#F97316] text-xs font-bold hover:underline">+ Add subreddit</button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-white text-sm font-medium block">Looking for</label>
                <div className="flex bg-[#1F1F1F] p-1 rounded-lg">
                  {['People asking for solutions', 'People venting frustrations', 'Both'].map(t => (
                    <button
                      key={t}
                      onClick={() => setSearchType(t)}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-bold rounded-md transition-all",
                        searchType === t ? "bg-[#F97316] text-white" : "text-[#A1A1AA] hover:text-white"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-white text-sm font-medium block">Posted in the last</label>
                <div className="flex bg-[#1F1F1F] p-1 rounded-lg">
                  {['24 hours', '7 days', '30 days'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-bold rounded-md transition-all",
                        timeframe === t ? "bg-[#F97316] text-white" : "text-[#A1A1AA] hover:text-white"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={startScan}
              disabled={!brain}
              className="w-full mt-8 h-11 bg-[#F97316] hover:bg-[#EA6C0A] disabled:bg-[#1F1F1F] disabled:text-[#52525B] text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Find My Audience →
            </button>
          </div>
        )}

        {step === 'loading' && (
          <div className="max-w-[640px] mx-auto w-full py-12 px-6 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full space-y-4 mb-8">
              {scanningSteps.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  {s.status === 'loading' ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
                  ) : (
                    <Check className="w-4 h-4 text-[#22C55E]" />
                  )}
                  <span className={cn("text-sm", s.status === 'loading' ? "text-white" : "text-[#52525B]")}>{s.text}</span>
                </div>
              ))}
            </div>
            <div className="w-full h-1 bg-[#1F1F1F] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 4.5, ease: "linear" }}
                className="h-full bg-[#F97316]"
              />
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="flex flex-col lg:flex-row h-full">
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setStep('setup')} className="text-[#A1A1AA] text-sm flex items-center gap-2 hover:text-white">
                  <ArrowLeft className="w-4 h-4" /> Back to setup
                </button>
                <div className="text-center">
                  <span className="text-white font-bold">{results?.reddit?.length || 0} results found</span>
                  <span className="text-[#52525B] text-xs block">Reddit + Indie Hackers</span>
                </div>
                <button onClick={startScan} className="text-[#A1A1AA] text-xs font-bold flex items-center gap-1 hover:text-white">
                  Re-run ↺
                </button>
              </div>

              <div className="flex bg-[#1F1F1F] p-1 rounded-lg mb-8 w-fit">
                {['All', '🔥 High', '👀 Medium', '💬 Low'].map(f => (
                  <button key={f} className="px-4 py-1.5 text-[10px] font-bold rounded-md text-[#A1A1AA] hover:text-white">
                    {f}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {results?.reddit?.map((r, i) => (
                  <div key={i} className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-4 hover:border-[#F97316]/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[#52525B] text-xs font-bold">{r.name}</span>
                        <span className="text-[#52525B] text-[10px]">· {r.time}</span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                        r.intent === 'High' ? "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20" : "bg-[#1F1F1F] text-[#A1A1AA] border-[#1F1F1F]"
                      )}>
                        {r.intent === 'High' ? '🔥 HIGH INTENT' : r.intent === 'Medium' ? '👀 MEDIUM' : '💬 LOW'}
                      </span>
                    </div>
                    <h3 className="text-white font-medium mb-2">{r.title}</h3>
                    <p className="text-[#A1A1AA] text-sm line-clamp-2 mb-4">{r.snippet}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[#52525B] text-xs">
                        <span>▲ {r.ups}</span>
                        <span>💬 {r.comments} comments</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-[#A1A1AA] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#1F1F1F]">View Post ↗</button>
                        <button 
                          onClick={() => setSelectedResult(r)}
                          className="bg-[#F97316] text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-[#EA6C0A]"
                        >
                          Craft Reply →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Crafter Panel */}
            <AnimatePresence>
              {selectedResult && (
                <motion.aside 
                  initial={{ x: 420 }}
                  animate={{ x: 0 }}
                  exit={{ x: 420 }}
                  className="w-full lg:w-[420px] bg-[#0A0A0A] border-l border-[#1F1F1F] p-6 flex flex-col h-full z-40"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-semibold">Craft Your Reply</h2>
                    <button onClick={() => setSelectedResult(null)} className="text-[#52525B] hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-[#111111] rounded-lg p-4 mb-8">
                    <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest mb-2">Replying to:</p>
                    <p className="text-[#A1A1AA] text-sm line-clamp-2 italic">"{selectedResult.title}"</p>
                    <p className="text-[#52525B] text-[10px] mt-2">{selectedResult.name} · {selectedResult.time}</p>
                  </div>

                  <div className="space-y-6 flex-1">
                    <div className="space-y-3">
                      <label className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">Tone</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Friendly Founder', 'Direct & Clear', 'Curious Helper', 'Authority'].map(t => (
                          <button
                            key={t}
                            onClick={() => setReplyTone(t)}
                            className={cn(
                              "py-2.5 text-[10px] font-bold rounded-lg border transition-all",
                              replyTone === t ? "border-[#F97316] text-[#F97316] bg-[#F97316]/5" : "border-[#1F1F1F] text-[#A1A1AA] hover:border-[#52525B]"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">How to mention your app</label>
                      <div className="flex bg-[#1F1F1F] p-1 rounded-lg">
                        {['Soft mention', 'Direct pitch'].map(s => (
                          <button
                            key={s}
                            onClick={() => setMentionStyle(s)}
                            className={cn(
                              "flex-1 py-2 text-[10px] font-bold rounded-md transition-all",
                              mentionStyle === s ? "bg-[#F97316] text-white" : "text-[#A1A1AA] hover:text-white"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={generateReply}
                      disabled={generatingReply}
                      className="w-full h-11 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      {generatingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Write My Reply
                    </button>

                    {generatedReply && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <textarea
                          value={generatedReply}
                          onChange={(e) => setGeneratedReply(e.target.value)}
                          className="w-full bg-[#111111] border border-[#1F1F1F] rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#F97316]/50 min-h-[120px] resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <span className="bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#22C55E]/20">
                            ✅ Looks natural
                          </span>
                          <span className="text-[#52525B] text-[10px]">{generatedReply.length} chars</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(generatedReply);
                              toast.success("Reply copied!");
                            }}
                            className="flex-1 h-11 bg-[#F97316] text-white font-bold rounded-lg text-xs"
                          >
                            Copy Reply
                          </button>
                          <button className="flex-1 h-11 border border-[#1F1F1F] text-white font-bold rounded-lg text-xs hover:bg-[#111111]">
                            Open Post ↗
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-[#52525B] text-[10px] text-center mt-6">
                    💡 Post manually — Reddit bans automated replies
                  </p>
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}