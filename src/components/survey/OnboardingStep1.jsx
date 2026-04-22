import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Brain } from 'lucide-react';

export default function OnboardingStep1({ 
  appName, 
  setAppName, 
  description, 
  setDescription, 
  onNext,
  canNext 
}) {
  return (
    <div className="min-h-screen w-full bg-[#0a0e1a] text-white font-poppins relative overflow-hidden flex flex-col">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/30 rounded-full blur-[1px]" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-indigo-500/20 rounded-full blur-[2px]" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/20 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-indigo-400/10 rounded-full blur-[4px]" />
      </div>

      {/* Top Navigation */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto w-full px-6 sm:px-12 gap-12 lg:gap-24">
        
        {/* Left Column: Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-[60%] space-y-8"
        >
          <div>
            <span className="text-gray-500 tracking-[0.3em] text-sm font-bold uppercase block mb-4">S T E P 1</span>
            <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight">
              Tell us about your <br />
              <span className="text-white">app.</span>
            </h1>
            <p className="text-gray-400 text-lg mt-4">One time. Vibe Promote remembers forever.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="What's it called?"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full bg-[#111827] border border-gray-700 rounded-2xl px-6 py-5 text-white text-xl placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2 relative">
              <textarea
                rows={4}
                placeholder="Describe it in one sentence. e.g. Vibe Hype is an AI marketing co-pilot for indie hackers"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                className="w-full bg-[#111827] border border-gray-700 rounded-2xl px-6 py-5 text-white text-lg placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-all resize-none"
              />
              <div className="absolute bottom-4 right-6 text-gray-600 text-xs font-medium">
                {description.length}/200
              </div>
            </div>

            <button
              onClick={onNext}
              disabled={!canNext}
              className={`group flex items-center justify-center gap-2 w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 ${
                canNext 
                ? 'bg-indigo-700 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              See what Vibe Hype writes for you
              <ArrowRight className={`w-5 h-5 transition-transform ${canNext ? 'group-hover:translate-x-1' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Right Column: Live Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden md:block w-full md:w-[40%] relative"
        >
          {/* Rocket Icon Floating */}
          <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-[#111827] border border-gray-700/50 flex items-center justify-center shadow-2xl z-10">
            <Rocket className="w-8 h-8 text-indigo-500/40" />
          </div>

          <div className="bg-[#111827] border border-gray-700/50 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
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
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">APP</span>
                <h2 className={`text-4xl font-bold transition-all duration-300 break-words ${appName ? 'text-white' : 'text-white/10'}`}>
                  {appName || 'Your app name'}
                </h2>
              </div>

              <div className="space-y-2">
                <p className={`text-lg leading-relaxed transition-all duration-300 ${description ? 'text-gray-400' : 'text-white/5'}`}>
                  {description || 'Your one-sentence description will appear here as Vibe Hype builds your marketing brain in real time.'}
                </p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-16 pt-8 border-t border-gray-800/50 flex items-center gap-2">
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

const ArrowRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);