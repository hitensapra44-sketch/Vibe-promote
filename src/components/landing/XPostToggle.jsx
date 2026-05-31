"use client";

import React, { useState } from 'react';

export default function XPostToggle() {
  const [on, setOn] = useState(false);

  const postOff = {
    title: 'I launched my SaaS, check it out',
    body: 'Hey everyone, I just launched a new tool for marketing. It Automate your saas marekting. Let me know what you think!',
    note: 'Vague headline. No hook. No context. Easy to ignore.',
  };

  const postOn = {
    title: "i'm a dev who hates manual marketing. so i built a thing that automate it",
    body: 'I did not hate marketing because it was hard. I hated it because it was alot time consuming, took a lot of effort, and didnt give enough back. 10 hours building a product is different from 10 hours marketing it. In 10 hours, I can ship new features. In 10 hours of marketing, I cannot get even 3 users. And I didnt build my app to become a full time marketer.What I always wanted was something that could take my product, understand the brand, and do the marketing for me like find users on Reddit and Hacker News, write replies, generate posts that sound like me, and show analytics so I know what is actually working.So I built it.Vibe Promote it automates SaaS marketing so you can keep building without worrying about promotion. It finds relevant users, helps create posts that sound like you and your brand not gpt and give replies, gives you proven viral post templates that already went viral so you can just click on button and make it for your brand, and have analytics where you track everything. And making a buddy which improves or changes your marketing strategy based on your growthVibe Promote goal is simple make marketing as easy as vibe coding. So you can keep building great things without ever worrying about how you will market it.Its free to try. lmk your feedback guys',
    note: 'Clear hook. Specific pain. Story-driven. Platform-native format.',
  };

  const post = on ? postOn : postOff;

  return (
    <section id="xpost" style={{ borderTop: '1px solid #f4f4f5', padding: '100px 40px' }} className="bg-white">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '11px', letterSpacing: '0.12em', color: '#F97316', textTransform: 'uppercase', marginBottom: '12px' }}>See The Difference</div>
          <h2 style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 'clamp(26px,4vw,48px)', color: '#18181b', letterSpacing: '-0.03em', margin: '0 0 12px' }}>
            The same idea. Two very different posts.
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: '16px', color: '#71717a', maxWidth: '480px', margin: '0 auto' }}>Toggle to see how Brand Brain context changes the output.</p>
        </div>

        {/* Toggle row */}
        <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center', gap: '14px', marginBottom: '40px' }}>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#71717a' }}>Without Vibe Promote</span>
          <button onClick={() => setOn(!on)}
          style={{
            width: '50px', height: '26px', borderRadius: '100px', cursor: 'pointer', position: 'relative',
            background: on ? '#F97316' : '#f4f4f5',
            border: `1px solid ${on ? '#F97316' : '#e4e4e7'}`,
            boxShadow: on ? '0 0 14px rgba(249,115,22,0.5)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)'
          }}>
            <span style={{
              position: 'absolute', top: '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
              left: on ? '27px' : '3px',
              transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)'
            }} />
          </button>
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#F97316' }}>With Vibe Promote</span>
        </div>

        {/* Post Card */}
        <div className="xpost-card" style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{
            background: '#fbfbfb', padding: '24px 28px', borderRadius: '14px',
            border: on ? '1px solid rgba(249,115,22,0.45)' : '1px solid #e4e4e7',
            boxShadow: on ? '0 0 36px rgba(249,115,22,0.12)' : 'none',
            transition: 'border-color 0.35s, box-shadow 0.35s'
          }}>
            {/* Platform label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: 600, color: '#FF4500', background: 'rgba(255,69,0,0.1)', border: '1px solid rgba(255,69,0,0.2)', borderRadius: '100px', padding: '3px 10px' }}>Reddit</span>
              <span style={{ fontFamily: 'Inter', fontSize: '11px', color: '#71717a' }}>r/SaaS</span>
            </div>

            {/* Title */}
            <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '15px', color: '#18181b', lineHeight: 1.4, marginBottom: '12px', transition: 'color 0.3s' }}>
              {post.title}
            </div>

            {/* Body */}
            <p style={{ fontFamily: 'Inter', fontSize: '13px', color: '#71717a', lineHeight: 1.65, margin: '0 0 16px' }}>
              {post.body}
            </p>

            {/* Note */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              background: on ? 'rgba(249,115,22,0.08)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${on ? 'rgba(249,115,22,0.2)' : '#e4e4e7'}`,
              borderRadius: '8px', padding: '10px 14px',
              transition: 'all 0.3s ease'
            }}>
              <span style={{ fontFamily: 'Inter', fontSize: '12px', color: on ? '#F97316' : '#71717a', lineHeight: 1.5 }}>
                {on ? '✓' : '✗'} {post.note}
              </span>
            </div>
          </div>
        </div>

        <p style={{ fontFamily: 'Inter', fontSize: '13px', textAlign: 'center', marginTop: '20px', color: '#333' }}>
        </p>
      </div>
    </section>
  );
}
</dyad-file>

