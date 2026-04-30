"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { 
  Brain, 
  Target, 
  PenLine, 
  BarChart2, 
  Sparkles, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [brain, setBrain] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkBrain() {
      if (!user) return;
      const { data } = await supabase
        .from('brand_brains')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setBrain(data);
      }
      setLoading(false);
    }
    checkBrain();
  }, [user]);

  const actions = [
    {
      title: "Brand Brain",
      desc: "Your app's marketing DNA",
      icon: Brain,
      path: "/brand-brain",
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    },
    {
      title: "User Finder",
      desc: "Find where your buyers hang out",
      icon: Target,
      path: "/audience-spotter",
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    {
      title: "Post Maker",
      desc: "Generate viral content in seconds",
      icon: PenLine,
      path: "/post-maker",
      color: "text-orange-400",
      bg: "bg-orange-400/10"
    },
    {
      title: "Analytics",
      desc: "Track what's actually working",
      icon: BarChart2,
      path: "/dashboard/results-tracker",
      color: "text-green-400",
      bg: "bg-green-400/10"
    }
  ];

  if (loading) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.email?.split('@')[0]}
        </h1>
        <p className="text-zinc-400">Ready to grow {brain?.app_name || 'your app'} today?</p>
      </header>

      {!brain && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
              <Zap className="w-5 h-5 text-orange-500" />
              Complete your setup
            </h2>
            <p className="text-zinc-400">You haven't created your Brand Brain yet. Let's fix that.</p>
          </div>
          <button 
            onClick={() => navigate('/onboarding')}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all flex items-center gap-2"
          >
            Start Onboarding
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={() => navigate(action.path)}
            className="group bg-[#111111] border border-white/5 rounded-2xl p-6 text-left hover:border-white/10 transition-all hover:-translate-y-1"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", action.bg)}>
              <action.icon className={cn("w-6 h-6", action.color)} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{action.title}</h3>
            <p className="text-sm text-zinc-500 mb-4">{action.desc}</p>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">
              Open <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-white">Need a strategy?</h2>
        <p className="text-zinc-400 max-w-md">
          Ask your Marketing Co-pilot for specific advice based on your brand's DNA.
        </p>
        <button 
          onClick={() => navigate('/marketing-buddy')}
          className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-all"
        >
          Talk to Co-pilot
        </button>
      </div>
    </div>
  );
}