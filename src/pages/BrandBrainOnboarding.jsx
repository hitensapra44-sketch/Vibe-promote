import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, Rocket, X, Globe, Loader2 } from 'lucide-react';

const GEMINI_API_KEY = "AIzaSyDtgfOfUDIC_0lBMg3MhiABigDZHT0XGVM";
const GEMINI_MODEL = "gemini-1.5-flash";

export default function BrandBrainOnboarding({ onComplete }) {
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [coreProblem, setCoreProblem] = useState('');
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

    const systemPrompt = `You are an expert at reading SaaS landing pages and extracting positioning data. The user will give you a URL. You must return a JSON object with exactly these four fields: app_name, app_description (one sentence), target_customer, core_problem. Return valid JSON only.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nURL: ${url}` }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(textResponse);

      setAppName(parsed.app_name || '');
      setAppDescription(parsed.app_description || '');
      setTargetCustomer(parsed.target_customer || '');
      setCoreProblem(parsed.core_problem || '');
    } catch (err) {
      setExtractError("Couldn't read that URL. Fill in the questions below instead.");
    } finally {
      setExtracting(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!appName.trim()) newErrors.app_name = "Required";
    if (!appDescription.trim()) newErrors.app_description = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onComplete({
        app_name: appName,
        app_description: appDescription,
        target_customer: targetCustomer || 'General Audience',
        core_problem: coreProblem || 'General Problem'
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0e1a] text-white font-poppins overflow-hidden flex flex-col">
      {/* Subtle Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3
            }}
          />
        ))}
      </div>

      {/* Top Navigation & Progress */}
      <div className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-12">
        <div className="flex gap-2 items-center">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === 1 ? 'w-8 bg-white' : 'w-4 bg-gray-700'
              }`} 
            />
          ))}
        </div>
        <button className="text-sm font-medium text-gray-500 hover:text-white transition-colors">
          Skip
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto w-full px-6 sm:px-12 gap-12 lg:gap-24 pb-12">
        
        {/* Left Column: Form (60%) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-[60%] space-y-8"
        >
          <div>
            <span className="text-gray-500 tracking-[0.3em] text-sm font-bold uppercase block mb-4">S T E P 1</span>
            <h1 className="text-5xl font-bold text-white leading-tight">
              Tell us about your <br />
              <span className="text-white">app.</span>
            </h1>
            <p className="text-gray-400 text-base mt-3">One time. Vibe Hype remembers forever.</p>
          </div>

          {/* URL Extraction (Optional but styled) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="url"
                  placeholder="Paste your landing page URL (optional)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 rounded-2xl bg-[#111827] border border-gray-700 text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-600"
                />
              </div>
              <button
                onClick={handleExtract}
                disabled={extracting}
                className="px-6 py-4 rounded-2xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {extracting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Extract →'}
              </button>
            </div>
            {extractError && <p className="text-red-400 text-xs">{extractError}</p>}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="What's it called?"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className={`w-full bg-[#111827] border ${errors.app_name ? 'border-red-500' : 'border-gray-700'} rounded-2xl px-6 py-5 text-white text-xl placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all`}
              />
            </div>

            <div className="space-y-2 relative">
              <textarea
                rows={4}
                placeholder="Describe it in one sentence. e.g. Vibe Hype is an AI marketing co-pilot for indie hackers"
                value={appDescription}
                onChange={(e) => setAppDescription(e.target.value.slice(0, 200))}
                className={`w-full bg-[#111827] border ${errors.app_description ? 'border-red-500' : 'border-gray-700'} rounded-2xl px-6 py-5 text-white text-lg placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all resize-none`}
              />
              <div className="absolute bottom-4 right-6 text-gray-600 text-xs font-medium">
                {appDescription.length}/200
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="group flex items-center justify-center gap-2 w-full py-5 rounded-2xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-lg transition-all duration-300 shadow-xl shadow-indigo-900/20"
            >
              See what Vibe Hype writes for you →
            </button>
          </div>
        </motion.div>

        {/* Right Column: Live Preview Card (40%) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden md:block w-full md:w-[40%] relative"
        >
          {/* Rocket Icon Floating */}
          <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-[#111827] border border-gray-700/50 flex items-center justify-center shadow-2xl z-10">
            <Rocket className="w-8 h-8 text-indigo-500/40" />
          </div>

          <div className="bg-[#111827] border border-gray-700/50 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden min-h-[450px] flex flex-col">
            {/* Card Header */}
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-gray-800/50 flex items-center justify-center border border-gray-700/30">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">YOUR APP BRAIN</span>
                <h3 className="text-lg font-bold text-white">Building live</h3>
              </div>
            </div>

            {/* Card Content */}
            <div className="space-y-8 flex-1">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">APP</span>
                <h2 className={`text-4xl font-bold transition-all duration-300 break-words ${appName ? 'text-white' : 'text-white/10'}`}>
                  {appName || 'Your app name'}
                </h2>
              </div>

              <div className="space-y-2">
                <p className={`text-lg leading-relaxed transition-all duration-300 ${appDescription ? 'text-gray-400' : 'text-white/5'}`}>
                  {appDescription || 'Your one-sentence description will appear here as Vibe Hype builds your launch brain in real time.'}
                </p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-auto pt-8 border-t border-gray-800/50 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Syncing with AI</span>
            </div>
          </div>

          {/* Early Access Note */}
          <div className="mt-6 p-4 rounded-2xl bg-[#111827]/50 border border-gray-700/30 backdrop-blur-sm flex items-center justify-between">
            <p className="text-[11px] text-gray-500 leading-relaxed">
              <span className="text-indigo-500 font-bold">Early Access</span> — some features may not work as expected. We appreciate your patience.
            </p>
            <X className="w-4 h-4 text-gray-700 cursor-pointer hover:text-white transition-colors" />
          </div>
        </motion.div>

      </div>
    </div>
  );
}