<dyad-chat-summary>Redesigned the entire landing page to feature a premium white background and dark text theme with orange accents.</dyad-chat-summary>

I have successfully updated all the landing page components to match the premium white background (`#ffffff`) and dark text theme of the new `HeroSection` and `NavBar`. All sections now look clean, modern, and highly professional!<dyad-write path="src/pages/Home.jsx" description="Updating the main Home landing page wrapper to use a pure white background, dark text, and light spotlight card styles.">
import React, { useEffect } from 'react';
import NavBar from '../components/landing/navbar';
import HeroSection from '../components/landing/HeroSection';
import BrandScroller from '../components/landing/BrandScroller';
import HowItWorks from '../components/landing/howitworks';
import FeaturesSection from '../components/landing/FeaturesSection';
import BeforeAfter from '../components/landing/BeforeAfter';
import XPostToggle from '../components/landing/XPostToggle';
import Solution from '../components/landing/Solution';
import WhySection from '../components/landing/WhySection';
import SocialTestimonials from '../components/landing/SocialTestimonials';
import FAQ from '../components/landing/faqs';
import Footer from '../components/landing/fottersection';

export default function Home() {
  useEffect(() => {
    // Spotlight card mouse tracking
    const onMouseMove = (e) => {
      document.querySelectorAll('.spotlight-card').forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100;
        const y = (e.clientY - rect.top) / rect.height * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    };
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div className="bg-white min-h-screen font-geist text-zinc-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        /* Spotlight card effect */
        .spotlight-card {
          position: relative;
          background: #fbfbfb;
          border: 1px solid #e4e4e7;
          border-radius: 12px;
          transition: border-color 0.25s ease;
          overflow: hidden;
        }
        .spotlight-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.4s ease;
          background: radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(249,115,22,0.1) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }
        .spotlight-card:hover::before { opacity: 1; }
        .spotlight-card:hover { border-color: rgba(249,115,22,0.45); }
        .spotlight-card > * { position: relative; z-index: 1; }

        @keyframes brandScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      
      <NavBar />
      <HeroSection />
      <BrandScroller />
      <HowItWorks />
      <FeaturesSection />
      <BeforeAfter />
      <XPostToggle />
      <Solution />
      <WhySection />
      <SocialTestimonials />
      <FAQ />
      
      {/* CTA Section */}
      <section id="cta" className="py-24 px-6 bg-white" style={{ borderTop: '1px solid #f4f4f5' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="relative border border-orange-500/30 rounded-2xl p-12 sm:p-20 text-center overflow-hidden" style={{ background: '#fbfbfb' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-0.5 bg-orange-500" />
            <span className="font-geist text-xs tracking-[0.2em] uppercase text-orange-500 font-semibold">Start Today</span>
            <h2 className="font-geist text-3xl sm:text-4xl md:text-5xl text-zinc-900 mt-4 mb-10" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Stop overthinking your <span className="text-orange-500">marketing.</span>
            </h2>
            <a
              href="/auth"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-orange-500 text-white font-bold text-lg transition-all hover:bg-orange-600 hover:shadow-[0_8px_28px_rgba(249,115,22,0.45)]"
            >
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const ArrowRight = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);