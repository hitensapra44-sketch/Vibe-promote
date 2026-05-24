"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Check, ArrowRight, Clock, PenTool, Rocket } from 'lucide-react';
import ParticleBackground from '../components/landing/particlebackground';
import GridBackground from '../components/ui/grid-background';

const Tones = ["Professional", "Conversational", "Edgy & Bold", "Direct & No-BS"];
const Styles = ["Short & Punchy", "Storytelling", "Data-First", "Humor & Wit"];
const Platforms = ["Twitter / X", "LinkedIn", "Reddit", "Threads", "Indie Hackers"];
const Frequencies = ["1–3 times per week", "5 times per week", "Daily"];

export default function BrandBrainOnboarding2({ app_name, app_description, onComplete }) {
  const [tone, setTone] = useState(Tones[1]); // Default to Conversational
  const [style, setStyle] = useState(Styles[0]); // Default to Short & Punchy
  const [selectedPlatforms, setSelectedPlatforms] = useState(["Twitter / X", "LinkedIn"]);
  const [frequency, setFrequency] = useState(Frequencies[2]); // Default to Daily
  const [differentiator, setDifferentiator] = useState('');
  const [painPoints, setPainPoints] = useState('');

  const togglePlatform = (p) => {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleContinue = () => {
    onComplete({
      brand_tone: tone,
      writing_style: style,
      primary_platform: selectedPlatforms.join(', '),
      posting_frequency: frequency,
      unique_differentiator: differentiator,
      pain_phrases: painPoints,
      primary_cta: "Try " + app_name // Default CTA
    });
  };

  const Pill = ({ active, label, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
        active 
          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative min-h-screen bg-bg-base text-white font-poppins overflow-hidden flex flex-col">
      <GridBackground />
      <ParticleBackground />

      {/* Top Navigation */}
      <div className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-12">
        <div className="flex gap-2 items-center">
          {[1, 2].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === 2 ? 'w-6 bg-white' : 'w-2 bg-white/20'
              }`} 
            />
          ))}
        </div>
        <button 
          onClick={handleContinue}
          className="text-sm font-medium text-white/40 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
        >
          Skip
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-6 sm:px-16 py-12 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Left Column: Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div>
            <span className="text-xs tracking-[0.3em] text-white/40 uppercase font-medium mb-4 block">STEP 2</span>
            <h1 className="text-5xl font-bold text-white leading-tight mb-3">
              Post Maker Setup.
            </h1>
            <p className="text-white/40 text-base mb-10">
              We've prefilled these based on your niche. Edit if you see something wrong.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <label className="text-sm font-bold">Brand Tone</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {Tones.map(t => <Pill key={t} label={t} active={tone === t} onClick={() => setTone(t)} />)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-primary" />
                <label className="text-sm font-bold">Writing Style</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {Styles.map(s => <Pill key={s} label={s} active={style === s} onClick={() => setStyle(s)} />)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <label className="text-sm font-bold">Platforms</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {Platforms.map(p => <Pill key={p} label={p} active={selectedPlatforms.includes(p)} onClick={() => togglePlatform(p)} />)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <label className="text-sm font-bold">Posting Frequency</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {Frequencies.map(f => <Pill key={f} label={f} active={frequency === f} onClick={() => setFrequency(f)} />)}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold block">Why is your product better? (optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Faster setup, cleaner UI, or cheaper pricing..."
                value={differentiator}
                onChange={(e) => setDifferentiator(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 transition-all resize-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold block">Target user pain points (optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. 'spent too much on ads', 'no time to post'..."
                value={painPoints}
                onChange={(e) => setPainPoints(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 transition-all resize-none"
              />
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              Go to dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Right Column: Live Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden lg:flex flex-col gap-4 relative w-full"
        >
          {/* Top Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <Brain className="w-8 h-8 text-primary" />
            <div className="flex-1">
              <span className="text-[10px] tracking-widest text-white/30 uppercase font-bold block">YOUR APP BRAIN</span>
              <span className="text-white font-semibold text-sm">Building live</span>
            </div>
            <Rocket className="w-5 h-5 text-white/20" />
          </div>

          {/* Bottom Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <span className="text-[10px] tracking-widest text-white/30 uppercase font-bold mb-3 block">APP</span>
            
            {app_name ? (
              <h2 className="text-white text-3xl font-bold break-words">{app_name}</h2>
            ) : (
              <h2 className="text-white/20 italic text-3xl font-bold">Your app name</h2>
            )}

            {app_description ? (
              <p className="text-white/60 text-sm leading-relaxed mt-3 break-words">{app_description}</p>
            ) : (
              <p className="text-white/20 italic text-sm leading-relaxed mt-3">
                Your one-sentence description will appear here as Vibe Hype builds your launch brain in real time.
              </p>
            )}

            {/* Dynamic prefilled details */}
            <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Tone</span>
                <span className="text-primary font-semibold">{tone}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Style</span>
                <span className="text-primary font-semibold">{style}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Platforms</span>
                <span className="text-primary font-semibold truncate max-w-[180px]">{selectedPlatforms.join(', ')}</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}