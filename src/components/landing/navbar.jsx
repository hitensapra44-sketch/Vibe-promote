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
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: theme === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="font-geist text-xl tracking-tight text-foreground" style={{ fontWeight: 800 }}>
          Vibe<span className="text-primary">Promote</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="font-geist text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          <a href="#features" className="font-geist text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#difference" className="font-geist text-sm text-muted-foreground hover:text-foreground transition-colors">Why us</a>
          <a href="/pricing" className="font-geist text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#why-us" className="font-geist text-sm text-muted-foreground hover:text-foreground transition-colors">Solution</a>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-foreground/5 transition-colors text-foreground bg-transparent border-none cursor-pointer flex items-center justify-center"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-zinc-700" />}
          </button>

          <a
            href="/auth"
            className="font-geist text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-300"
            style={{
              background: '#E85D04',
              color: '#fff',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 0 24px rgba(232,93,4,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Start for Free →
          </a>
        </div>
      </div>
    </nav>
  );
}