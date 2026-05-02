"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Shield, 
  Link2, 
  AlertTriangle, 
  Settings as SettingsIcon,
  Twitter,
  Linkedin,
  Hash,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";

export default function Settings() {
  const { user, logout } = useAuth();
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
      
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-white">Settings</h1>
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-6 max-w-2xl mx-auto w-full">
          {/* PROFILE SECTION */}
          <div className="bg-[#111111] border border-orange-500/40 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-white">Profile</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 block">
                  Name
                </label>
                <input
                  readOnly
                  value={getNameFromEmail(user?.email)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 block">
                  Email
                </label>
                <input
                  readOnly
                  value={user?.email || ''}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white"
                />
              </div>
            </div>
          </div>

          {/* ACCOUNT STATUS SECTION */}
          <div className="bg-[#111111] border border-orange-500/40 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-white">Account Status</h2>
            </div>
            
            <div className="space-y-4">
              <div className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border",
                isPaid ? "border-green-500/30 text-green-500 bg-green-500/10" : "border-orange-500/30 text-orange-500 bg-orange-500/10"
              )}>
                {isPaid ? "Lifetime Access" : "Free Tier"}
              </div>
              
              {!isPaid && (
                <button
                  onClick={() => navigate('/pre-purchase')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 border border-orange-500/40"
                >
                  Upgrade to Lifetime — $49
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* CONNECTED CHANNELS SECTION */}
          <div className="bg-[#111111] border border-orange-500/40 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Link2 className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-white">Connected Channels</h2>
            </div>
            
            <div className="space-y-3">
              {[
                { icon: Twitter, name: 'Twitter/X' },
                { icon: Linkedin, name: 'LinkedIn' },
                { icon: Hash, name: 'Reddit' }
              ].map((platform, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <platform.icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{platform.name}</span>
                  </div>
                  
                  <span className="text-[9px] uppercase font-bold text-orange-500 border border-orange-500/30 rounded px-1.5 py-0.5 bg-orange-500/10">
                    Coming Soon
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* DANGER ZONE SECTION */}
          <div className="bg-[#111111] border border-red-500/40 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="text-base font-bold text-white">Danger Zone</h2>
            </div>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-lg py-2.5 text-xs font-bold transition-all"
            >
              Delete My Account & Data
            </button>
          </div>
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
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg py-2.5 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2.5 text-xs font-bold transition-all"
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