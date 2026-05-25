"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, Twitter, Globe, Zap, Layout, Lock, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../supabaseClient';
import Sidebar from '../../components/Sidebar';
import { cn } from "@/lib/utils";
import { usePlan } from '../../lib/usePlan';
import { useUsage } from '../../lib/useUsage';

const platforms = [
  { id: 'reddit', name: 'Reddit', desc: 'Value-first. Lead with insight.', icon: MessageSquare, color: '#FF4500', available: true },
  { id: 'twitter', name: 'X (Twitter)', desc: 'Short, viral, high-energy.', icon: Twitter, color: '#FFFFFF', available: true },
  { id: 'threads', name: 'Threads', desc: 'Conversational & personal.', icon: MessageSquare, color: '#FFFFFF', available: false, comingSoon: true },
  { id: 'ih', name: 'Indie Hackers', desc: 'Founder stories win here.', icon: Globe, color: '#0073b1', available: true },
  { id: 'ph', name: 'Product Hunt', desc: 'Make your launch land.', icon: Zap, color: '#da552f', available: false, comingSoon: true },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Professional + personal mix.', icon: Layout, color: '#0077b5', available: false, comingSoon: true },
];

export default function PostMaker() {
  const { user, plan } = useAuth();
  const { limits } = usePlan();
  const { used: postsUsed } = useUsage('post_maker');
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const navigate = useNavigate();

  const isLocked = limits.postMaker !== "unlimited" && postsUsed >= limits.postMaker;

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
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const handleContinue = () => {
    if (!selectedPlatform) return;
    if (selectedPlatform.id === 'reddit') {
      navigate('/post-maker/reddit');
    } else if (selectedPlatform.id === 'twitter') {
      navigate('/post-maker/x');
    } else if (selectedPlatform.id === 'ih') {
      navigate('/post-maker/indiehackers');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8">
        <div className="max-w-[720px] mx-auto w-full">
          
          {/* Tier Usage Limits UI */}
          <div className="mb-8 flex items-center justify-between bg-[#111111] border border-white/5 rounded-xl px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {plan === 'free' ? 'Free Tier' : plan === 'starter' ? 'Starter Tier' : 'Pro Tier'} Usage:
              </span>
              <span className="text-sm font-bold text-orange-500">
                {limits.postMaker === 'unlimited' ? 'Unlimited' : `${postsUsed}/${limits.postMaker} posts`}
              </span>
            </div>
            {limits.postMaker !== 'unlimited' && (
              <div className="w-32 bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all duration-300" 
                  style={{ width: `${Math.min(100, (postsUsed / limits.postMaker) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {isLocked ? (
            /* TASK 4 — Post Maker Locked State */
            <div className="animate-in fade-in duration-500 text-center py-12 space-y-12">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-3xl font-bold text-white max-w-xl mx-auto leading-tight">
                  Vibe Promote makes posts using viral formats and your brand voice to help you get results, not bans.
                </h2>
                <p className="text-zinc-400 text-sm max-w-md mx-auto">Upgrade to access this feature again and unlock unlimited high-converting posts.</p>
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
                {/* Box 1: Making posts manually */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-5 h-5" />
                    <h3 className="font-bold text-white text-base">Making posts manually</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-zinc-400">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Don’t know where to start</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Takes forever to make a post</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Often gets little engagement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>AI tools sound generic</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>No viral templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Doesn’t deeply understand your brand</span>
                    </li>
                  </ul>
                </div>

                {/* Box 2: Making posts with Vibe Promote */}
                <div className="bg-[#111111] border border-orange-500/30 rounded-2xl p-6 space-y-4 bg-orange-500/[0.02]">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-bold text-white text-base">Making posts with Vibe Promote</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-zinc-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>4 clicks away from a strong post</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Viral post formats</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Higher chance of engagement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Sounds like your brand, not generic AI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Understands your brand voice</span>
                    </li>
                  </ul>
                </div>
              </div>

              <p className="text-zinc-500 text-sm font-medium">
                ⚡ 100+ app founders made posts today in seconds, not hours
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-12">
                <h1 className="text-2xl font-semibold text-white">Post Maker</h1>
                <p className="text-[#A1A1AA] text-sm">Where are you posting today?</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    disabled={!p.available}
                    onClick={() => setSelectedPlatform(p)}
                    className={cn(
                      "relative p-6 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-3 bg-transparent",
                      !p.available ? "opacity-40 cursor-not-allowed bg-[#111111] border-[#1F1F1F]" : 
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
                  onClick={handleContinue}
                  className="w-full h-11 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  Continue with {selectedPlatform.name} →
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}