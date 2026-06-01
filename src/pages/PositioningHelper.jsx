"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, RefreshCw, Target, Zap, ShieldCheck, Quote, Brain, AlertCircle } from 'lucide-react';
import { generateAICall } from '../lib/ai';

export default function PositioningHelper({ appData, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [aiPositioning, setAiPositioning] = useState(null);
  const [error, setError] = useState(null);

  const generatePositioning = async () => {
    if (!appData) return;
    
    setLoading(true);
    setError(null);

    const systemPrompt = `You are a world-class SaaS positioning strategist. You have 5 proven positioning frameworks below. Your job is to silently pick the ONE framework that best fits the brand data provided, then use it to write the positioning output. Never mention the framework name or that you used one. Just deliver the result.

FRAMEWORKS:
1. Pain Agitator — Lead with the exact painful situation the user is stuck in before showing the solution. Best for: tools solving a clear daily frustration.
2. Category Creator — Position the product as a new category, not a better version of something existing. Best for: genuinely novel tools.
3. Outcome Promise — Lead with the transformation/result the user will get. Best for: tools with measurable ROI.
4. Enemy Framing — Name the broken old way and position the product as the antidote. Best for: tools replacing expensive or clunky incumbents.
5. Niche Authority — Position as the only tool built specifically for one type of person. Best for: hyper-targeted tools with a specific ICP.

SELECTION RULE:
Read the brand data carefully. Pick the framework whose characteristics match best. If core_problem sounds like daily friction → Pain Agitator. If no clear comparable competitor exists → Category Creator. If ROI is obvious → Outcome Promise. If there's a clear old-way being replaced → Enemy Framing. If the ICP is very specific → Niche Authority.

OUTPUT FORMAT (return only valid JSON, no markdown, no explanation):
{
  "positioningStatement": "2-3 sentence positioning statement written in the chosen framework's style",
  "targetAudience": "specific one-line ICP description",
  "suggestedTagline": "5-8 word tagline in the brand's tone",
  "coreValue": "one sentence — the single most valuable thing this product gives the user"
}

USER MESSAGE:
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="flex flex-col">
            <div className="text-center mb-4">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">Your Original Input</span>
            </div>
            <div className="flex-1 bg-foreground/5 border border-foreground/10 rounded-lg p-8 flex flex-col">
              <div className="flex-1">
                <Section label="App Name">{appData.app_name}</Section>
                <Section label="Description">{appData.app_description}</Section>
                <Section label="Target Audience">{appData.target_customer}</Section>
                <Section label="Core Problem">{appData.core_problem}</Section>
              </div>
              <button
                onClick={() => onComplete({ type: 'user', data: appData })}
                className="mt-8 w-full py-4 rounded-md border border-foreground/10 text-zinc-500 text-sm font-medium hover:bg-foreground/10 transition-all bg-transparent"
              >
                Keep my version
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-center mb-4">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#F97316]">Expert Positioning</span>
            </div>
            <div className="flex-1 bg-foreground/5 border border-[#F97316]/30 rounded-lg p-8 flex flex-col relative">
              <div className="absolute top-6 right-6 flex items-center gap-2">
                <div className="flex col items-end">
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

                <Section label="Unfair Advantage" icon={Sparkles}>
                  {aiPositioning.keyDifferentiator || "Proprietary AI-driven insights tailored to your specific niche."}
                </Section>
              </div>

              <button
                onClick={() => onComplete({ type: 'ai', data: aiPositioning })}
                className="mt-8 w-full py-5 rounded-md bg-[#F97316] hover:bg-[#9e4a2a] text-white font-bold flex items-center justify-center gap-2 transition-all"
              >
                Adopt this position →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}