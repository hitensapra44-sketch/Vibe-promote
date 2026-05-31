import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="py-12 px-6 bg-white" style={{ borderTop: '1px solid #f4f4f5' }}>
      <div className="max-w-[1100px] mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="font-syne text-lg text-zinc-900" style={{ fontWeight: 800 }}>
            Vibe<span className="text-orange-500">Promote</span>
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="mailto:vibepromote@gmail.com" className="font-dm text-xs text-orange-600 font-bold hover:text-orange-700 transition-colors">Support</a>
            <Link to="/privacy" className="font-dm text-xs text-zinc-500 hover:text-zinc-900 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="font-dm text-xs text-zinc-500 hover:text-zinc-900 transition-colors">Terms & Conditions</Link>
            <span className="font-dm text-xs text-zinc-400">
              © 2026 Vibe Promote. Built by a founder, for founders.
            </span>
          </div>
        </div>

        {/* SEO Internal Links Hub */}
        <div className="border-t border-zinc-100 pt-8">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 text-center sm:text-left">
            Marketing Resources & Solutions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-xs">
            <Link to="/ai-marketing-tool" className="text-zinc-500 hover:text-orange-500 transition-colors">AI Marketing Tool</Link>
            <Link to="/saas-marketing-tool" className="text-zinc-500 hover:text-orange-500 transition-colors">SaaS Marketing Tool</Link>
            <Link to="/indie-hacker-marketing" className="text-zinc-500 hover:text-orange-500 transition-colors">Indie Hacker Marketing</Link>
            <Link to="/reddit-marketing-tool" className="text-zinc-500 hover:text-orange-500 transition-colors">Reddit Marketing Tool</Link>
            <Link to="/marketing-copilot" className="text-zinc-500 hover:text-orange-500 transition-colors">AI Marketing Copilot</Link>
            <Link to="/startup-marketing-tool" className="text-zinc-500 hover:text-orange-500 transition-colors">Startup Marketing Tool</Link>
            <Link to="/bootstrapped-founder-marketing" className="text-zinc-500 hover:text-orange-500 transition-colors">Bootstrapped Founder Marketing</Link>
            <Link to="/how-to-market-your-saas" className="text-zinc-500 hover:text-orange-500 transition-colors">How to Market Your SaaS</Link>
            <Link to="/best-ai-marketing-tools-for-founders" className="text-zinc-500 hover:text-orange-500 transition-colors">Best AI Marketing Tools</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}