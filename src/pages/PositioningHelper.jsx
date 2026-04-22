import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, AlertCircle, RefreshCw, Target, Zap, ShieldCheck, Quote, Brain } from 'lucide-react';

const GROK_API_KEY = "REMOVED";
const GROK_MODEL = "grok-2";

export default function PositioningHelper({ appData, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [aiPositioning, setAiPositioning] = useState(null);
  const [error, setError] = useState(null);

  const generatePositioning = async () => {
    if (!appData) return;
    
    setLoading(true);
    setError(null);

    const systemPrompt = `You are an elite SaaS positioning strategist. Analyze the app info and generate a positioning statement. 
    
    RULES:
    1. Be specific. No fluff.
    2. No vague words like "innovative" or "seamless".
    3. Return ONLY a valid JSON object. No markdown, no backticks, no explanation.
    
    JSON Structure:
    { 
      "positioningStatement": "...", 
      "targetAudience": "...", 
      "coreValue": "...", 
      "keyDifferentiator": "...", 
      "suggestedTagline": "...", 
      "confidenceScore": 85
    }`;

    const userMessage = `
      App Name: ${appData.app_name || 'Not specified'}
      App Description: ${appData.app_description || 'Not specified'}
      Target Customer: ${appData.target_customer || 'Not specified'}
      Core Problem: ${appData.core_problem || 'Not specified'}
    `;

    try {
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`
        },
        body: JSON.stringify({
          model: GROK_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          response_format: { type: "json_object" },
          temperature: 0
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Grok API Error:", data);
        throw new Error(data.error?.message || 'Failed to fetch from Grok service');
      }

      const parsed = JSON.parse(data.choices[0].message.content);
      setAiPositioning(parsed);
    } catch (err) {
      console.error("Generation failed:", err);
      setError(err.message || "Failed to analyze positioning. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePositioning();
  }, [appData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-center font-poppins">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-bg-surface border border-primary/30 flex items-center justify-center">
            <Brain className="w-10 h-10 text-primary animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Analyzing your positioning...</h2>
        <p className="text-text-secondary">Our elite strategist is crafting your unique market position.</p>
      </div>
    );
  }

  if (error || !aiPositioning) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-center font-poppins">
        <AlertCircle className="w-12 h-12 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-text-secondary mb-8">{error || "We couldn't generate your positioning at this time."}</p>
        <button 
          onClick={generatePositioning}
          className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  const Section = ({ label, icon: Icon, children, color = "text-primary" }) => (
    <div className="py-6 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className={`w-4 h-4 ${color}`} />}
        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/60">
          {label}
        </label>
      </div>
      <div className="text-white text-base leading-relaxed">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-base text-white font-poppins py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Expert Analysis Complete</span>
          </motion.div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4" style={{ letterSpacing: '-1px' }}>
            Your Sharpest Market Position
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            We've stripped away the fluff to find the exact words that make your audience pay attention.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Card: Original Input */}
          <div className="flex flex-col">
            <div className="text-center mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-text-secondary/40">Your Original Input</span>
            </div>
            <div className="flex-1 bg-bg-surface/30 border border-border-muted rounded-3xl p-8 flex flex-col">
              <div className="flex-1">
                <Section label="App Name">{appData.app_name}</Section>
                <Section label="Description">{appData.app_description}</Section>
                <Section label="Target Audience">{appData.target_customer}</Section>
                <Section label="Core Problem">{appData.core_problem}</Section>
              </div>
              <button
                onClick={() => onComplete({ type: 'user', data: appData })}
                className="mt-8 w-full py-4 rounded-xl border border-border-muted text-text-secondary font-bold hover:bg-bg-elevated transition-all"
              >
                Keep my version
              </button>
            </div>
          </div>

          {/* Right Card: AI Expert Version */}
          <div className="flex flex-col">
            <div className="text-center mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Expert Positioning</span>
            </div>
            <div className="flex-1 bg-bg-surface border border-primary/30 rounded-3xl p-8 flex flex-col relative shadow-2xl shadow-primary/10">
              <div className="absolute top-6 right-6 flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest">Confidence</span>
                  <span className="text-sm font-bold text-primary">{aiPositioning.confidenceScore}%</span>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="mb-8 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Quote className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Suggested Tagline</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white italic">
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
                  {aiPositioning.keyDifferentiator}
                </Section>
              </div>

              <button
                onClick={() => onComplete({ type: 'ai', data: aiPositioning })}
                className="mt-8 w-full py-5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
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