import React, { useEffect } from 'react';
import NavBar from '../components/landing/navbar';
import HeroSection from '../components/landing/HeroSection';
import BrandScroller from '../components/landing/BrandScroller';
import HowItWorks from '../components/landing/howitworks';
import FeaturesSection from '../components/landing/FeaturesSection';
import BeforeAfter from '../components/landing/BeforeAfter';
import XPostToggle from '../components/landing/XPostToggle';
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
    <div className="bg-black min-h-screen font-geist">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        /* Spotlight card effect */
        .spotlight-card {
          position: relative;
          background: #0F0F14;
          border: 1px solid rgba(255,255,255,0.06);
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
          background: radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(156,32,0,0.12) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }
        .spotlight-card:hover::before { opacity: 1; }
        .spotlight-card:hover { border-color: rgba(156,32,0,0.45); }
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
      <WhySection />
      <SocialTestimonials />
      <FAQ />
      
      {/* CTA Section */}
      <section id="cta" className="py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="relative border border-[#9C2000]/35 rounded-2xl p-12 sm:p-20 text-center overflow-hidden" style={{ background: '#0F0F14' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-0.5 bg-[#9C2000]" />
            <span className="font-geist text-xs tracking-[0.2em] uppercase text-primary font-medium">Start Today</span>
            <h2 className="font-geist text-3xl sm:text-4xl md:text-5xl text-foreground mt-4 mb-10" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Stop overthinking your <span className="text-primary">marketing.</span>
            </h2>
            <a
              href="/auth"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-[#9C2000] text-white font-bold text-lg transition-all hover:bg-[#E85D04] hover:shadow-[0_8px_28px_rgba(156,32,0,0.45)]"
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