"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Zap,
  ArrowUpRight,
  MessageSquare
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    async function checkPayment() {
      if (!user) return;
      const { data } = await supabase
        .from('user_payments')
        .select('payment_status')
        .eq('email', user.email)
        .maybeSingle();
      if (data?.payment_status) setIsPaid(true);
    }
    checkPayment();
  }, [user]);

  const stats = [
    { label: 'Total Reach', value: '12.4K', change: '+14%', icon: TrendingUp },
    { label: 'Active Signals', value: '24', change: '+5', icon: Zap },
    { label: 'Engagement', value: '8.2%', change: '+2.1%', icon: MessageSquare },
    { label: 'Conversions', value: '142', change: '+12%', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex">
      <Sidebar isPaid={isPaid} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <header>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-zinc-400 mt-1">Welcome back! Here's what's happening with your brand.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                    {stat.change}
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111111] border border-white/5 p-8 rounded-2xl h-64 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-zinc-500" />
              </div>
              <h3 className="font-bold">Growth Chart</h3>
              <p className="text-sm text-zinc-500 mt-2">Connect your accounts to see detailed growth analytics.</p>
            </div>
            
            <div className="bg-[#111111] border border-white/5 p-8 rounded-2xl h-64 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-zinc-500" />
              </div>
              <h3 className="font-bold">Recent Signals</h3>
              <p className="text-sm text-zinc-500 mt-2">No new signals detected in the last 24 hours.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}