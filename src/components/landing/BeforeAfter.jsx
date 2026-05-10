import React from 'react';
import ScrollReveal from './ScrollReveal';

const withoutItems = [
  "I have no idea where my audience hangs out",
  'Spending hours writing posts that get zero traction',
  'Staring at a blank page not knowing what to post',
  'Generic content that sounds robotic and fake',
  'Marketing taking more time than building the product',
  'Using too many tools that still require manual work',
  'Dont know what to improve or change according to current analytics',

];

const withItems = [
  'Find people already talking about problem your app solves',
  'Create posts that actually convert and sound natural',
  'Clear positioning that makes your app easy to understand with Detailed ICP',
  'Know what content and platforms drive real growth',
  'More time building, less time stressing about marketing',
  'Everything — audience discovery, content, and analytics from one place',

];

export default function BeforeAfter() {
  return (
    <section className="py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <span className="font-geist text-xs tracking-[0.2em] uppercase text-primary font-medium">The Difference</span>
          <h2 className="font-geist text-3xl sm:text-4xl md:text-5xl text-foreground mt-3" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            With or without Vibe Promote.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WITHOUT */}
          <ScrollReveal>
            <div className="rounded-xl overflow-hidden h-full" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-6 py-4" style={{ background: '#161616' }}>
                <span className="font-geist text-sm text-muted-foreground">You without Vibe Promote</span>
              </div>
              <img
                src="/without-vibe.gif"
                alt="Stressed founder"
                loading="lazy"
                className="w-full object-cover"
                style={{ height: '220px' }}
              />
              <div className="p-6 space-y-3">
                {withoutItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#555' }}>✕</span>
                    <span className="font-geist text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* WITH */}
          <ScrollReveal delay={100}>
            <div className="rounded-xl overflow-hidden h-full" style={{ background: '#111111', border: '1px solid rgba(232,93,4,0.3)' }}>
              <div className="px-6 py-4" style={{ background: 'rgba(232,93,4,0.12)', borderBottom: '1px solid rgba(232,93,4,0.3)' }}>
                <span className="font-geist text-sm text-primary">You with Vibe Promote</span>
              </div>
              <img
                src="/with-vibe.gif"
                alt="Success celebrating"
                loading="lazy"
                className="w-full object-cover"
                style={{ height: '220px' }}
              />
              <div className="p-6 space-y-3">
                {withItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs"
                      style={{ background: 'rgba(232,93,4,0.12)', color: '#E85D04' }}>✓</span>
                    <span className="font-geist text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}