"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Twitter, Globe, Zap, Layout } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../supabaseClient';
import Sidebar from '../../components/Sidebar';
import { cn } from "@/lib/utils";

const platforms = [
  { id: 'reddit', name: 'Reddit', desc: 'Value-first. Lead with insight.', icon: MessageSquare, color: '#FF4500', available: true },
  { id: 'twitter', name: 'X (Twitter)', desc: 'Short, viral, high-energy.', icon: Twitter, color: '#FFFFFF', available: true },
  { id: 'threads', name: 'Threads', desc: 'Conversational & personal.', icon: MessageSquare, color: '#FFFFFF', available: false, comingSoon: true },
  { id: 'ih', name: 'Indie Hackers', desc: 'Founder stories win here.', icon: Globe, color: '#0073b1', available: true },
  { id: 'ph', name: 'Product Hunt', desc: 'Make your launch land.', icon: Zap, color: '#da552f', available: false, comingSoon: true },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Professional + personal mix.', icon: Layout, color: '#0077b5', available: false, comingSoon: true },
];

export default function PostMaker() {
  const { user } = useAuth();
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
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
        </div>
      </main>
    </div>
  );
}