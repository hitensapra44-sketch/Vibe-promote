"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import Sidebar from '../components/Sidebar';
import { 
  Brain, 
  RefreshCw, 
  Target, 
  Zap, 
  MessageSquare, 
  Sparkles, 
  Globe, 
  PenTool, 
  Activity,
  Tag
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function BrandBrainView() {
  const { user } = useAuth();
  const [brain, setBrain] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
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

        const { data, error } = await supabase
          .from('brand_brains')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          setBrain(data);
        } else if (!error) {
          navigate('/onboarding');
        }
      } catch (err) {
        console.error("Error fetching brand brain:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const InfoCard = ({ label, value, icon: Icon, isTags = false }) => (
    <div className="bg-[#111111] border border-white/5 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="pl-1">
        {isTags ? (
          <div className="flex flex-wrap gap-2">
            {value?.split(',').map((tag, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-gray-300">
                {tag.trim()}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium text-white leading-relaxed">
            {value || 'Not set'}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-white">Brand Brain</h1>
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* Update Prompt */}
          <section className="rounded-2xl p-6 border border-white/5 bg-[#111111] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Have an App update?</h2>
              <p className="text-sm text-gray-500">Keep your Brand Brain in sync with your latest features.</p>
            </div>
            <button 
              onClick={() => navigate('/onboarding')}
              className="px-4 py-2 rounded-lg border border-orange-500 text-white text-xs font-bold hover:bg-orange-500/5 transition-all flex items-center gap-2 bg-transparent"
            >
              <RefreshCw className="w-3 h-3" />
              Update brand brain
            </button>
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-1">
              <InfoCard label="App Name" value={brain?.app_name} icon={Sparkles} />
            </div>
            <div className="md:col-span-2">
              <InfoCard label="App Description" value={brain?.app_description} icon={MessageSquare} />
            </div>
            
            <InfoCard label="Target Audience" value={brain?.target_customer} icon={Target} />
            <InfoCard label="Core Problem" value={brain?.core_problem} icon={Activity} />
            <InfoCard label="Unique Advantage" value={brain?.unique_differentiator} icon={Zap} />

            <div className="md:col-span-2">
              <InfoCard label="Pain Phrases" value={brain?.pain_phrases} icon={Tag} isTags={true} />
            </div>

            <InfoCard label="Brand Tone" value={brain?.brand_tone} icon={Brain} />
            <InfoCard label="Writing Style" value={brain?.writing_style} icon={PenTool} />
            <InfoCard label="Primary Platforms" value={brain?.primary_platform} icon={Globe} isTags={true} />
            
            <div className="md:col-span-3">
              <InfoCard label="Primary Call to Action" value={brain?.primary_cta} icon={Zap} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}