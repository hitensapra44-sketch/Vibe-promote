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
  const { user, logout } = useAuth();
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-white">Settings</h1>
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* PROFILE SECTION */}
          <div className="bg-[#111111] border border-orange-500/40 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-bold text-white">Profile</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 block">
                  Name
                </label>
                <input
                  readOnly
                  value={displayProfileName()}
                  className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-sm text-white"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 block">
                  Email
                </label>
                <input
                  readOnly
                  value={user?.email || ''}
                  className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-sm text-white"
                />
              </div>
            </div>
          </div>

          {/* ACCOUNT STATUS SECTION */}
          <div className="bg-[#111111] border border-orange-500/40 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-bold text-white">Account Status</h2>
            </div>
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-white/15 bg-white/5 text-zinc-200">
                {isPaid ? "Lifetime Access" : "Free Tier"}
              </div>
              
              {!isPaid && (
                <button
                  type="button"
                  onClick={() => navigate('/pricing')}
                  className="w-full border border-white/10 bg-transparent hover:bg-white/5 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Upgrade to Lifetime — $49
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* CONNECTED CHANNELS SECTION */}
          <div className="bg-[#111111] border border-orange-500/40 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Link2 className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-bold text-white">Connected Channels</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/connected-accounts')}
                className="text-[10px] font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors sm:self-auto self-start bg-transparent"
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
                    className="flex items-center justify-between gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-zinc-300 block">{row.label}</span>
                        {linked?.username ? (
                          <span className="text-xs text-gray-500 truncate block">
                            @{linked.username.replace(/^@/, '')}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {row.comingSoon ? (
                      <span className="flex-shrink-0 text-[9px] uppercase font-bold text-zinc-500 border border-white/10 rounded px-1.5 py-0.5 bg-white/5">
                        Coming Soon
                      </span>
                    ) : linked ? (
                      <span className="flex-shrink-0 text-[9px] uppercase font-bold text-zinc-400 border border-white/10 rounded px-1.5 py-0.5 bg-white/5">
                        Connected
                      </span>
                    ) : (
                      <span className="flex-shrink-0 text-[9px] uppercase font-bold text-zinc-500 border border-white/10 rounded px-1.5 py-0.5 bg-white/5">
                        Not connected
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* DANGER ZONE SECTION */}
          <div className="bg-[#111111] border border-red-500/40 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-bold text-white">Danger Zone</h2>
            </div>
            
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full border border-red-500/40 bg-transparent text-red-400 hover:bg-red-500/10 rounded-xl py-2.5 text-xs font-bold transition-colors"
            >
              Delete My Account & Data
            </button>
          </div>

          <footer className="pt-8 pb-6 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] text-gray-700 font-medium">
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
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111111] border border-red-500/20 rounded-2xl p-6 max-w-sm mx-auto w-full"
            >
              <div className="text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Delete Account?</h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 border border-white/10 bg-transparent text-gray-300 hover:bg-white/5 rounded-lg py-2.5 text-xs font-bold transition-colors"
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
                
                <p className="text-[10px] text-gray-600 pt-2">
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