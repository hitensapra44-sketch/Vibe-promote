import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { toast } from 'sonner';

export default function FooterSection({ joined, onJoined, onValidateEmail }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Enhanced Validation
    const finalEmail = onValidateEmail ? onValidateEmail(email) : email;
    if (!finalEmail) return;

    setSubmitting(true);
    try {
      // Use signInWithOtp for waitlist signup.
      const { error } = await supabase.auth.signInWithOtp({
        email: finalEmail,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) {
        if (error.status === 429) {
          toast.error('Too many attempts. Please try again later.');
        } else {
          toast.error(error.message || 'Failed to join waitlist. Please try again.');
        }
        return;
      }

      toast.success('You\'re on the hype list! Check your email to confirm. 🔥');
      setEmail('');
      if (onJoined) onJoined();
    } catch (err) {
      console.error('Waitlist error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer id="waitlist" className="font-poppins bg-transparent">
      {/* Email Signup */}
      <div className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ letterSpacing: '-1px' }}>
              Ready to Make Your App/Saas{' '}
              <span className="text-primary">
                Impossible to Ignore?
              </span>
            </h2>
            <p className="text-base mb-8 text-text-secondary">
              {joined ? "You're already on the list! Start your survey above." : "Get early access + free viral template pack"}
            </p>

            {!joined && (
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="your@email.com"
                  className="flex-1 px-5 py-3.5 rounded-lg bg-bg-surface border border-border-muted text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 text-base transition-colors"
                />
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 font-semibold text-white rounded-lg bg-primary hover:bg-primary-hover transition-all duration-200 hover:-translate-y-0.5"
                >
                  {submitting ? '...' : 'Start Free'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="border-t border-border-muted py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center bg-primary">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Vibe Promote</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-text-secondary">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Features
            </button>
            <button onClick={() => document.getElementById('howitworks')?.scrollIntoView({ behavior: 'smooth' })}>
              How it Works
            </button>
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              Pricing
            </button>
          </div>

          <p className="text-sm text-text-secondary/60">
            © 2026 Vibe Promote. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}