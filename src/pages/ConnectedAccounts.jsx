"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ConnectAccounts from '../components/results-tracker/ConnectAccounts';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { markTaskComplete } from '../components/TaskWidget';
import { Lock, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';

export default function ConnectedAccounts() {
  const { user, plan } = useAuth();
  const navigate = useNavigate();
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const { data: paymentData } = await supabase
          .from('user_payments')
          .select('payment_status')
          .eq('email', user.email)
          .maybeSingle();
        if (paymentData?.payment_status) setIsPaid(true);
      } catch (err) {
        console.error('Error fetching payment data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  const isFreeUser = plan === 'free';

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-foreground/5 bg-background flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-foreground">Connected Accounts</h1>
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full pb-24 flex flex-col items-center justify-center">
          {isFreeUser ? (
            /* Locked State for Free Users */
            <div className="max-w-3xl mx-auto py-12 w-full flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in duration-500">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-3xl font-bold text-foreground max-w-xl mx-auto leading-tight">
                  Access your social insights and marketing buddy now
                </h2>
                <p className="text-foreground/60 text-sm max-w-md mx-auto">
                  Upgrade to Pro to connect your accounts and track your performance in real-time.
                </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-6 w-full">
                {/* Box 1: Manually checking analytics */}
                <div className="bg-foreground/5 border border-foreground/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-5 h-5" />
                    <h3 className="font-bold text-foreground text-base">Manually checking analytics</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-foreground/60">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Hard to stay consistent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Most users rarely check analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Hard to know what strategy changes actually matter</span>
                    </li>
                  </ul>
                </div>

                {/* Box 2: With Vibe Promote */}
                <div className="bg-foreground/5 border border-orange-500/30 rounded-2xl p-6 space-y-4 bg-orange-500/[0.02]">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-bold text-foreground text-base">With Vibe Promote</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Analytics in one place</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Marketing buddy explains what worked and what didn’t</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Strategy suggestions based on analytics</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Active State for Starter/Pro Users */
            <div className="w-full space-y-8">
              <section className="bg-foreground/5 border border-orange-500/40 rounded-2xl p-6 space-y-2">
                <h2 className="text-xl font-bold text-foreground">Connect Accounts</h2>
                <p className="text-sm text-foreground/50">
                  Link your platforms to pull in posts and track performance.
                </p>
              </section>

              <ConnectAccounts
                onConnect={() => {
                  markTaskComplete(user.id, 'connect_reddit', supabase);
                  navigate('/dashboard/results-tracker');
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}