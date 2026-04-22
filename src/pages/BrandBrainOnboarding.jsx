import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, Rocket, X, Globe, Loader2 } from 'lucide-react';
import ParticleBackground from '../components/landing/particlebackground';
import GridBackground from '../components/ui/grid-background';

const GEMINI_API_KEY = "AIzaSyDtgfOfUDIC_0lBMg3MhiABigDZHT0XGVM";
const GEMINI_MODEL = "gemini-1.5-flash";

export default function BrandBrainOnboarding({ onComplete }) {
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [coreProblem, setCoreProblem] = useState('');
  const [url, setUrl] = useState('');
  
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const [errors, setErrors] = useState({});

  const handleExtract = async () => {
    if (!url) {
      setExtractError("Please enter a URL first.");
      return;
    }

    setExtracting(true);
    setExtractError(null);
    setExtracted(false);

    const systemPrompt = `You are an expert at reading SaaS landing pages and extracting positioning data. The user will give you a URL. You must return a JSON object with exactly these four fields extracted from what you know or can infer about the product at that URL: app_name (the product name), app_description (one sentence describing what it does in plain language, not marketing speak), target_customer (the specific type of person this is built for, as specific as possible), core_problem (the single biggest problem this product solves for that customer). If you cannot find specific information, make a reasonable inference based on the URL domain name and any context clues. Never return empty fields. Always return valid JSON only with no explanation and no markdown.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nExtract positioning data from this URL: ${url}`
            }]
          }],
          generationConfig: {
            response_mime_type: "application/json"
          }
        })
      });

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(textResponse);

      setAppName(parsed.app_name || '');
      setAppDescription(parsed.app_description || '');
      setTargetCustomer(parsed.target_customer || '');
      setCoreProblem(parsed.core_problem || '');
      
      setExtracted(true);
    } catch (err) {
      console.error("Extraction failed:", err);
      setExtractError("Couldn't read that URL. Fill in the questions below instead.");
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
        core_problem: coreProblem
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-bg-base text-white font-poppins overflow-hidden">
      <GridBackground />
      <ParticleBackground />

      {/* Gradient orbs matching HeroSection */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #b55933 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl"
        style={{ background: 'radial-gradient(circle, #9e4a2a 0%, transparent 70%)' }} />

      {/* Top Navigation */}
      <div className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-12">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-6 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-white/10" />
            <div className="w-2 h-2 rounded-full bg-white/10" />
            <div className="w-2 h-2 rounded-full bg-white/10" />
            <div className="w-2 h-2 rounded-full bg-white/10" />
          </div>
        </div>
        <button className="text-sm font-medium text-text-secondary hover:text-white transition-colors">
          Skip
        </button>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Side: Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-10"
          >
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-primary mb-3 block">Step 1</span>
              <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight mb-4" style={{ letterSpacing: '-2px' }}>
                Tell us about your <br />
                <span className="text-primary">app.</span>
              </h1>
              <p className="text-lg text-text-secondary">One time. Vibe Promote remembers forever.</p>
            </div>

            {/* URL Extraction Section */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-white/80 block">Have a landing page?</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="url"
                    placeholder="https://yourapp.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-bg-surface/50 border border-border-muted text-white focus:outline-none focus:border-primary/50 transition-all placeholder-text-secondary/30"
                  />
                </div>
                <button
                  onClick={handleExtract}
                  disabled={extracting}
                  className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {extracting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Extract →'}
                </button>
              </div>
              {extractError && <p className="text-red-400 text-xs">{extractError}</p>}
            </div>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-border-muted"></div>
              <span className="flex-shrink mx-4 text-text-secondary/40 text-[10px] uppercase tracking-widest font-bold">or fill it manually</span>
              <div className="flex-grow border-t border-border-muted"></div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="What's it called?"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className={`w-full px-6 py-5 rounded-2xl bg-bg-surface/50 border ${errors.app_name ? 'border-red-500' : 'border-border-muted'} text-xl font-bold text-white focus:outline-none focus:border-primary/50 transition-all placeholder-text-secondary/30`}
                />
              </div>

              <div className="space-y-2">
                <textarea
                  rows={3}
                  placeholder="Describe it in one sentence. e.g. Vibe Promote automates marketing for solo founders"
                  value={appDescription}
                  onChange={(e) => setAppDescription(e.target.value)}
                  className={`w-full px-6 py-5 rounded-2xl bg-bg-surface/50 border ${errors.app_description ? 'border-red-500' : 'border-border-muted'} text-base text-white focus:outline-none focus:border-primary/50 transition-all placeholder-text-secondary/30 resize-none`}
                />
                <div className="flex justify-end">
                  <span className="text-[10px] text-text-secondary/40 font-bold uppercase tracking-widest">{appDescription.length}/200</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Who is it for?"
                  value={targetCustomer}
                  onChange={(e) => setTargetCustomer(e.target.value)}
                  className={`w-full px-6 py-4 rounded-2xl bg-bg-surface/50 border ${errors.target_customer ? 'border-red-500' : 'border-border-muted'} text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder-text-secondary/30`}
                />
                <input
                  type="text"
                  placeholder="What problem do you solve?"
                  value={coreProblem}
                  onChange={(e) => setCoreProblem(e.target.value)}
                  className={`w-full px-6 py-4 rounded-2xl bg-bg-surface/50 border ${errors.core_problem ? 'border-red-500' : 'border-border-muted'} text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder-text-secondary/30`}
                />
              </div>

              <button
                onClick={handleContinue}
                className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-lg transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-primary/20"
              >
                See what Vibe Promote writes for you
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Right Side: Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block sticky top-32"
          >
            <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent">
              <div className="bg-bg-surface rounded-[2.4rem] p-10 min-h-[500px] flex flex-col border border-white/5 shadow-2xl">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary/60">Your App Brain</span>
                    <h3 className="text-lg font-bold text-white">Building live</h3>
                  </div>
                </div>

                <div className="flex-1 space-y-8">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">App Name</span>
                    <h2 className={`text-4xl font-bold transition-all duration-300 ${appName ? 'text-white' : 'text-white/10'}`}>
                      {appName || 'Your app name'}
                    </h2>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Description</span>
                    <p className={`text-xl leading-relaxed transition-all duration-300 ${appDescription ? 'text-text-secondary' : 'text-white/5'}`}>
                      {appDescription || 'Your one-sentence description will appear here as Vibe Promote builds your launch brain in real time.'}
                    </p>
                  </div>

                  {targetCustomer && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Target Audience</span>
                      <p className="text-sm text-text-secondary/80">{targetCustomer}</p>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-10 flex items-center justify-between border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/40">Syncing with AI</span>
                  </div>
                  <Rocket className="w-5 h-5 text-white/10" />
                </div>
              </div>
            </div>

            {/* Subtle Note */}
            <div className="mt-8 flex items-center justify-between px-4 py-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <p className="text-[11px] text-text-secondary/60 leading-relaxed">
                <span className="text-primary font-bold">Early Access</span> — some features may not work as expected. We appreciate your patience as we continue to improve.
              </p>
              <X className="w-4 h-4 text-text-secondary/40 cursor-pointer hover:text-white transition-colors" />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}