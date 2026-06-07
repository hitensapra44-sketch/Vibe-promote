"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, Rocket, Globe, Loader2, Link as LinkIcon, X } from 'lucide-react';
import ParticleBackground from '../components/landing/particlebackground';
import GridBackground from '../components/ui/grid-background';
import { generateAICall } from '../lib/ai';
import { supabase } from '../supabaseClient';
import { cn } from '../lib/utils';

async function fetchAndCleanPage(url) {
  try {
    const { data, error } = await supabase.functions.invoke('ai-service', {
      body: { feature: 'scrape', url }
    });
    if (error || !data?.content) {
      throw new Error(error?.message || 'Could not fetch page. Check the URL and try again.');
    }
    return data.content;
  } catch (err) {
    throw new Error(err.message || 'Could not fetch page. Check the URL and try again.');
  }
}

export default function BrandBrainOnboarding({ onComplete }) {
  const [url, setUrl] = useState(() => {
    return localStorage.getItem('onboarding_url') || 'https://';
  });
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [coreProblem, setCoreProblem] = useState('');
  const [category, setCategory] = useState('');
  
  const [extracting, setExtracting] = useState(false);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [errors, setErrors] = useState({
    app_name: '',
    app_description: '',
    target_customer: '',
    core_problem: ''
  });

  const handleExtract = async (e) => {
    e?.preventDefault();
    if (!url || url === 'https://') return;

    setExtracting(true);
    setHasExtracted(false);

    const systemPrompt = `You are a SaaS product analyst. You will be given text scraped from a real landing page.

YOUR ONLY JOB: Extract what is explicitly written on the page. Nothing else.

ABSOLUTE RULE — MORE IMPORTANT THAN EVERYTHING ELSE:
If a field is not clearly stated on the page, you MUST return "unclear" for that field.
DO NOT guess. DO NOT infer from the product name. DO NOT fill gaps with assumptions.
If the page content looks empty, broken, or too short to extract from — return "unclear" for ALL fields.
A wrong answer is worse than "unclear". The user will fix "unclear". They cannot fix a confident wrong answer.

FIELDS:
- app_name: The product brand name only. Found in H1 or page title. If not found: "unclear"
- app_description: 1-2 sentences. What it actually does in plain language. No marketing phrases. If not found: "unclear"
- target_customer: Narrow and specific (e.g. "solo SaaS founders", "freelance designers"). NOT "businesses" or "teams". If not found: "unclear"
- core_problem: The specific pain point it solves. Must come directly from page text. If not found: "unclear"
- category: Pick one from [productivity, marketing, analytics, developer-tools, CRM, finance, HR, design, other]. If not found: "other"

BANNED PHRASES — never use these in any field:
"helps businesses grow", "boosts productivity", "streamlines workflows", "game-changer", "revolutionize", "leverage", "optimize"

OUTPUT: Return ONLY a single valid JSON object. No markdown. No backticks. No explanation.

{
  "app_name": "string or unclear",
  "app_description": "string or unclear",
  "target_customer": "string or unclear",
  "core_problem": "string or unclear",
  "category": "string"
}`;

  try {
      const pageContent = await fetchAndCleanPage(url);
      const result = await generateAICall(systemPrompt, `Here is the extracted landing page content. Analyze it and return the JSON:\n\n${pageContent}`, null, 'onboarding');

      // Extract JSON from anywhere in the response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse AI response. Try again.');
      const parsed = JSON.parse(jsonMatch[0]);

      setAppName(parsed.app_name || '');
      setAppDescription(parsed.app_description || '');
      setTargetCustomer(parsed.target_customer || '');
      setCoreProblem(parsed.core_problem || '');
      setCategory(parsed.category || '');
      setHasExtracted(true);
      // Clear the stored URL so it doesn't persist forever
      localStorage.removeItem('onboarding_url');
    } catch (err) {
      console.error("Extraction failed:", err);
      alert(err.message || 'Extraction failed. Try filling details manually.');
      setHasExtracted(true);
    } finally {
      setExtracting(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!appName.trim()) newErrors.app_name = "Required";
    if (!appDescription.trim()) newErrors.app_description = "Required";
    if (!targetCustomer.trim()) newErrors.target_customer = "Required";
    if (!coreProblem.trim()) newErrors.core_problem = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onComplete({
        app_name: appName,
        app_description: appDescription,
        target_customer: targetCustomer,
        core_problem: coreProblem,
        category: category
      });
    }
  };

  const hasAnyContent = appName.trim() || appDescription.trim() || targetCustomer.trim() || coreProblem.trim() || category.trim();

  return (
    <div className="relative min-h-screen bg-background text-foreground font-poppins overflow-hidden">
      <GridBackground />
      <ParticleBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-bold tracking-widest uppercase text-primary mb-3 block">Step 1</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6" style={{ letterSpacing: '-2px' }}>
            Lets build your <br />
            <span className="text-primary">brand brain.</span>
          </h1>
          
          {!hasExtracted ? (
            <div className="max-w-lg mx-auto">
              <p className="text-zinc-500 mb-8 text-base">Paste your URL. We'll handle the rest.</p>
              <form onSubmit={handleExtract} className="relative group">
                <div className="absolute inset-0 bg-primary/10 blur-xl group-hover:bg-primary/20 transition-all opacity-50" />
                <div className="relative flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="url"
                      placeholder="https://your-awesome-saas.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-foreground/5 border border-foreground/10 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={extracting || !url || url === 'https://'}
                    className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
                  >
                    {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Analyze</>}
                  </button>
                </div>
              </form>
              <button 
                onClick={() => setHasExtracted(true)}
                className="mt-6 text-xs text-zinc-500 hover:text-foreground transition-colors underline underline-offset-4 bg-transparent border-none cursor-pointer"
              >
                Or fill details manually
              </button>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">We've extracted your details. Edit what you feel is wrong</p>
          )}
        </motion.div>

        {hasExtracted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-8 shadow-2xl relative">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="text-foreground/40 text-[10px] tracking-widest font-bold uppercase">YOUR BRAND BRAIN</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", hasAnyContent ? "bg-green-400 animate-pulse" : "bg-zinc-400")} />
                  <span className="text-foreground/60 text-xs">
                    {hasAnyContent ? "Building live" : "Waiting for input"}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-foreground/10 my-4" />

              {/* BRAND Section */}
              <div className="space-y-2 py-4">
                <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">BRAND</span>
                <input
                  type="text"
                  placeholder="Your brand name"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className={`w-full px-5 py-3.5 rounded-xl bg-foreground/5 border ${errors.app_name ? 'border-red-500' : 'border-foreground/10'} text-lg font-bold text-foreground focus:outline-none focus:border-primary/50 transition-all`}
                />
              </div>

              {/* Divider */}
              <div className="border-t border-foreground/10 my-4" />

              {/* DESCRIPTION Section */}
              <div className="space-y-2 py-4">
                <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">DESCRIPTION</span>
                <textarea
                  rows={3}
                  placeholder="Your one-sentence pitch will appear here as Vibe Promote builds your brand brain in real time."
                  value={appDescription}
                  onChange={(e) => setAppDescription(e.target.value)}
                  className={`w-full px-5 py-3.5 rounded-xl bg-foreground/5 border ${errors.app_description ? 'border-red-500' : 'border-foreground/10'} text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all resize-none`}
                />
              </div>

              {/* Divider */}
              <div className="border-t border-foreground/10 my-4" />

              {/* AUDIENCE Section */}
              <div className="space-y-2 py-4">
                <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">AUDIENCE</span>
                <input
                  type="text"
                  placeholder="Who you're building for"
                  value={targetCustomer}
                  onChange={(e) => setTargetCustomer(e.target.value)}
                  className={`w-full px-5 py-3.5 rounded-xl bg-foreground/5 border ${errors.target_customer ? 'border-red-500' : 'border-foreground/10'} text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all`}
                />
              </div>

              {/* Divider */}
              <div className="border-t border-foreground/10 my-4" />

              {/* PROBLEM Section */}
              <div className="space-y-2 py-4">
                <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">PROBLEM</span>
                <input
                  type="text"
                  placeholder="The pain you solve"
                  value={coreProblem}
                  onChange={(e) => setCoreProblem(e.target.value)}
                  className={`w-full px-5 py-3.5 rounded-xl bg-foreground/5 border ${errors.core_problem ? 'border-red-500' : 'border-foreground/10'} text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all`}
                />
              </div>

              {/* Divider */}
              <div className="border-t border-foreground/10 my-4" />

              {/* CATEGORY Section */}
              <div className="space-y-2 py-4">
                <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold block">CATEGORY</span>
                <input
                  type="text"
                  placeholder="e.g. marketing, productivity, developer-tools"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-foreground/10 my-6" />

              {/* Footer inside card */}
              <div className="pt-2">
                <button
                  onClick={handleContinue}
                  className="group inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-base transition-all shadow-xl shadow-primary/20 w-full justify-center"
                >
                  Everything looks good
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}