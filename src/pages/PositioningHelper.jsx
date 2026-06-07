"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, RefreshCw, Target, Zap, ShieldCheck, Quote, Brain, AlertCircle, Hash, TrendingUp } from 'lucide-react';
import { generateAICall } from '../lib/ai';
import { cn } from "@/lib/utils";

export default function PositioningHelper({ appData, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [aiPositioning, setAiPositioning] = useState(null);
  const [error, setError] = useState(null);
  const [selectedChannels, setSelectedChannels] = useState(['Reddit', 'X', 'Threads']);

  const generatePositioning = async () => {
    if (!appData) return;
    
    setLoading(true);
    setError(null);

    const systemPrompt = `You are a world-class SaaS positioning strategist and growth advisor. You have 5 proven positioning frameworks. Silently pick the ONE that best fits the brand data. Never name the framework. Just deliver the result.

FRAMEWORKS:
1. Pain Agitator — Lead with the exact painful situation. Best for: tools solving clear daily frustration.
2. Category Creator — Position as a new category. Best for: genuinely novel tools.
3. Outcome Promise — Lead with the transformation the user gets. Best for: tools with measurable ROI.
4. Enemy Framing — Name the broken old way, position product as antidote. Best for: replacing expensive incumbents.
5. Niche Authority — The only tool for one specific person type. Best for: hyper-targeted tools.

SELECTION:
- Daily friction → Pain Agitator
- No clear competitor → Category Creator
- Obvious ROI → Outcome Promise
- Clear old-way replaced → Enemy Framing
- Very specific ICP → Niche Authority

Return ONLY a valid JSON object. No markdown. No backticks. No explanation.

{
  "suggestedTagline": "5-8 word tagline in the brand tone",
  "positioningStatement": "2-3 sentences in chosen framework style. Direct, specific, no fluff.",
  "targetAudience": "Narrow one-line ICP. NOT generic like businesses or teams.",
  "coreProblemSolved": "One sentence: the exact pain this product eliminates.",
  "coreValue": "One sentence: the single most valuable thing this product gives the user.",
  "bestCommunities": [
    { "name": "r/subredditname or community name", "reason": "One sentence why this is goldmine for the ICP" },
    { "name": "...", "reason": "..." },
    { "name": "...", "reason": "..." },
    { "name": "...", "reason": "..." },
    { "name": "...", "reason": "..." }
  ],
  "audienceKeywords": ["keyword people actually use when feeling this pain", "keyword", "keyword", "keyword", "keyword"],
  "recommendedGrowthChannel": {
    "channel": "one of: Reddit, X, Threads, Indie Hackers",
    "explanation": "2-3 sentences why this channel beats the others for this specific ICP and problem. Be specific to this product, not generic."
  }
}

Brand data: ${JSON.stringify(appData)}`;

    try {
      const result = await generateAICall(systemPrompt, "Generate the positioning now.", null, 'onboarding');
      const clean = result.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setAiPositioning(parsed);
    } catch (err) {
      console.error("Generation Error:", err);
      setError("Failed to analyze positioning. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePositioning();
  }, [appData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-poppins text-foreground">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full bg-[#F97316]/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-foreground/5 border border-[#F97316]/30 flex items-center justify-center">
            <Brain className="w-10 h-10 text-[#F97316] animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing your positioning...</h2>
        <p className="text-zinc-500">Our elite strategist is crafting your unique market position.</p>
      </div>
    );
  }

  if (error || !aiPositioning) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-poppins text-foreground">
        <AlertCircle className="w-12 h-12 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
        <p className="text-zinc-500 mb-8">{error}</p>
        <button 
          onClick={generatePositioning}
          className="flex items-center gap-2 px-8 py-4 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#9e4a2a] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  const Section = ({ label, icon: Icon, children, color = "text-[#F97316]" }) => (
    <div className="py-6 border-b border-foreground/10 last:border-0">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className={`w-4 h-4 ${color}`} />}
        <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
          {label}
        </label>
      </div>
      <div className="text-foreground text-sm leading-relaxed font-medium">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F97316]/10 border border-[#F97316]/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#F97316]" />
            <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-widest">Expert Analysis Complete</span>
          </motion.div>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4" style={{ letterSpacing: '-1px' }}>
            Your Sharpest Market Position
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
            We've stripped away the fluff to find the exact words that make your audience pay attention.
          </p>
        </header>

        <div className="max-w-3xl mx-auto">
          <div className="bg-foreground/5 border border-[#F97316]/30 rounded-lg p-8 flex flex-col relative">
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Confidence</span>
                <span className="text-sm font-bold text-[#F97316]">92%</span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="mb-8 p-6 rounded-lg bg-orange-50 border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <Quote className="w-4 h-4 text-[#F97316]" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#F97316]">Suggested Tagline</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground italic">
                  "{aiPositioning.suggestedTagline}"
                </h3>
                <button
                  onClick={generatePositioning}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#F97316] hover:text-[#9e4a2a] transition-colors bg-transparent border-none cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              </div>

              <Section label="Positioning Statement" icon={Target}>
                {aiPositioning.positioningStatement}
              </Section>
              
              <Section label="The Real Audience" icon={Zap}>
                {aiPositioning.targetAudience}
              </Section>

              <Section label="Core Value" icon={ShieldCheck}>
                {aiPositioning.coreValue}
              </Section>

              <Section label="Best Communities" icon={Zap}>
                <ol className="list-decimal list-inside space-y-2">
                  {aiPositioning.bestCommunities?.map((comm, idx) => (
                    <li key={idx} className="text-sm text-foreground">
                      <span className="font-bold">{comm.name}</span> — <span className="text-zinc-500">{comm.reason}</span>
                    </li>
                  ))}
                </ol>
              </Section>

              <Section label="Audience Keywords" icon={Hash}>
                <div className="flex flex-wrap gap-2">
                  {aiPositioning.audienceKeywords?.map((kw, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-xs text-foreground/80">
                      {kw}
                    </span>
                  ))}
                </div>
              </Section>

              <Section label="Recommended Growth Channel" icon={TrendingUp}>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {['Reddit', 'X', 'Threads', 'Indie Hackers'].map((channel) => {
                      const isSelected = selectedChannels.includes(channel);
                      const isTop = aiPositioning.recommendedGrowthChannel?.channel?.toLowerCase() === channel.toLowerCase();
                      return (
                        <button
                          key={channel}
                          onClick={() => {
                            setSelectedChannels(prev => 
                              prev.includes(channel) 
                                ? prev.filter(c => c !== channel) 
                                : [...prev, channel]
                            );
                          }}
                          className={cn(
                            "relative px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                            isSelected 
                              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                              : 'bg-foreground/5 border-foreground/10 text-foreground/60 hover:border-foreground/20'
                          )}
                        >
                          {channel}
                          {isTop && (
                            <span className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider bg-white text-primary rounded-md">
                              Top
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="p-4 rounded-lg bg-foreground/5 border border-foreground/10">
                    <p className="text-xs font-bold text-foreground mb-1">
                      Why {aiPositioning.recommendedGrowthChannel?.channel}?
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {aiPositioning.recommendedGrowthChannel?.explanation}
                    </p>
                  </div>
                </div>
              </Section>
            </div>

            <button
              onClick={() => onComplete({ type: 'ai', data: { ...aiPositioning, selectedChannels } })}
              className="mt-8 w-full py-5 rounded-md bg-[#F97316] hover:bg-[#9e4a2a] text-white font-bold flex items-center justify-center gap-2 transition-all"
            >
              Adopt this position →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}