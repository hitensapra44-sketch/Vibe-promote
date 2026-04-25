"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, 
  Loader2, 
  Zap,
  Copy, 
  Check, 
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { generateAICall } from '../lib/ai';
import { toast } from 'sonner';
import Sidebar from '../components/Sidebar';

export default function PostMaker() {
  const { user } = useAuth();
  const [brain, setBrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hooks, setHooks] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      const { data: paymentData } = await supabase
        .from('user_payments')
        .select('payment_status')
        .eq('email', user.email)
        .single();
      
      if (paymentData?.payment_status) {
        setIsPaid(true);
      }

      const { data } = await supabase
        .from('brand_brains')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) setBrain(data);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const generateHooks = async () => {
    if (!brain) return;
    setGenerating(true);
    
    const systemPrompt = `You are a viral content strategist for Twitter/X. Your goal is to generate 5 high-converting posts for a SaaS product.
    
    Rules:
    1. Use the founder's 'pain phrases' and 'brand tone'.
    2. Each post must be engaging and stop the scroll.
    3. No hashtags.
    4. No emojis unless the tone is casual.
    
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
      const parsed = JSON.parse(result);
      setHooks(parsed.hooks);
      toast.success("5 fresh posts generated! 🔥");
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error("Failed to generate posts. Try again.");
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
    <div className="min-h-screen bg-bg-base text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto w-full">
          <header className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold">Post Maker</h1>
              <p className="text-text-secondary">Stop the scroll with AI-powered viral content.</p>
            </div>
            {brain && (
              <button 
                onClick={generateHooks}
                disabled={generating}
                className="px-8 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {hooks.length > 0 ? 'Regenerate Posts' : 'Generate Posts'}
              </button>
            )}
          </header>

          {!brain ? (
            <div className="text-center py-20 bg-bg-surface border border-border-muted rounded-[2.5rem]">
              <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Brand Brain Missing</h2>
              <p className="text-text-secondary mb-8">You need to complete onboarding to use the Post Maker.</p>
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
                    <h2 className="text-xl font-bold">Writing viral posts...</h2>
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
                        className="group bg-transparent border border-primary/30 rounded-2xl p-6 hover:border-primary transition-all relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 pointer-events-none" />
                        <div className="flex items-start justify-between gap-4 relative z-10">
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
                      We'll use your brand voice to write 5 posts that actually get clicks.
                    </p>
                    <button 
                      onClick={generateHooks}
                      className="flex items-center gap-2 text-primary font-bold hover:underline"
                    >
                      Generate my first posts <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}