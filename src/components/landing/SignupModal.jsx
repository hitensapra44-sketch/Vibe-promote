import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { toast } from 'sonner';

export default function SignupModal({ isOpen, onClose, onJoined, onValidateEmail }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalEmail = onValidateEmail ? onValidateEmail(email) : email;
    if (!finalEmail) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: finalEmail,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) {
        toast.error(error.message || 'Failed to join. Please try again.');
        return;
      }

      toast.success('Welcome to the hype! Check your email to confirm. 🔥');
      setEmail('');
      if (onJoined) onJoined();
      onClose();
    } catch (err) {
      toast.error('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-bg-surface border border-border-muted rounded-2xl p-8 shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Join Vibe Promote</h2>
              <p className="text-text-secondary">Enter your email to get early access and start growing your SaaS.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3.5 rounded-xl bg-bg-elevated border border-border-muted text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
              >
                {submitting ? 'Joining...' : 'Get Started Free'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-text-secondary/60">
              No credit card required. Cancel anytime.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}