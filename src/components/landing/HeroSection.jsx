import React from 'react';
import { ArrowRight } from 'lucide-react';
import Starfield from './Starfield';

export default function HeroSection() {
  return (
    <section id="hero" style={{
      position: 'relative', height: '100vh', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000'
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
          <span style={{ fontFamily: 'Geist', fontWeight: 600, fontSize: '12px', letterSpacing: '0.1em', color: '#E85D04', textTransform: 'uppercase' }}>
            Built for founders who love building but hate marketing</span>
        </div>

        {/* H1 */}
        <h1 style={{
          fontFamily: 'Geist', fontWeight: 900,
          fontSize: 'clamp(40px, 6vw, 72px)',
          letterSpacing: '-0.04em', lineHeight: 1.1,
          color: '#F2EDE8', textAlign: 'center', maxWidth: '1000px',
          margin: '0 0 24px'
        }}>
          You Didn’t Build Your App/SaaS <br />
          <span style={{ color: '#9C2000' }}>To Become a Full-Time Marketer.</span>
        </h1>

        <h2 style={{
          fontFamily: 'Geist', fontWeight: 700, fontSize: '24px',
          color: '#F2EDE8', textAlign: 'center', marginBottom: '24px'
        }}>
          
        </h2>

        {/* Subtext */}
        <p style={{
          fontFamily: 'Geist', fontWeight: 400, fontSize: '18px',
          color: '#7A7672', maxWidth: '800px', textAlign: 'center',
          lineHeight: 1.7, margin: '0 0 40px'
        }}>
          Vibe Promote helps you position your app better, find your audience, create posts that sound like you not AI, and improve your content strategy using your current analytics. without wasting hours on marketing.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/auth" className="hero-glow-btn">
            Start Free Now
            <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#how-it-works"
          style={{
            fontFamily: 'Geist', fontWeight: 700, fontSize: '16px',
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

        {/* Stats */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '32px',
          marginTop: '56px', flexWrap: 'wrap', justifyContent: 'center'
        }}>
          {[
          { num: '2,400+', label: 'Indie founders' },
          { num: '18k+', label: 'Posts generated' },
          { num: 'One-time', label: 'No subscription' }].
          map((s, i) =>
          <React.Fragment key={s.num}>
              {i > 0 && <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.08)' }} />}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Geist', fontWeight: 800, fontSize: '26px', color: '#F2EDE8' }}>{s.num}</div>
                <div style={{ fontFamily: 'Geist', fontWeight: 400, fontSize: '13px', color: '#44403C' }}>{s.label}</div>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
      <style>{`
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .hero-glow-btn {
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
          transition: background 0.25s ease;
          animation: glowPulse 2.5s ease-in-out infinite;
          z-index: 0;
          overflow: hidden;
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 18px rgba(156,32,0,0.5), 0 0 36px rgba(232,93,4,0.25); }
          50% { box-shadow: 0 0 28px rgba(156,32,0,0.8), 0 0 56px rgba(232,93,4,0.4); }
        }
      `}</style>
    </section>
  );
}