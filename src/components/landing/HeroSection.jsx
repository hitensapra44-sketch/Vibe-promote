import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Link as LinkIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('https://');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url || url === 'https://') return;
    localStorage.setItem('onboarding_url', url);
    navigate('/auth');
  };

  const leftPlatforms = [
    { id: 'reddit', name: 'Reddit', img: '/images/reddit.png', top: '20%', left: '8%' },
    { id: 'x', name: 'X / Twitter', img: '/images/x.png', top: '45%', left: '4%' },
    { id: 'indiehackers', name: 'Indie Hackers', img: '/images/indiehackers.png', top: '70%', left: '10%' },
  ];

  const rightPlatforms = [
    { id: 'hackernews', name: 'Hacker News', img: '/images/hackernews.png', top: '20%', right: '8%' },
    { id: 'threads', name: 'Threads', img: '/images/threads.png', top: '45%', right: '4%' },
    { id: 'producthunt', name: 'Product Hunt', img: '/images/producthunt.png', top: '70%', right: '10%' },
  ];

  return (
    <section id="hero" className="bg-white min-h-screen flex items-center justify-center py-24 md:py-32 relative overflow-hidden">
      {/* Elegant Curved SVG Connection Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left Lines */}
          <motion.path
            d="M 150 200 Q 350 250 720 350"
            stroke="#F97316"
            strokeWidth="1.5"
            strokeOpacity="0.15"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 100 450 Q 300 450 720 380"
            stroke="#F97316"
            strokeWidth="1.5"
            strokeOpacity="0.15"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 180 700 Q 380 650 720 410"
            stroke="#F97316"
            strokeWidth="1.5"
            strokeOpacity="0.15"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, -20] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          {/* Right Lines */}
          <motion.path
            d="M 1290 200 Q 1090 250 720 350"
            stroke="#F97316"
            strokeWidth="1.5"
            strokeOpacity="0.15"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, 20] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 1340 450 Q 1140 450 720 380"
            stroke="#F97316"
            strokeWidth="1.5"
            strokeOpacity="0.15"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, 20] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M 1260 700 Q 1060 650 720 410"
            stroke="#F97316"
            strokeWidth="1.5"
            strokeOpacity="0.15"
            strokeDasharray="4 4"
            animate={{ strokeDashoffset: [0, 20] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>

      {/* Left Side Platforms */}
      <div className="absolute inset-y-0 left-0 w-1/4 pointer-events-none hidden lg:block z-10">
        {leftPlatforms.map((p) => (
          <motion.div
            key={p.id}
            className="absolute pointer-events-auto flex flex-col items-center gap-2"
            style={{ top: p.top, left: p.left }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: p.id === 'x' ? 1 : p.id === 'indiehackers' ? 2 : 0 }}
          >
            <div className="w-16 h-16 rounded-full bg-white border border-zinc-100 shadow-md flex items-center justify-center p-3 hover:scale-110 hover:shadow-lg hover:border-orange-500/30 transition-all duration-300 cursor-pointer">
              <img src={p.img} alt={p.name} className="w-full h-full object-contain rounded-full" />
            </div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{p.name}</span>
          </motion.div>
        ))}
      </div>

      {/* Right Side Platforms */}
      <div className="absolute inset-y-0 right-0 w-1/4 pointer-events-none hidden lg:block z-10">
        {rightPlatforms.map((p) => (
          <motion.div
            key={p.id}
            className="absolute pointer-events-auto flex flex-col items-center gap-2"
            style={{ top: p.top, right: p.right }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: p.id === 'threads' ? 1 : p.id === 'producthunt' ? 2 : 0 }}
          >
            <div className="w-16 h-16 rounded-full bg-white border border-zinc-100 shadow-md flex items-center justify-center p-3 hover:scale-110 hover:shadow-lg hover:border-orange-500/30 transition-all duration-300 cursor-pointer">
              <img src={p.img} alt={p.name} className="w-full h-full object-contain rounded-full" />
            </div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{p.name}</span>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-8 max-w-full">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-geist text-[10px] sm:text-xs font-bold tracking-wider text-zinc-600 uppercase text-center">
            Built for founders who love building, not marketing
          </span>
        </div>

        {/* H1 */}
        <h1 className="font-geist font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-zinc-900 leading-tight tracking-tight max-w-4xl mb-6">
          Get Users Without Becoming <br />
          <span className="text-orange-500">Full-Time Marketer.</span>
        </h1>

        {/* Subtext */}
        <p className="font-geist font-normal text-sm sm:text-base md:text-lg text-zinc-500 max-w-3xl leading-relaxed mb-10">
          Stop wasting hours figuring out what to post, where your users hang out, and why growth feels so hard. Vibe Promote helps you find buyers, sharpen positioning, create content that sounds human, and grow your SaaS without marketing becoming another full-time job.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 w-full max-w-lg">
          <form onSubmit={handleSubmit} className="relative group w-full mb-2" style={{ zIndex: 10 }}>
            <div className="absolute inset-0 bg-orange-500/5 blur-xl group-hover:bg-orange-500/10 transition-all opacity-50" />
            <div className="relative flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="url"
                  placeholder="https://your-awesome-saas.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:border-orange-500 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!url || url === 'https://'}
                className="px-6 py-3.5 rounded-xl bg-white text-zinc-900 border-2 border-orange-500 hover:bg-orange-50 hover:shadow-[0_4px_12px_rgba(249,115,22,0.15)] font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-orange-500" /> Start for free
              </button>
            </div>
          </form>

          <div className="flex gap-4 flex-wrap justify-center">
            <a href="#how-it-works"
              className="font-geist font-bold text-sm sm:text-base text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 px-8 py-3 rounded-xl transition-all duration-250"
            >
              See how it works
            </a>
          </div>
          
          {/* Trust points under the button */}
          <div className="flex gap-6 flex-wrap justify-center mt-4 text-xs sm:text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-orange-500 font-bold">✓</span> no credit card required
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-500 font-bold">✓</span> 100% private, no data to train models
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}