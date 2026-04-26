"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, 
  Loader2, 
  Zap,
  Copy, 
  Check, 
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Twitter,
  Globe,
  Layout
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { generateAICall } from '../lib/ai';
import { toast } from 'sonner';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";

const platforms = [
  { id: 'reddit', name: 'Reddit', desc: 'Value-first. Lead with insight.', icon: MessageSquare, color: '#FF4500', available: true },
  { id: 'twitter', name: 'X (Twitter)', desc: 'Short, viral, high-energy.', icon: Twitter, color: '#FFFFFF', available: false, comingSoon: true },
  { id: 'threads', name: 'Threads', desc: 'Conversational & personal.', icon: MessageSquare, color: '#FFFFFF', available: false, comingSoon: true },
  { id: 'ih', name: 'Indie Hackers', desc: 'Founder stories win here.', icon: Globe, color: '#0073b1', available: true },
  { id: 'ph', name: 'Product Hunt', desc: 'Make your launch land.', icon: Zap, color: '#da552f', available: true },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Professional + personal mix.', icon: Layout, color: '#0077b5', available: true },
];

const formats = [
  { 
    id: 'struggle', 
    name: 'The Relatable Struggle', 
    desc: 'I was X, until I did Y', 
    traction: 'High', 
    engagement: 78,
    why: 'People comment because they\'ve been there too'
  },
  { 
    id: 'hot-take', 
    name: 'Hot Take + Proof', 
    desc: 'Unpopular opinion: [your insight]', 
    traction: 'High', 
    engagement: 85,
    why: 'Controversial hooks drive 3x more replies'
  },
  { 
    id: 'learned', 
    name: 'What I Learned After Z', 
    desc: 'After [milestone], here\'s what actually worked', 
    traction: 'Medium', 
    engagement: 62,
    why: 'Authority + story = shares'
  },
];

