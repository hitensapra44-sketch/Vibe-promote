import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, ArrowRight, RefreshCw } from 'lucide-react';

const GEMINI_API_KEY = "AIzaSyDtgfOfUDIC_0lBMg3MhiABigDZHT0XGVM";
const GEMINI_MODEL = "gemini-1.5-flash";

export default function PositioningHelper({ appData, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [positioning, setPositioning] = useState(null);
  const [error, setError] = useState(null);

  const generatePositioning = async () => {
    setLoading(true);
    setError(null);

    const prompt = `You are a world-class SaaS marketing strategist. Based on the following app data, generate a sharp, high-converting positioning strategy.
    
    App Name: ${appData.app_name}
    Description: ${appData.app_description}
    Target Customer: ${appData.target_customer}
    Core Problem: ${appData.core_problem}

    Return a JSON object with exactly these fields:
    - hook: A one-sentence "scroll-stopping" hook for social media.
    - value_prop: A clear, punchy unique value proposition (max 10 words).
    - elevator_pitch: A 2-sentence pitch that explains the "vibe" and the result.
    - vibe_check: A short phrase describing the brand's personality (e.g., "Bold & Disruptive", "Calm & Efficient").

    Return valid JSON only. No markdown. No explanation.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      setPositioning(JSON.parse(textResponse));
    } catch (err) {
      console.error("Generation failed:", err);
      setError("Failed to generate your strategy. Let's try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePositioning();
  }, [appData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full mb-6"
        />
        <h2 className="text-2xl font-bold text-white mb-2">Sharpening your vibe...</h2>
        <p className="text-zinc-400">Our AI is crafting your unique positioning strategy.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-red-400 mb-6">{error}</p>
        <button
          onClick={generatePositioning}
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-violet-500/30">
      <div className="max-w-lg mx-auto px-6 py-12">
        <header className="mb-12">
          <div className="mb-4">
            <span className="text-violet-400 text-xs font-medium tracking-widest uppercase">Step 2 of 3</span>
            <div className="h-1 bg-zinc-800 rounded-full w-full mt-2 overflow-hidden">
              <div className="h-full bg-violet-600 rounded-full w-2/3 transition-all duration-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Your Vibe Strategy is ready.</h1>
          <p className="text-zinc-400 text-sm mt-1">This is how we'll position {appData.app_name} to win.</p>
        </header>

        <div className="space-y-6">
          {/* Hook Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <label className="text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-2 block">The Hook</label>
            <p className="text-lg font-medium leading-relaxed">"{positioning.hook}"</p>
          </div>

          {/* Value Prop Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <label className="text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-2 block">Value Proposition</label>
            <p className="text-xl font-bold text-white">{positioning.value_prop}</p>
          </div>

          {/* Pitch Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <label className="text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-2 block">Elevator Pitch</label>
            <p className="text-zinc-400 leading-relaxed">{positioning.elevator_pitch}</p>
          </div>

          {/* Vibe Check */}
          <div className="flex items-center justify-between bg-violet-600/10 border border-violet-500/20 rounded-2xl p-4">
            <span className="text-xs font-medium text-violet-300">Brand Personality:</span>
            <span className="text-sm font-bold text-violet-400">{positioning.vibe_check}</span>
          </div>
        </div>

        <button
          onClick={() => onComplete(positioning)}
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl px-6 py-4 w-full text-sm transition-colors mt-10 shadow-lg shadow-violet-600/10 flex items-center justify-center gap-2"
        >
          Lock it in & Continue
          <ArrowRight className="w-4 h-4" />
        </button>
        
        <button
          onClick={generatePositioning}
          className="w-full text-zinc-500 text-xs mt-4 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1"
        >
          <RefreshCw className="w-3 h-3" /> Not feeling it? Regenerate.
        </button>
      </div>
    </div>
  );
}