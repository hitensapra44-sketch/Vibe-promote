import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link as LinkIcon, Sparkles } from 'lucide-react';
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
  const navigate = useNavigate();
  const [ctaUrl, setCtaUrl] = useState('https://');

  const handleCtaSubmit = (e) => {
    e.preventDefault();
    if (!ctaUrl || ctaUrl === 'https://') return;
    localStorage.setItem('onboarding_url', ctaUrl);
    navigate('/auth');
  };

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
    <div className="bg-background min-h-screen font-geist">
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
      <Solution />
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
            
            <form onSubmit={handleCtaSubmit} className="relative group w-full max-w-lg mx-auto mb-6" style={{ zIndex: 10 }}>
              <div className="absolute inset-0 bg-orange-500/5 blur-xl group-hover:bg-orange-500/10 transition-all opacity-50" />
              <div className="relative flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="url"
                    placeholder="https://your-awesome-saas.com"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-sm focus:outline-none focus:border-orange-500 transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!ctaUrl || ctaUrl === 'https://'}
                  className="px-6 py-3.5 rounded-xl bg-white text-zinc-900 border-2 border-orange-500 hover:bg-orange-50 hover:shadow-[0_4px_12px_rgba(249,115,22,0.15)] font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-orange-500" /> Start for free
                </button>
              </div>
            </form>

            <div className="flex gap-6 flex-wrap justify-center mt-4 text-xs sm:text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="text-orange-500 font-bold">✓</span> no credit card required
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500 font-bold">✓</span> 100% private, no data to train models
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}