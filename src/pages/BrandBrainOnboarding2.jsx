"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, Rocket, X, MessageSquare, Zap, Target, Check } from 'lucide-react';
import ParticleBackground from '../components/landing/particlebackground';
import GridBackground from '../components/ui/grid-background';

const BrandToneOptions = [
  { name: "Professional & credible", desc: "Trust me immediately" },
  { name: "Conversational & relatable", desc: "Sound like a real person" },
  { name: "Edgy & bold", desc: "Make people react" },
  { name: "Friendly & encouraging", desc: "Warm and approachable" },
  { name: "Direct & no-BS", desc: "Cut to the point" }
];

const WritingStyleOptions = [
  { name: "Short & punchy", desc: "Twitter-brained" },
  { name: "Long-form storytelling", desc: "Take them on a journey" },
  { name: "Data & proof first", desc: "Lead with numbers" },
  { name: "Humor & wit", desc: "Make them laugh" }
];

const CurrentStageOptions = [
  { name: "Pre-launch", desc: "Collecting waitlist signups" },
  { name: "Just launched", desc: "Finding first customers" },
  { name: "Early traction", desc: "Focused on growth" }
];

const PostingFrequencyOptions = ["1-2x", "3-4x", "5-7x", "Daily+"];

const PrimaryCTAOptions = [
  { name: "Visit my landing page", desc: "Drive traffic to your site" },
  { name: "Join my waitlist", desc: "Build your list" },
  { name: "Follow me for more", desc: "Grow your audience" },
  { name: "Something else", desc: "I'll type my own" }
];

export default function BrandBrainOnboarding2({ app_name, app_description, target_customer, core_problem, onComplete }) {
  const [unique_differentiator, setUniqueDifferentiator] = useState('');
  const [pain_phrases, setPainPhrases] = useState('');
  const [brand_tone, setBrandTone] = useState('');
  const [writing_style, setWritingStyle] = useState('');
  const [current_stage, setCurrentStage] = useState('');
  const [posting_frequency, setPostingFrequency] = useState('');
  const [primary_cta, setPrimaryCTA] = useState('');
  const [custom_cta, setCustomCTA] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!unique_differentiator.trim()) newErrors.unique_differentiator = "Required";
    if (!pain_phrases.trim()) newErrors.pain_phrases = "Required";
    if (!brand_tone) newErrors.brand_tone = "Required";
    if (!writing_style) newErrors.writing_style = "Required";
    if (!current_stage) newErrors.current_stage = "Required";
    if (!posting_frequency) newErrors.posting_frequency = "Required";
    if (!primary_cta) newErrors.primary_cta = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onComplete({
        unique_differentiator,
        pain_phrases,
        brand_tone,
        writing_style,
        current_stage,
        posting_frequency,
        primary_cta: primary_cta === "Something else" ? custom_cta : primary_cta
      });
    }
  };

  const OptionCard = ({ title, desc, selected, onClick, error }) => (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-2xl border text-left transition-all duration-200 ${
        selected 
          ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
          : error ? 'bg-red-500/5 border-red-500/50' : 'bg-bg-surface/50 border-border-muted hover:border-primary/30'
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      <p className={`text-sm font-bold mb-1 ${selected ? 'text-white' : 'text-text-secondary'}`}>{title}</p>
      <p className="text-[10px] text-text-secondary/60 leading-tight">{desc}</p>
    </button>
  );

  return (
    <div className="relative min-h-screen bg-bg-base text-white font-poppins overflow-hidden">
      <GridBackground />
      <ParticleBackground />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #b55933 0%, transparent 70%)' }} />
      
      <div className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-12">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary/40" />
            <div className="w-6 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-white/10" />
            <div className="w-2 h-2 rounded-full bg-white/10" />
          </div>
        </div>
        <button className="text-sm font-medium text-text-secondary hover:text-white transition-colors">
          Skip
        </button>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-primary mb-3 block">Step 2</span>
              <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight mb-4" style={{ letterSpacing: '-2px' }}>
                Now let's build <br />
                <span className="text-primary">your voice.</span>
              </h1>
              <p className="text-text-secondary text-lg">This is what stops the AI from sounding like every other bot.</p>
            </div>

            <div className="space-y-8">
              {/* Unique Differentiator */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-white block">Why your product is better</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Unlike Buffer, we find where your exact audience is and tell you what to say."
                  value={unique_differentiator}
                  onChange={(e) => setUniqueDifferentiator(e.target.value)}
                  className={`w-full px-6 py-4 rounded-2xl bg-bg-surface/50 border ${errors.unique_differentiator ? 'border-red-500' : 'border-border-muted'} text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder-text-secondary/30 resize-none`}
                />
              </div>

              {/* Pain Phrases */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-white block">Your targeted user pain</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 'posting into the void', 'nobody sees my stuff', 'I have no idea who my audience is'"
                  value={pain_phrases}
                  onChange={(e) => setPainPhrases(e.target.value)}
                  className={`w-full px-6 py-4 rounded-2xl bg-bg-surface/50 border ${errors.pain_phrases ? 'border-red-500' : 'border-border-muted'} text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder-text-secondary/30 resize-none`}
                />
              </div>

              {/* Brand Tone */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-white block">Brand Tone</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BrandToneOptions.map((opt) => (
                    <OptionCard 
                      key={opt.name} 
                      title={opt.name} 
                      desc={opt.desc} 
                      selected={brand_tone === opt.name}
                      onClick={() => setBrandTone(opt.name)}
                      error={errors.brand_tone}
                    />
                  ))}
                </div>
              </div>

              {/* Writing Style */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-white block">Writing Style</label>
                <div className="grid grid-cols-2 gap-3">
                  {WritingStyleOptions.map((opt) => (
                    <OptionCard 
                      key={opt.name} 
                      title={opt.name} 
                      desc={opt.desc} 
                      selected={writing_style === opt.name}
                      onClick={() => setWritingStyle(opt.name)}
                      error={errors.writing_style}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-lg transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-primary/20"
              >
                Generate my first post
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Live Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden lg:block sticky top-32"
          >
            <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent">
              <div className="bg-bg-surface rounded-[2.4rem] p-10 min-h-[500px] flex flex-col border border-white/5 shadow-2xl">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary/60">Your Brand Voice</span>
                    <h3 className="text-lg font-bold text-white">Shaping energy</h3>
                  </div>
                </div>

                <div className="flex-1 space-y-8">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">App</span>
                    <h2 className="text-2xl font-bold text-white">{app_name}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Tone</span>
                      <p className={`text-sm font-bold transition-all duration-300 ${brand_tone ? 'text-white' : 'text-white/10'}`}>
                        {brand_tone || 'Not selected'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Style</span>
                      <p className={`text-sm font-bold transition-all duration-300 ${writing_style ? 'text-white' : 'text-white/10'}`}>
                        {writing_style || 'Not selected'}
                      </p>
                    </div>
                  </div>

                  {unique_differentiator && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Unfair Advantage</span>
                      <p className="text-sm text-text-secondary/80 leading-relaxed">{unique_differentiator}</p>
                    </div>
                  )}

                  {pain_phrases && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Pain Points</span>
                      <div className="flex flex-wrap gap-2">
                        {pain_phrases.split(',').map((p, i) => (
                          <span key={i} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-text-secondary">
                            {p.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-10 flex items-center justify-between border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/40">Syncing with AI</span>
                  </div>
                  <Zap className="w-5 h-5 text-white/10" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}