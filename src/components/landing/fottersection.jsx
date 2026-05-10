import React from 'react';

export default function Footer() {
  return (
    <footer className="py-8 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <span className="font-syne text-lg text-foreground" style={{ fontWeight: 800 }}>
          Vibe<span className="text-primary">Promote</span>
        </span>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <a href="mailto:vibepromote@gmail.com" className="font-dm text-xs text-primary font-bold hover:text-white transition-colors">Support</a>
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