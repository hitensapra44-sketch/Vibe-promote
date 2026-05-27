"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Shield, 
  Link2, 
  AlertTriangle, 
  Twitter,
  Linkedin,
  MessageSquare,
  Zap,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const CHANNEL_ROWS = [
  { platformKey: 'Reddit', label: 'Reddit', Icon: MessageSquare },
  { platformKey: 'Product Hunt', label: 'Product Hunt', Icon: Zap },
  { label: 'Twitter/X', Icon: Twitter, comingSoon: true },
  { label: 'LinkedIn', Icon: Linkedin, comingSoon: true },
];

export default function Settings() {
  const { user, logout, plan } = useAuth();
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
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

        const { data: socialRows } = await supabase
          .from('social_accounts')
          .select('platform, username')
          .eq('user_id', user.id);
        setLinkedAccounts(socialRows ?? []);
      } catch (err) {
        console.error('Error fetching payment data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleDeleteAccount = async () => {
    try {
      // Sign out the user
      await supabase.auth.signOut();
      
      // Show success message
      // In a real implementation, you'd contact support for actual deletion
      setShowDeleteModal(false);
      navigate('/');
    } catch (err) {
      console.error('Error during account deletion:', err);
    }
  };

  const getNameFromEmail = (email) => {
    if (!email) return '';
    return email.split('@')[0];
  };

  const displayProfileName = () => {
    const meta = user?.user_metadata?.full_name;
    if (meta != null && String(meta).trim() !== '') return String(meta).trim();
    return getNameFromEmail(user?.email);
  };

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
            <h1 className="text-sm font-bold text-foreground">Settings</h1>
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* PROFILE SECTION */}
          <div className="bg-foreground/5 border border-orange-500/40 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-foreground/60" />
              <h2 className="text-sm font-bold text-foreground">Profile</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2 block">
                  Name
                </label>
                <input
                  readOnly
                  value={displayProfileName()}
                  className="w-full rounded-xl border border-foreground/5 bg-foreground/5 px-4 py-2.5 text-sm text-foreground"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2 block">
                  Email
                </label>
                <input
                  readOnly
                  value={user?.email || ''}
                  className="w-full rounded-xl border border-foreground/5 bg-foreground/5 px-4 py-2.5 text-sm text-foreground"
                />
              </div>
            </div>
          </div>

          {/* ACCOUNT STATUS SECTION */}
          <div className="bg-foreground/5 border border-orange-500/40 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-foreground/60" />
              <h2 className="text-sm font-bold text-foreground">Account Status</h2>
            </div>
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-foreground/10 bg-foreground/5 text-foreground/80">
                {isPaid ? "Lifetime Access" : "Free Tier"}
              </div>
              
              {!isPaid && (
                <button
                  type="button"
                  onClick={() => navigate('/pricing')}
                  className="w-full border border-foreground/10 bg-transparent hover:bg-foreground/5 text-foreground font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Upgrade
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* CONNECTED CHANNELS SECTION */}
          <div className="bg-foreground/5 border border-orange-500/40 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Link2 className="w-4 h-4 text-foreground/60" />
                <h2 className="text-sm font-bold text-foreground">Connected Channels</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/connected-accounts')}
                className="text-[10px] font-bold text-foreground/60 hover:text-foreground flex items-center gap-1.5 transition-colors sm:self-auto self-start bg-transparent"
              >
                Manage connections
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-3">
              {CHANNEL_ROWS.map((row) => {
                const Icon = row.Icon;
                const linked = row.platformKey
                  ? linkedAccounts.find((a) => a.platform === row.platformKey)
                  : null;

                return (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 p-4 rounded-xl border border-foreground/5 bg-foreground/5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 text-foreground/60 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-foreground/80 block">{row.label}</span>
                        {linked?.username ? (
                          <span className="text-xs text-foreground/60 truncate block">
                            @{linked.username.replace(/^@/, '')}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {row.comingSoon ? (
                      <span className="flex-shrink-0 text-[9px] uppercase font-bold text-foreground/60 border border-foreground/10 rounded px-1.5 py-0.5 bg-foreground/5">
                        Coming Soon
                      </span>
                    ) : linked ? (
                      <span className="flex-shrink-0 text-[9px] uppercase font-bold text-foreground/60 border border-foreground/10 rounded px-1.5 py-0.5 bg-foreground/5">
                        Connected
                      </span>
                    ) : (
                      <span className="flex-shrink-0 text-[9px] uppercase font-bold text-foreground/60 border border-foreground/10 rounded px-1.5 py-0.5 bg-foreground/5">
                        Not connected
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* DANGER ZONE SECTION */}
          <div className="bg-foreground/5 border border-red-500/40 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-bold text-foreground">Danger Zone</h2>
            </div>
            
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full border border-red-500/40 bg-transparent text-red-400 hover:bg-red-500/10 rounded-xl py-2.5 text-xs font-bold transition-colors"
            >
              Delete My Account & Data
            </button>
          </div>

          <footer className="pt-8 pb-6 border-t border-foreground/5 flex items-center justify-between">
            <p className="text-[10px] text-foreground/60 font-medium">
              Vibe Promote © 2026
            </p>
          </footer>
        </div>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
            className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-foreground/5 border border-red-500/20 rounded-2xl p-6 max-w-sm mx-auto w-full"
            >
              <div className="text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">Delete Account?</h3>
                  <p className="text-sm text-foreground/60">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 border border-foreground/10 bg-transparent text-foreground/80 hover:bg-foreground/5 rounded-lg py-2.5 text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="flex-1 border border-red-500/50 bg-transparent hover:bg-red-500/10 text-red-400 rounded-lg py-2.5 text-xs font-bold transition-colors"
                  >
                    Yes, Delete Everything
                  </button>
                </div>
                
                <p className="text-[10px] text-foreground/60 pt-2">
                  Note: Account deletion requires support confirmation
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}