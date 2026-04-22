import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, AlertCircle, RefreshCw, Target, Zap, ShieldCheck, Quote } from 'lucide-react';

const GEMINI_API_KEY = "AIzaSyDtgfOfUDIC_0lBMg3MhiABigDZHT0XGVM";
const GEMINI_MODEL = "gemini-1.5-flash";

export default function PositioningHelper({ appData, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [aiPositioning, setAiPositioning] = useState(null);
  const [error, setError] = useState(null);

  const generatePositioning = async () => {
    if (!appData) return;
    
    setLoading(true);
    setError(null);

    const systemPrompt = `You are an elite SaaS positioning strategist with 15 years of experience helping bootstrapped founders and indie hackers find their sharpest market position. You have studied the positioning frameworks of April Dunford, Geoffrey Moore, and Peep Laja. You write with surgical precision — no fluff, no corporate speak, no vague buzzwords.

Your job is to analyze the founder's app information and generate a positioning statement that feels like it was written by the best marketer they have ever hired.

RULES YOU MUST FOLLOW:
1. Be brutally specific. Use the founder's actual words and context.
2. Never use vague words like "innovative", "powerful", "seamless", "robust", "next-generation", "cutting-edge", "game-changing", or "revolutionary".
3. The positioning statement must be instantly understood by a 10-year-old AND respected by a senior product marketer.
4. The target audience must be a real specific person, not a broad category. Bad: "small business owners" Good: "solo founders running a SaaS under $5k MRR with no marketing team"
5. The differentiator must be something competitors genuinely cannot claim.
6. The tagline must create curiosity or instant recognition. It should make the reader feel "that's exactly what I need."
7. If the founder's answers are vague, infer smartly from context but stay grounded in what they told you.

OUTPUT FORMAT: Return only a valid JSON object. No markdown. No explanation. No extra text.

{ 
  "positioningStatement": "For [ultra specific audience] who [specific painful problem], [App Name] is the [clear category] that [specific measurable benefit]. Unlike [real alternative they currently use], [App Name] [specific differentiator that competitors cannot claim].", 
  "targetAudience": "One razor-sharp sentence. A real person with a real job title, real frustration, and real context.", 
  "coreValue": "The single most important transformation this product creates. Lead with outcome not feature.", 
  "keyDifferentiator": "The one thing about this product that is genuinely hard to copy or claim by anyone else.", 
  "suggestedTagline": "5 to 8 words. punchy. specific. makes the right person stop scrolling.", 
  "confidenceScore": 85
}`;

    const userMessage = `
      App Name: ${appData.app_name || 'Not specified'}
      App Description: ${appData.app_description || 'Not specified'}
      Target Customer: ${appData.target_customer || 'Not specified'}
      Core Problem: ${appData.core_problem || 'Not specified'}
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser Input:\n${userMessage}`
            }]
          }],
          generationConfig: {
            response_mime_type: "application/json"
          }
        })
      });

      if (!response.ok) throw new Error('Failed to fetch from AI service');

      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error('Invalid AI response format');
      
      const textResponse = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(textResponse);
      setAiPositioning(parsed);
    } catch (err) {
      console.error("Generation failed:", err);
      setError("Failed to analyze positioning. Please check your connection or try again.");
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