export default function PostMaker() {
  const { user } = useAuth();
  const [brain, setBrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('platform'); // 'platform', 'format', 'output'
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [post, setPost] = useState(null);
  const [tone, setTone] = useState('Authentic Founder');
  const [context, setContext] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  
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

  const generatePost = async () => {
    setStep('output');
    setGenerating(true);
    
    const systemPrompt = `You are a viral content strategist for ${selectedPlatform.name}. 
    Format: ${selectedFormat.name}. Tone: ${tone}.
    Context: ${context}.
    
    Brand Brain: ${JSON.stringify(brain)}
    
    Return ONLY a valid JSON object:
    {
      "title": "...",
      "body": "..."
    }`;

    try {
      const result = await generateAICall(systemPrompt, "Generate the post now.");
      const parsed = JSON.parse(result);
      setPost(parsed);
      supabase.rpc('increment_posts_generated', { user_uuid: user.id });
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error("Failed to generate post.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#F97316] animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8">
        <div className="max-w-[720px] mx-auto w-full">
          
          {step === 'platform' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-12">
                <h1 className="text-2xl font-semibold text-white">Post Maker</h1>
                <p className="text-[#A1A1AA] text-sm">Where are you posting today?</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    disabled={p.comingSoon}
                    onClick={() => setSelectedPlatform(p)}
                    className={cn(
                      "relative p-6 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-3",
                      p.comingSoon ? "opacity-40 cursor-not-allowed bg-[#111111] border-[#1F1F1F]" : 
                      selectedPlatform?.id === p.id ? "bg-[#F97316]/5 border-[#F97316]" : "bg-[#111111] border-[#1F1F1F] hover:border-[#F97316]/30"
                    )}
                  >
                    {p.comingSoon && (
                      <span className="absolute top-2 right-2 bg-[#1F1F1F] text-[#52525B] text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Coming Soon</span>
                    )}
                    <p.icon className={cn("w-6 h-6", selectedPlatform?.id === p.id ? "text-[#F97316]" : "text-white")} />
                    <div>
                      <p className={cn("text-sm font-bold", selectedPlatform?.id === p.id ? "text-[#F97316]" : "text-white")}>{p.name}</p>
                      <p className="text-[#A1A1AA] text-[10px] mt-1">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {selectedPlatform && (
                <button
                  onClick={() => setStep('format')}
                  className="w-full h-11 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  Continue with {selectedPlatform.name} →
                </button>
              )}
            </div>
          )}

          {step === 'format' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <button onClick={() => setStep('platform')} className="text-[#A1A1AA] text-sm flex items-center gap-2 hover:text-white mb-8">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-white">What's working on {selectedPlatform.name} right now</h2>
                <p className="text-[#A1A1AA] text-sm">Formats getting traction in your niche</p>
              </div>

              <div className="space-y-4 mb-12">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFormat(f)}
                    className={cn(
                      "w-full p-5 rounded-xl border text-left transition-all flex flex-col lg:flex-row justify-between gap-6",
                      selectedFormat?.id === f.id ? "bg-[#F97316]/5 border-[#F97316]" : "bg-[#111111] border-[#1F1F1F] hover:border-[#F97316]/30"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-bold text-white">{f.name}</h3>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                          f.traction === 'High' ? "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20" : "bg-[#1F1F1F] text-[#A1A1AA] border-[#1F1F1F]"
                        )}>
                          {f.traction === 'High' ? '🔥 High Traction' : '👀 Medium'}
                        </span>
                      </div>
                      <p className="text-[#A1A1AA] text-sm mb-4">{f.why}</p>
                      
                      {/* Skeleton Preview */}
                      <div className="bg-[#1A1A1A] rounded-lg p-4 space-y-2 border border-[#1F1F1F]">
                        <div className="h-2 bg-[#1F1F1F] rounded w-3/4" />
                        <div className="h-2 bg-[#1F1F1F] rounded w-full" />
                        <div className="h-2 bg-[#1F1F1F] rounded w-1/2" />
                      </div>
                    </div>
                    
                    <div className="lg:w-32 flex flex-col justify-center">
                      <p className="text-[10px] text-[#52525B] font-bold uppercase tracking-widest mb-2">Engagement</p>
                      <div className="w-full h-1 bg-[#1F1F1F] rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-[#F97316]" style={{ width: `${f.engagement}%` }} />
                      </div>
                      <p className="text-xs font-bold text-white">{f.engagement}%</p>
                    </div>
                  </button>
                ))}
              </div>

              {selectedFormat && (
                <button
                  onClick={generatePost}
                  className="w-full h-11 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  Generate My Post →
                </button>
              )}
            </div>
          )}

          {step === 'output' && (
            <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Left Column - Controls */}
              <div className="lg:w-[280px] space-y-8">
                <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-4">
                  <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest mb-3">Brand Context</p>
                  <p className="text-white text-xs font-bold truncate">{brain?.app_name}</p>
                  <p className="text-[#A1A1AA] text-[10px] mt-1 line-clamp-2">{brain?.core_problem}</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">Tone</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Authentic Founder', 'Educational', 'Punchy / Bold', 'Conversational'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={cn(
                          "py-2.5 text-[10px] font-bold rounded-lg border transition-all",
                          tone === t ? "border-[#F97316] text-[#F97316] bg-[#F97316]/5" : "border-[#1F1F1F] text-[#A1A1AA] hover:border-[#52525B]"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-widest">Anything to highlight?</label>
                  <input
                    type="text"
                    placeholder="e.g. 'just hit 100 users'..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full bg-[#111111] border border-[#1F1F1F] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F97316]/50 placeholder-[#52525B]"
                  />
                </div>

                <button
                  onClick={generatePost}
                  disabled={generating}
                  className="w-full h-11 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Post
                </button>
              </div>

              {/* Right Column - Output */}
              <div className="flex-1 space-y-6">
                <AnimatePresence mode="wait">
                  {generating ? (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]"
                    >
                      <Loader2 className="w-8 h-8 text-[#F97316] animate-spin mb-4" />
                      <h3 className="text-lg font-bold">Writing your post...</h3>
                      <p className="text-[#A1A1AA] text-sm">Matching your brand voice and {selectedPlatform.name} vibe.</p>
                    </motion.div>
                  ) : post ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Platform Preview Card */}
                      <div className={cn(
                        "bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden border-l-2",
                        selectedPlatform.id === 'reddit' ? "border-l-[#FF4500]" : 
                        selectedPlatform.id === 'ih' ? "border-l-[#0073b1]" : "border-l-[#da552f]"
                      )}>
                        <div className="p-4 border-b border-[#1F1F1F] flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#1F1F1F] flex items-center justify-center">
                            <selectedPlatform.icon className="w-3 h-3 text-[#52525B]" />
                          </div>
                          <span className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest">
                            {selectedPlatform.id === 'reddit' ? 'r/SaaS' : selectedPlatform.name} • Posted by u/you
                          </span>
                        </div>
                        <div className="p-6 space-y-4">
                          <h3 className="text-lg font-bold text-white">{post.title}</h3>
                          <p className="text-[#A1A1AA] text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>
                        </div>
                        <div className="px-6 py-3 bg-[#1A1A1A] flex items-center gap-4 text-[#52525B] text-[10px] font-bold">
                          <span>▲ 0</span>
                          <span>💬 0 comments</span>
                          <span>🔗 Share</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                          <span className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest">{post.body.length} chars</span>
                        </div>
                      </div>

                      <div className="bg-[#111111] border border-[#1F1F1F] border-l-2 border-l-[#F97316] p-4 rounded-lg">
                        <p className="text-[#A1A1AA] text-xs leading-relaxed">
                          <span className="text-white font-bold">💡 Tip:</span> Post between 9–11AM EST Tuesday for best reach. Don't add your link in the post — put it in the first comment after posting.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${post.title}\n\n${post.body}`);
                            toast.success("Post copied!");
                          }}
                          className="flex-1 h-11 bg-[#F97316] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2"
                        >
                          <Copy className="w-4 h-4" /> Copy Post
                        </button>
                        <button onClick={generatePost} className="flex-1 h-11 border border-[#1F1F1F] text-white font-bold rounded-lg text-xs hover:bg-[#111111]">
                          Regenerate ↺
                        </button>
                        <button onClick={() => setStep('format')} className="flex-1 h-11 border border-[#1F1F1F] text-white font-bold rounded-lg text-xs hover:bg-[#111111]">
                          Try Different Format
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}