import React from 'react';

export default function Footer() {
  return (
    <footer className="py-8 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="max-w-[1100px] mx-auto flex items-center justify-between">
        <span className="font-syne text-lg text-foreground" style={{ fontWeight: 800 }}>
          Vibe<span className="text-primary">Promote</span>
        </span>
        <div className="flex items-center gap-6">
          <a href="/privacy" className="font-dm text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="/terms" className="font-dm text-xs text-muted-foreground hover:text-foreground transition-colors">Terms & Conditions</a>
          <span className="font-dm text-xs text-muted-foreground">
            © 2026 Vibe Promote. Built by a founder, for founders.
          </span>
        </div>
      </div>
    </footer>
  );
}