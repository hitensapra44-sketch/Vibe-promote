import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Rocket, X, Globe, Loader2 } from 'lucide-react';
import ParticleBackground from '../components/landing/particlebackground';
import GridBackground from '../components/ui/grid-background';

const GEMINI_API_KEY = "AIzaSyDtgfOfUDIC_0lBMg3MhiABigDZHT0XGVM";
const GEMINI_MODEL = "gemini-1.5-flash";

export default function BrandBrainOnboarding({ onComplete }) {
  const [formData, setFormData] = useState({
    app_name: '',
    app_description: '',
    target_customer: '',
    core_problem: '',
    unique_differentiator: '',
    audience_awareness: 'Problem Aware',
    pain_phrases: '',
    brand_tone: 'Direct & no-BS',
    writing_style: 'Short & punchy',
    primary_cta: 'Sign up for free',
    primary_platform: 'X (Twitter)'
  });
  
  const [url, setUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const [errors, setErrors] = useState({});

  const handleExtract = async () => {
    if (!url) {
      setExtractError("Please enter a URL first.");
      return;
    }

    setExtracting(true);
    setExtractError(null);

    const systemPrompt = `You are an expert at reading SaaS landing pages and extracting positioning data. Return a JSON object with these fields: app_name, app_description, target_customer, core_problem, unique_differentiator, pain_phrases. Return valid JSON only.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nExtract from: ${url}` }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      const data = await response.json();
      const parsed = JSON.parse(data.candidates[0].content.parts[0].text);

      setFormData(prev => ({ ...prev, ...parsed }));
    } catch (err) {
      setExtractError("Couldn't read that URL. Fill in the questions below instead.");
    } finally {
      setExtracting(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    ['app_name', 'app_description', 'target_customer', 'core_problem'].forEach(field => {
      if (!formData[field].trim()) newErrors[field] = "Required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onComplete(formData);
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white font-poppins overflow-y-auto">
      <GridBackground />
      <ParticleBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-primary mb-3 block">Step 1</span>
              <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight mb-4" style={{ letterSpacing: '-2px' }}>
                Build your <span className="text-primary">Brand Brain.</span>
              </h1>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-white block">Have a landing page?</label>
              <div className="flex gap-3">
                <input
                  type="url"
                  placeholder="https://yourapp.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 pl-4 pr-4 py-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-white focus:outline-none focus:border-primary/50 transition-all"
                />
                <button onClick={handleExtract} disabled={extracting} className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold transition-all disabled:opacity-50">
                  {extracting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Extract'}
                </button>
              </div>
              {extractError && <p className="text-red-400 text-xs">{extractError}</p>}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase">App Name</label>
                  <input
                    type="text"
                    value={formData.app_name}
                    onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white focus:border-primary/50 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Primary Platform</label>
                  <select
                    value={formData.primary_platform}
                    onChange={(e) => setFormData({ ...formData, primary_platform: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white focus:border-primary/50 outline-none"
                  >
                    <option>X (Twitter)</option>
                    <option>LinkedIn</option>
                    <option>Reddit</option>
                    <option>TikTok</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">Tell us about your app</label>
                <textarea
                  rows={2}
                  value={formData.app_description}
                  onChange={(e) => setFormData({ ...formData, app_description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white focus:border-primary/50 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Target Audience</label>
                  <input
                    type="text"
                    value={formData.target_customer}
                    onChange={(e) => setFormData({ ...formData, target_customer: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white focus:border-primary/50 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase">What problem your app solves</label>
                  <input
                    type="text"
                    value={formData.core_problem}
                    onChange={(e) => setFormData({ ...formData, core_problem: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white focus:border-primary/50 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">Pain Phrases (What they actually say)</label>
                <input
                  type="text"
                  placeholder="e.g. 'I'm tired of manual posting', 'Marketing is a headache'"
                  value={formData.pain_phrases}
                  onChange={(e) => setFormData({ ...formData, pain_phrases: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white focus:border-primary/50 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">What makes you different?</label>
                <input
                  type="text"
                  value={formData.unique_differentiator}
                  onChange={(e) => setFormData({ ...formData, unique_differentiator: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white focus:border-primary/50 outline-none"
                />
              </div>

              <button
                onClick={handleContinue}
                className="group w-full py-5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-lg transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              >
                Get better positioning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="hidden lg:block sticky top-12">
            <div className="bg-zinc-900/50 rounded-[2.5rem] p-10 border border-zinc-800 shadow-2xl">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Your App Brain</span>
                  <h3 className="text-lg font-bold text-white">Building live</h3>
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">App Name</span>
                  <h2 className={`text-4xl font-bold transition-all ${formData.app_name ? 'text-white' : 'text-white/10'}`}>
                    {formData.app_name || 'Your app name'}
                  </h2>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Description</span>
                  <p className={`text-xl leading-relaxed transition-all ${formData.app_description ? 'text-zinc-400' : 'text-white/5'}`}>
                    {formData.app_description || 'Your description will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}