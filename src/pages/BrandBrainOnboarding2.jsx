"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Check, ArrowRight, Clock, PenTool } from 'lucide-react';
import ParticleBackground from '../components/landing/particlebackground';
import GridBackground from '../components/ui/grid-background';

const Tones = ["Professional", "Conversational", "Edgy & Bold", "Direct & No-BS"];
const Styles = ["Short & Punchy", "Storytelling", "Data-First", "Humor & Wit"];
const Platforms = ["Twitter / X", "LinkedIn", "Reddit", "Threads", "Indie Hackers"];
const Frequencies = ["1–3 times per week", "5 times per week", "Daily"];

export default function BrandBrainOnboarding2({ app_name, onComplete }) {
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
          : 'bg-bg-surface border-white/5 text-text-secondary hover:border-white/20'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative min-h-screen bg-bg-base text-white font-poppins overflow-hidden">
      <GridBackground />
      <ParticleBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-primary mb-3 block">Step 2 & 3</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">Refine your brand voice.</h1>
          <p className="text-text-secondary">We've prefilled these based on your niche. Tweak if needed.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-primary" />
                <label className="text-sm font-bold">Brand Tone</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {Tones.map(t => <Pill key={t} label={t} active={tone === t} onClick={() => setTone(t)} />)}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <PenTool className="w-4 h-4 text-primary" />
                <label className="text-sm font-bold">Writing Style</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {Styles.map(s => <Pill key={s} label={s} active={style === s} onClick={() => setStyle(s)} />)}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <label className="text-sm font-bold">Platforms</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {Platforms.map(p => <Pill key={p} label={p} active={selectedPlatforms.includes(p)} onClick={() => togglePlatform(p)} />)}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <label className="text-sm font-bold">Posting Frequency</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {Frequencies.map(f => <Pill key={f} label={f} active={frequency === f} onClick={() => setFrequency(f)} />)}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold block">Why is your product better? (optional)</label>
              <textarea
                rows={3}
                placeholder="e.g. Faster setup, cleaner UI, or cheaper pricing..."
                value={differentiator}
                onChange={(e) => setDifferentiator(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-bg-surface/50 border border-white/5 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder-text-secondary/30 resize-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold block">Target user pain points (optional)</label>
              <textarea
                rows={3}
                placeholder="e.g. 'spent too much on ads', 'no time to post'..."
                value={painPoints}
                onChange={(e) => setPainPoints(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-bg-surface/50 border border-white/5 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder-text-secondary/30 resize-none"
              />
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-lg transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              Generate first posts
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}