"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw,
  Zap,
  MessageSquare,
  Target,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { generateAICall } from '../lib/ai';
import { toast } from 'sonner';

export default function HookMaker() {
  const { user } = useAuth();
  const [brain, setBrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hooks, setHooks] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBrain() {
      if (!user) return;
      const { data } = await supabase
        .from('brand_brains')
        .select('*')
        .single();
      if (data) setBrain(data);
      setLoading(false);
    }
    fetchBrain();
  }, [user]);

  const generateHooks = async () => {
    if (!brain) return;
    setGenerating(true);
    
    const systemPrompt = `You are a viral content strategist for Twitter/X. Your goal is to generate 5 high-converting hooks for a SaaS product.
    A hook is the first line of a post that stops the scroll.
    
    Rules:
    1. Use the founder's 'pain phrases' and 'brand tone'.
    2. Each hook must be under 15 words.
    3. No hashtags.
    4. No emojis unless the tone is casual.
    5. Variety: One question, one bold statement, one 'how-to' angle, one 'mistake' angle, one 'secret' angle.
    
    Return ONLY a valid JSON object:
    {
      "hooks": [
        { "text": "...", "type": "The Question", "why": "Creates immediate curiosity" },
        { "text": "...", "type": "The Bold Claim", "why": "Challenges the status quo" },
        { "text": "...", "type": "The How-To", "why": "Promises a specific result" },
        { "text": "...", "type": "The Mistake", "why": "Triggers fear of missing out or failure" },
        { "text": "...", "type": "The Secret", "why": "Offers exclusive knowledge" }
      ]
    }`;

    try {
      const result = await generateAICall(systemPrompt, `Brand Brain:\n${JSON.stringify(brain)}`);
      setHooks(result.hooks);
      toast.success("5 fresh hooks generated! 🔥");
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error("Failed to generate hooks. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Copied to clipboard!");
  };

  if (loading) return <div className="min-h-screen bg-bg-base flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-bg-base text-white font-poppins p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 rounded-xl bg-bg-surface border border-border-muted hover:bg-bg-elevated transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Hook Maker</h1>
              <p className="text-text-secondary">Stop the scroll with AI-powered viral openers.</p>
            </div>
          </div>
          {brain && (
            <button 
              onClick={generateHooks}
              disabled={generating}
              className="px-8 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              {hooks.length > 0 ? 'Regenerate Hooks' : 'Generate Hooks'}
            </button>
          )}
        </header>

        {!brain ? (
          <div className="text-center py-20 bg-bg-surface border border-border-muted rounded-[2.5rem]">
            <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Brand Brain Missing</h2>
            <p className="text-text-secondary mb-8">You need to complete onboarding to use the Hook Maker.</p>
            <Link to="/onboarding" className="px-6 py-3 bg-primary rounded-xl font-bold">Start Onboarding</Link>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {generating ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <PenTool className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <h2 className="text-xl font-bold">Writing viral hooks...</h2>
                  <p className="text-text-secondary">Matching your brand voice and audience pain points.</p>
                </motion.div>
              ) : hooks.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {hooks.map((hook, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group bg-bg-surface border border-border-muted rounded-2xl p-6 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                              {hook.type}
                            </span>
                            <span className="text-[10px] text-text-secondary/60 font-medium italic">
                              — {hook.why}
                            </span>
                          </div>
                          <p className="text-lg font-medium text-white leading-relaxed">
                            "{hook.text}"
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy(hook.text, i)}
                          className="p-3 rounded-xl bg-bg-elevated border border-border-muted hover:border-primary/50 text-text-secondary hover:text-primary transition-all"
                        >
                          {copiedIndex === i ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-border-muted rounded-[2.5rem]">
                  <div className="w-16 h-16 rounded-2xl bg-bg-surface flex items-center justify-center mb-6">
                    <Lightbulb className="w-8 h-8 text-text-secondary/20" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Ready to go viral?</h2>
                  <p className="text-text-secondary max-w-xs mx-auto mb-8">
                    We'll use your brand voice to write 5 hooks that actually get clicks.
                  </p>
                  <button 
                    onClick={generateHooks}
                    className="flex items-center gap-2 text-primary font-bold hover:underline"
                  >
                    Generate my first hooks <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

const ArrowRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);