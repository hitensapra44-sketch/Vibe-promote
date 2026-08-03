import React, { useState, useEffect } from 'react';
import { useTheme } from '../../lib/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/90 border-b border-zinc-100"
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="font-geist text-xl tracking-tight text-zinc-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
          <img src="/logo.png" alt="Vibe Promote Logo" className="w-6 h-6 object-contain" />
          Vibe<span className="text-orange-500">Promote</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="font-geist text-sm text-zinc-500 hover:text-zinc-900 transition-colors">How it works</a>
          <a href="#features" className="font-geist text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Features</a>
          <a href="#difference" className="font-geist text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Why us</a>
          <a href="/pricing" className="font-geist text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Pricing</a>
          <a href="#why-us" className="font-geist text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Solution</a>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/auth"
            className="font-geist text-sm font-bold px-5 py-2.5 rounded-lg transition-all duration-300 bg-white text-zinc-900 border-2 border-orange-500 hover:bg-orange-50 hover:shadow-[0_4px_12px_rgba(249,115,22,0.15)]"
          >
            Start for Free →
          </a>
        </div>
      </div>
    </nav>
  );
}