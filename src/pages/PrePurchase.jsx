import React, { useState, useEffect } from 'react';
import { logEvent } from "../lib/analytics";

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Check, Shield, Rocket, Gift, Heart } from 'lucide-react';

const benefits = [
  { icon: Gift, text: 'Free beta testing access' },
  { icon: Sparkles, text: 'First month premium free when app is ready' },
  { icon: Shield, text: 'Fully refundable – zero risk' },
  { icon: Heart, text: 'Helps the founder kick-start production' },
];

export default function PrePurchase() {
  // Track whether the user confirmed email after pre-purchase
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  // Initialize from localStorage if previously confirmed
  useEffect(() => {
    const v = localStorage.getItem('pre_purchase_email_confirmed');
    if (v === 'true') setIsEmailConfirmed(true);
  }, []);

  // Message to render after confirmation
  const confirmationText = `Thank you for pre pre-purchasing. As a pre-purchase customer, you will receive the following exclusive benefits:\n\n· Early beta access upon launch of Vibe Hype\n· Community access\n· Early access to full Agentic Mode\n· Unlimited Agentic Mode + priority support for the first month\n· Personal brand voice setup + upgraded analytics\n\nPlease note that all of the above features will be available for the first month after the app goes live.`;
  return (
    <div className="min-h-screen font-poppins flex flex-col bg-transparent">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border-muted">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center bg-primary">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-bold">Vibe Hype</span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg text-center"
        >
          {/* Glowing orb */}
          <div className="relative mx-auto w-20 h-20 mb-8">
            <div className="absolute inset-0 rounded-full opacity-10 blur-xl bg-primary" />
            <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-primary shadow-lg shadow-primary/25">
              <Rocket className="w-9 h-9 text-white" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3" style={{ letterSpacing: '-1px' }}>
            Pre-Purchase for Only{' '}
            <span className="text-primary">
              $1.99
            </span>
          </h1>
          <p className="text-lg mb-10 text-text-secondary">
            Be an early supporter and get exclusive perks.
          </p>

          {/* Benefits */}
          <div className="space-y-4 mb-10">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-border-muted bg-bg-surface text-left"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-base font-medium text-text-primary">{b.text}</span>
                <Check className="w-5 h-5 text-green-400 ml-auto flex-shrink-0" />
              </motion.div>
            ))}
          </div>

          
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full py-4 text-lg font-bold text-white rounded-lg bg-primary hover:bg-primary-hover transition-all duration-200 hover:-translate-y-1 shadow-lg shadow-primary/20"
            onClick={() => {
              logEvent("payment", "clicked", "pre-purchase button clicked");
              window.open('https://payments.cashfree.com/forms/VibePromote', '_blank');
            }}
          >
            Pre-Purchase Now – $1.99
          </motion.button>
          <p className="mt-4 text-sm text-text-secondary/60">
            Secure payment • Fully refundable • Cancel anytime
          </p>
        </motion.div>
      </div>
    </div>
  );
}
