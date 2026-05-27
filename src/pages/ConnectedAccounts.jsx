"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ConnectAccounts from '../components/results-tracker/ConnectAccounts';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { markTaskComplete } from '../components/TaskWidget';

export default function ConnectedAccounts() {
  const { user } = useAuth();
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

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-foreground/5 bg-background flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-foreground">Connected Accounts</h1>
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full pb-24">
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
      </main>
    </div>
  );
}