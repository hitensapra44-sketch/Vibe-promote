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
  Layout,
  PenLine,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { generateAICall } from '../../lib/ai';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import Sidebar from '../../components/Sidebar';

const platforms = [
  { id: 'reddit', name: 'Reddit', desc: 'Value-first. Lead with insight.', icon: MessageSquare, color: '#FF4500', available: true },
  { id: 'twitter', name: 'X (Twitter)', desc: 'Hook-first. Punchy and direct.', icon: Twitter, color: '#FFFFFF', available: true },
  { id: 'threads', name: 'Threads', desc: 'Conversational & personal.', icon: MessageSquare, color: '#FFFFFF', available: true },
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
  const [step, setStep] = useState('platform');
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
      try {
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
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const generatePost = async () => {
    if (!brain) return;
    setStep('output');
    setGenerating(true);
    
    const systemPrompt = `You are a real founder writing for ${selectedPlatform?.name || 'social media'}.
    Format: ${selectedFormat?.name}. Tone: ${tone}.
    Context: ${context}.
    
    Structure the post with a strong hook, relatable story, and clear call to action.`;

    const userMessage = `Write the post now. Return only the post text.`;

    try {
      const result = await generateAICall(systemPrompt, userMessage, user?.id);
      setPost(result);
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error("Something went wrong generating your post.");
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
                    onClick={() => setSelectedPlatform(p)}
                    className={cn(
                      "relative p-6 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-3 bg-transparent",
                      selectedPlatform?.id === p.id ? "bg-[#F97316]/5 border-[#F97316]" : "bg-[#111111] border-[#1F1F1F] hover:border-[#F97316]/30"
                    )}
                  >
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
              <button onClick={() => setStep('platform')} className="text-[#A1A1AA] text-sm flex items-center gap-2 hover:text-white mb-8 bg-transparent">
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
                      "w-full p-5 rounded-xl border text-left transition-all flex flex-col lg:flex-row justify-between gap-6 bg-transparent",
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
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <button onClick={() => setStep('format')} className="text-[#A1A1AA] text-sm flex items-center gap-2 hover:text-white mb-8 bg-transparent">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden p-6">
                {generating ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-8 h-8 text-[#F97316] animate-spin mb-4" />
                    <p className="text-white font-bold">Writing your post...</p>
                  </div>
                ) : post ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F]">
                      <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{post}</p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(post);
                          toast.success("Copied to clipboard!");
                        }}
                        className="flex-1 h-11 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-bold rounded-lg flex items-center justify-center gap-2"
                      >
                        <Copy className="w-4 h-4" /> Copy Post
                      </button>
                      <button 
                        onClick={generatePost}
                        className="h-11 px-4 border border-[#1F1F1F] text-white rounded-lg hover:bg-white/5 transition-all bg-transparent"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}