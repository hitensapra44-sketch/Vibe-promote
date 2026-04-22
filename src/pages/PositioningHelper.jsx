import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

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

    const systemPrompt = `You are a world-class SaaS positioning strategist. You have been given raw input from a founder about their app. Your job is to generate the sharpest, most specific positioning output possible. Use the audience's exact language. Never use generic phrases like "game-changing" or "revolutionary". Be specific about who the customer is, where they are online, what words they actually use, and what makes this app concretely better than the alternative. Return only valid JSON, no explanation, no markdown.`;

    const userMessage = `
      App Name: ${appData.app_name || 'Not specified'}
      App Description: ${appData.app_description || 'Not specified'}
      Target Customer: ${appData.target_customer || 'Not specified'}
      Core Problem: ${appData.core_problem || 'Not specified'}
      Unique Differentiator: ${appData.unique_differentiator || 'Not specified'}
      Audience Awareness: ${appData.audience_awareness || 'Not specified'}
      Pain Phrases: ${appData.pain_phrases || 'Not specified'}
      Brand Tone: ${appData.brand_tone || 'Not specified'}
      Writing Style: ${appData.writing_style || 'Not specified'}
      Primary CTA: ${appData.primary_cta || 'Not specified'}
      Primary Platform: ${appData.primary_platform || 'Not specified'}
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser Input:\n${userMessage}\n\nReturn a JSON object with exactly these fields:
              {
                "one_liner": "string",
                "target_audience": "string",
                "where_they_are": ["platform 1 + why", "platform 2 + why", "platform 3 + why"],
                "pain_points": ["pain 1", "pain 2", "pain 3"],
                "how_they_describe_it": ["exact phrase 1", "exact phrase 2", "exact phrase 3"],
                "why_youre_better": "string — one sentence comparing to alternatives"
              }`
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
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center font-poppins">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Analyzing your positioning...</h2>
        <p className="text-zinc-400">Our AI is crafting your unique positioning strategy.</p>
      </div>
    );
  }

  if (error || !aiPositioning) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center font-poppins">
        <AlertCircle className="w-12 h-12 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-zinc-400 mb-8">{error || "We couldn't generate your positioning at this time."}</p>
        <button 
          onClick={generatePositioning}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  const Section = ({ label, children }) => (
    <div className="py-4 border-b border-zinc-800 last:border-0">
      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
        {label}
      </label>
      <div className="text-white text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-poppins py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
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
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Your Current Positioning</span>
            </div>
            <div className="flex-1 bg-zinc-900/30 border border-zinc-700 rounded-2xl p-8 flex flex-col">
              <div className="flex-1">
                <Section label="One-liner">{appData.app_description || 'Not specified'}</Section>
                <Section label="Target Audience">{appData.target_customer || 'Not specified'}</Section>
                <Section label="Where They Are">{appData.primary_platform || 'Not specified'}</Section>
                <Section label="Their Pain Points">{appData.core_problem || 'Not specified'}</Section>
                <Section label="How They Describe It">{appData.pain_phrases || 'Not specified'}</Section>
                <Section label="Why You're Better">{appData.unique_differentiator || 'Not specified'}</Section>
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
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Your Best Positioning</span>
            </div>
            <div className="flex-1 bg-zinc-900/50 border border-violet-500 rounded-2xl p-8 flex flex-col relative shadow-[0_0_40px_rgba(139,92,246,0.4)]">
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 rounded-full bg-violet-600 text-[10px] font-bold text-white uppercase tracking-wider">
                  AI Generated
                </span>
              </div>
              
              <div className="flex-1">
                <Section label="One-liner">{aiPositioning.one_liner}</Section>
                <Section label="Target Audience">{aiPositioning.target_audience}</Section>
                <Section label="Where They Are">
                  <ul className="space-y-1">
                    {aiPositioning.where_they_are.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-violet-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>
                <Section label="Their Pain Points">
                  <ul className="space-y-1">
                    {aiPositioning.pain_points.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-violet-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>
                <Section label="How They Describe It">
                  <div className="flex flex-wrap gap-2">
                    {aiPositioning.how_they_describe_it.map((phrase, i) => (
                      <span key={i} className="italic text-zinc-300">"{phrase}"{i < aiPositioning.how_they_describe_it.length - 1 ? ',' : ''}</span>
                    ))}
                  </div>
                </Section>
                <Section label="Why You're Better">{aiPositioning.why_youre_better}</Section>
              </div>

              <button
                onClick={() => onComplete({ type: 'ai', data: aiPositioning })}
                className="mt-8 w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20"
              >
                Use AI version →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}