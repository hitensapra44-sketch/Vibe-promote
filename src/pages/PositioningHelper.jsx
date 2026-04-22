import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Check, ArrowRight } from 'lucide-react';

const GEMINI_API_KEY = "AIzaSyDtgfOfUDIC_0lBMg3MhiABigDZHT0XGVM";
const GEMINI_MODEL = "gemini-1.5-flash";

export default function PositioningHelper({ appData, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [aiPositioning, setAiPositioning] = useState(null);
  const [error, setError] = useState(null);

  const generatePositioning = async () => {
    setLoading(true);
    setError(null);

    const systemPrompt = `You are a world-class SaaS positioning strategist. You have been given raw input from a founder about their app. Your job is to generate the sharpest, most specific positioning output possible. Use the audience's exact language. Never use generic phrases like "game-changing" or "revolutionary". Be specific about who the customer is, where they are online, what words they actually use, and what makes this app concretely better than the alternative. Return only valid JSON, no explanation, no markdown.`;

    const userMessage = `
      App Name: ${appData.app_name}
      App Description: ${appData.app_description}
      Target Customer: ${appData.target_customer}
      Core Problem: ${appData.core_problem}
      Unique Differentiator: ${appData.unique_differentiator}
      Audience Awareness: ${appData.audience_awareness}
      Pain Phrases: ${appData.pain_phrases}
      Brand Tone: ${appData.brand_tone}
      Writing Style: ${appData.writing_style}
      Primary CTA: ${appData.primary_cta}
      Primary Platform: ${appData.primary_platform}
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Input:\n${userMessage}\n\nReturn JSON with: one_liner, target_audience, where_they_are (array of 3), pain_points (array of 3), how_they_describe_it (array of 3), why_youre_better.` }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      setAiPositioning(JSON.parse(textResponse));
    } catch (err) {
      console.error("Generation failed:", err);
      setError("Failed to analyze positioning. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appData) generatePositioning();
  }, [appData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="w-12 h-12 text-violet-500 mb-6" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Analyzing your positioning...</h2>
        <p className="text-zinc-400">Our AI is crafting your unique vibe strategy.</p>
      </div>
    );
  }

  const Section = ({ label, children }) => (
    <div className="py-4 border-b border-zinc-800 last:border-0">
      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">{label}</label>
      <div className="text-white text-sm leading-relaxed">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-poppins py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Here's how your positioning looks right now — and how it could look.
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            The AI version uses your audience's exact language and speaks directly to why they would pay.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Card: User Version */}
          <div className="flex flex-col">
            <div className="text-center mb-4">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Your Current Positioning</span>
            </div>
            <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 flex flex-col">
              <div className="flex-1 space-y-2">
                <Section label="One-liner">{appData.app_description}</Section>
                <Section label="Target Audience">{appData.target_customer}</Section>
                <Section label="Where They Are">{appData.primary_platform}</Section>
                <Section label="Their Pain Points">{appData.core_problem}</Section>
                <Section label="How They Describe It">{appData.pain_phrases || "Not specified"}</Section>
                <Section label="Why You're Better">{appData.unique_differentiator || "Not specified"}</Section>
              </div>
              <button
                onClick={() => onComplete({ type: 'user', data: appData })}
                className="mt-8 w-full py-4 rounded-xl border border-zinc-700 text-zinc-400 font-bold hover:bg-zinc-800 transition-all"
              >
                Keep mine
              </button>
            </div>
          </div>

          {/* Right Card: AI Version */}
          <div className="flex flex-col">
            <div className="text-center mb-4">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Your Best Positioning</span>
            </div>
            <div 
              className="flex-1 bg-zinc-900/50 border border-violet-500 rounded-2xl p-8 flex flex-col relative"
              style={{ boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)' }}
            >
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-violet-600 text-[10px] font-bold text-white uppercase tracking-tighter">
                AI Generated
              </div>
              
              <div className="flex-1 space-y-2">
                <Section label="One-liner">{aiPositioning.one_liner}</Section>
                <Section label="Target Audience">{aiPositioning.target_audience}</Section>
                <Section label="Where They Are">
                  <ul className="space-y-1">
                    {aiPositioning.where_they_are.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-violet-500 mt-1">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </Section>
                <Section label="Their Pain Points">
                  <ul className="space-y-1">
                    {aiPositioning.pain_points.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-violet-500 mt-1">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </Section>
                <Section label="How They Describe It">
                  <div className="flex flex-wrap gap-2">
                    {aiPositioning.how_they_describe_it.map((item, i) => (
                      <span key={i} className="italic text-zinc-300">"{item}"</span>
                    ))}
                  </div>
                </Section>
                <Section label="Why You're Better">{aiPositioning.why_youre_better}</Section>
              </div>

              <button
                onClick={() => onComplete({ type: 'ai', data: aiPositioning })}
                className="mt-8 w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20"
              >
                Use AI version <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}