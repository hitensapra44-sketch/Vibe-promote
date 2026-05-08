import React from 'react';
import ScrollReveal from './ScrollReveal';

const steps = [
  {
    num: '01',
    title: 'Tell us about your product',
    desc: 'Answer 8 quick questions or just drop your URL and our AI fills in the gaps. We extract your positioning, audience, and tone automatically.',
    label: 'Product Onboarding',
  },
  {
    num: '02',
    title: 'Get your positioning dialed in',
    desc: 'Our AI rewrites your messaging using proven frameworks — giving you a before/after card you can actually use.',
    label: 'Positioning Engine',
  },
  {
    num: '03',
    title: 'Generate and post your content',
    desc: 'One click generates X threads, LinkedIn posts, and hook variations — all written in your brand voice. Preview, copy, post.',
    label: 'Content Generator',
  },
];

function VideoPlaceholder({ label }) {
  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.07)',
        aspectRatio: '16/9',
      }}
    >
      {/* Orange gradient overlay */}
      <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
        style={{ background: 'radial-gradient(circle at top left, rgba(232,93,4,0.15), transparent 70%)' }} />
      
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(232,93,4,0.2)', border: '1px solid rgba(232,93,4,0.4)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#E85D04">
            <polygon points="6 3 20 12 6 21 6 3"/>
          </svg>
        </div>
      </div>

      {/* Label */}
      <div className="absolute bottom-3 left-3">
        <span className="font-dm text-xs text-muted-foreground px-2 py-1 rounded"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="font-dm text-xs tracking-[0.2em] uppercase text-primary font-medium">How It Works</span>
          <h2 className="font-syne text-3xl sm:text-4xl md:text-5xl text-foreground mt-3" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Three steps to a marketing machine.
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-20">
          {steps.map((step, i) => {
            const reversed = i === 1;
            return (
              <ScrollReveal key={step.num}>
                <div className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-10 md:gap-16 items-center`}>
                  {/* Text */}
                  <div className="flex-1 space-y-5">
                    <div
                      className="w-20 h-20 rounded-xl flex items-center justify-center font-syne text-2xl text-primary"
                      style={{
                        fontWeight: 800,
                        background: 'rgba(232,93,4,0.12)',
                        border: '1px solid rgba(232,93,4,0.3)',
                      }}
                    >
                      {step.num}
                    </div>
                    <h3 className="font-syne text-2xl sm:text-3xl text-foreground" style={{ fontWeight: 700 }}>
                      {step.title}
                    </h3>
                    <p className="font-dm text-muted-foreground leading-relaxed text-base">
                      {step.desc}
                    </p>
                  </div>
                  {/* Video */}
                  <div className="flex-1 w-full">
                    <VideoPlaceholder label={step.label} />
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}