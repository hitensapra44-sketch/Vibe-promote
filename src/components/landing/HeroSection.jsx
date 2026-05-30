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
    <section id="hero" className="bg-background" style={{
      position: 'relative', height: '100vh', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Starfield />
      <div style={{
        position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', paddingTop: '100px', padding: '100px 24px 0'
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(156,32,0,0.15)', border: '1px solid rgba(156,32,0,0.3)',
          borderRadius: '100px', padding: '6px 16px', marginBottom: '32px'
        }}>
          <span className="pulse-dot" style={{
            width: '6px', height: '6px', borderRadius: '50%', background: '#9C2000',
            display: 'inline-block', flexShrink: 0
          }} />
          <span style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '12px', letterSpacing: '0.1em', color: '#FFFFFF', textTransform: 'uppercase' }}>
            Built for founders who love building not marketing</span>
        </div>

        {/* H1 */}
        <h1 style={{
          fontFamily: 'Geist, sans-serif', fontWeight: 900,
          fontSize: 'clamp(40px, 6vw, 72px)',
          letterSpacing: '-0.04em', lineHeight: 1.1,
          color: '#F2EDE8', textAlign: 'center', maxWidth: '1000px',
          margin: '0 0 24px'
        }}>
          Get Users Without Becoming <br />
          <span style={{ color: '#9C2000' }}>Full-Time Marketer.</span>
        </h1>

        {/* Subtext */}
        <p style={{
          fontFamily: 'Geist, sans-serif', fontWeight: 400, fontSize: '18px',
          color: '#FFFFFF', maxWidth: '800px', textAlign: 'center',
          lineHeight: 1.7, margin: '0 0 40px'
        }}>
          Stop wasting hours figuring out what to post, where your users hang out, and why growth feels so hard. Vibe Promote helps you find buyers, sharpen positioning, create content that sounds human, and grow your SaaS. without marketing becoming another full-time job.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '500px' }}>
          <form onSubmit={handleSubmit} className="relative group w-full mb-4" style={{ zIndex: 10 }}>
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
                <Sparkles className="w-4 h-4" /> Analyze & Start
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="#how-it-works"
            style={{
              fontFamily: 'Geist, sans-serif', fontWeight: 700, fontSize: '16px',
              background: 'transparent', color: '#7A7672',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '14px 36px', borderRadius: '10px',
              textDecoration: 'none', transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';e.currentTarget.style.color = '#F2EDE8';}}
            onMouseLeave={(e) => {e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';e.currentTarget.style.color = '#7A7672';}}>
              See how it works
            </a>
          </div>
          
          {/* Trust points under the button */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Geist, sans-serif', fontSize: '13px', color: '#FFFFFF' }}>
              <span style={{ color: '#9C2000' }}>✓</span> no credit card required
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Geist, sans-serif', fontSize: '13px', color: '#FFFFFF' }}>
              <span style={{ color: '#9C2000' }}>✓</span> 100% private no data to train models
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