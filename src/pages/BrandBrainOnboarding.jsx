"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, Rocket, Globe, Loader2, Link as LinkIcon } from 'lucide-react';
import ParticleBackground from '../components/landing/particlebackground';
import GridBackground from '../components/ui/grid-background';
import { generateAICall } from '../lib/ai';
import { supabase } from '../supabaseClient';

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
  const [url, setUrl] = useState('https://');
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

    const systemPrompt = `You are a SaaS product analyst. You will be given extracted text content scraped from a SaaS product landing page.

Your job is to extract structured product information based ONLY on what is explicitly stated or clearly implied in the provided text.
Do NOT invent, assume, or hallucinate anything that is not present in the text.

EXTRACTION RULES:
- app_name: The product brand name. Look for it in the H1 or page title first.
- app_description: 1-2 sentences maximum. Describe what the product actually does in plain terms. No marketing fluff. Be specific.
- target_customer: Who this is specifically built for. Be narrow and precise (e.g. "solo SaaS founders", "freelance designers", NOT "businesses" or "teams").
- core_problem: The specific pain point or frustration the product solves. Must be grounded in the page text.
- category: Pick exactly one from this list: [productivity, marketing, analytics, developer-tools, CRM, finance, HR, design, other]

STRICT RULES:
- If you cannot confidently determine a field from the provided text, set that field to "unclear". Do NOT guess.
- Do NOT use vague phrases like "helps businesses grow", "boosts productivity", "streamlines workflows"
- Do NOT reproduce marketing taglines as the description
- No markdown formatting, no code fences, no explanation text, no preamble
- Return ONLY a single valid JSON object and nothing else

OUTPUT FORMAT (return exactly this structure):
{
  "app_name": "string",
  "app_description": "string",
  "target_customer": "string",
  "core_problem": "string",
  "category": "string"
}`;

    try {
      const pageContent = await fetchAndCleanPage(url);
      const result = await generateAICall(systemPrompt, `Here is the extracted landing page content. Analyze it and return the JSON:\n\n${pageContent}`, null, 'onboarding');

      const clean = result.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      setAppName(parsed.app_name || '');
      setAppDescription(parsed.app_description || '');
      setTargetCustomer(parsed.target_customer || '');
      setCoreProblem(parsed.core_problem || '');
      setCategory(parsed.category || '');
      setHasExtracted(true);
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

  return (
    <div className="relative min-h-screen bg-bg-base text-white font-poppins overflow-hidden">
      <GridBackground />
      <ParticleBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-bold tracking-widest uppercase text-primary mb-3 block">Step 1</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6" style={{ letterSpacing: '-2px' }}>
            Lets build your <br />
            <span className="text-primary">brand brain.</span>
          </h1>
          
          {!hasExtracted ? (
            <div className="max-w-lg mx-auto">
              <p className="text-text-secondary mb-8 text-base">Paste your URL. We'll handle the rest.</p>
              <form onSubmit={handleExtract} className="relative group">
                <div className="absolute inset-0 bg-primary/10 blur-xl group-hover:bg-primary/20 transition-all opacity-50" />
                <div className="relative flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="url"
                      placeholder="https://your-awesome-saas.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-bg-surface/80 backdrop-blur-xl border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
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
                className="mt-6 text-xs text-text-secondary hover:text-white transition-colors underline underline-offset-4"
              >
                Or fill details manually
              </button>
            </div>
          ) : (
            <p className="text-text-secondary text-sm">We've extracted your details. Edit what you feel is wrong</p>
          )}
        </motion.div>

        {hasExtracted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">App Name</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className={`w-full px-5 py-3.5 rounded-xl bg-bg-surface/50 border ${errors.app_name ? 'border-red-500' : 'border-white/5'} text-sm text-white focus:outline-none focus:border-primary/50 transition-all`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Description</label>
                <textarea
                  rows={3}
                  value={appDescription}
                  onChange={(e) => setAppDescription(e.target.value)}
                  className={`w-full px-5 py-3.5 rounded-xl bg-bg-surface/50 border ${errors.app_description ? 'border-red-500' : 'border-white/5'} text-sm text-white focus:outline-none focus:border-primary/50 transition-all resize-none`}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Target Audience</label>
                <input
                  type="text"
                  value={targetCustomer}
                  onChange={(e) => setTargetCustomer(e.target.value)}
                  className={`w-full px-5 py-3.5 rounded-xl bg-bg-surface/50 border ${errors.target_customer ? 'border-red-500' : 'border-white/5'} text-sm text-white focus:outline-none focus:border-primary/50 transition-all`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Core Problem Solved</label>
                <input
                  type="text"
                  value={coreProblem}
                  onChange={(e) => setCoreProblem(e.target.value)}
                  className={`w-full px-5 py-3.5 rounded-xl bg-bg-surface/50 border ${errors.core_problem ? 'border-red-500' : 'border-white/5'} text-sm text-white focus:outline-none focus:border-primary/50 transition-all`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-bg-surface/50 border border-white/5 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-6 flex justify-center">
              <button
                onClick={handleContinue}
                className="group inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-base transition-all shadow-xl shadow-primary/20"
              >
                Everything looks good
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}