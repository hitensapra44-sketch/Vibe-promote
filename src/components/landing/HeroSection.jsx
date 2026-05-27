import React from 'react';
import { ArrowRight } from 'lucide-react';
import Starfield from './Starfield';
import { useTheme } from '../../lib/ThemeContext';

export default function HeroSection() {
  const { theme } = useTheme();

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
          <span style={{ fontFamily: 'Geist, sans-serif', fontWeight: 600, fontSize: '12px', letterSpacing: '0.1em', color: '#E85D04', textTransform: 'uppercase' }}>
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
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/auth" className="hero-simple-btn">
            Start Free Now
            <ArrowRight className="w-4 h-4" />
          </a>
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
      </div>
      <style>{`
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .hero-simple-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Geist', sans-serif;
          font-weight: 700;
          font-size: 16px;
          background: #9C2000;
          color: #fff;
          padding: 14px 36px;
          border-radius: 10px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          z-index: 0;
          overflow: hidden;
        }
        .hero-simple-btn:hover {
          background: #E85D04;
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}