import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Link as LinkIcon, Sparkles } from 'lucide-react';
import Starfield from './Starfield';
import { useTheme } from '../../lib/ThemeContext';

export default function HeroSection() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [url, setUrl] = useState('https://');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url || url === 'https://') return;
    localStorage.setItem('onboarding_url', url);
    navigate('/auth');
  };

  return (
    <section id="hero" className="bg-background min-h-screen flex items-center justify-center py-20 md:py-28" style={{
      position: 'relative', overflow: 'hidden'
    }}>
      <Starfield />
      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 mb-8 max-w-full">
          <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-[#9C2000] flex-shrink-0" />
          <span className="font-geist text-[10px] sm:text-xs font-semibold tracking-wider text-white uppercase text-center">
            Built for founders who love building not marketing
          </span>
        </div>

        {/* H1 */}
        <h1 className="font-geist font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#F2EDE8] leading-tight tracking-tight max-w-4xl mb-6">
          Get Users Without Becoming <br />
          <span className="text-primary">Full-Time Marketer.</span>
        </h1>

        {/* Subtext */}
        <p className="font-geist font-normal text-sm sm:text-base md:text-lg text-white/80 max-w-3xl leading-relaxed mb-10">
          Stop wasting hours figuring out what to post, where your users hang out, and why growth feels so hard. Vibe Promote helps you find buyers, sharpen positioning, create content that sounds human, and grow your SaaS without marketing becoming another full-time job.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 w-full max-w-lg">
          <form onSubmit={handleSubmit} className="relative group w-full mb-2" style={{ zIndex: 10 }}>
            <div className="absolute inset-0 bg-primary/10 blur-xl group-hover:bg-primary/20 transition-all opacity-50" />
            <div className="relative flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="url"
                  placeholder="https://your-awesome-saas.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-zinc-900 backdrop-blur-xl border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!url || url === 'https://'}
                className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20 border-none cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Start for free
              </button>
            </div>
          </form>

          <div className="flex gap-4 flex-wrap justify-center">
            <a href="#how-it-works"
              className="font-geist font-bold text-sm sm:text-base text-zinc-400 hover:text-white border border-white/10 hover:border-white/25 px-8 py-3 rounded-xl transition-all duration-250"
            >
              See how it works
            </a>
          </div>
          
          {/* Trust points under the button */}
          <div className="flex gap-6 flex-wrap justify-center mt-4 text-xs sm:text-sm text-white/70">
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">✓</span> no credit card required
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">✓</span> 100% private no data to train models
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </section>
  );
}