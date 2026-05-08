import React, { useState, useEffect } from 'react';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="font-syne font-800 text-xl tracking-tight text-foreground" style={{ fontWeight: 800 }}>
          Vibe<span className="text-primary">Promote</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="font-dm text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          <a href="#features" className="font-dm text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#faq" className="font-dm text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </div>

        <a
          href="#cta"
          className="font-dm text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-300"
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
          Get Early Access →
        </a>
      </div>
    </nav>
  );
}