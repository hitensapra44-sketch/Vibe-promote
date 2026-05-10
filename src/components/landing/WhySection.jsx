import React from 'react';
import ScrollReveal from './ScrollReveal';

const cards = [
  {
    num: '01 / FOUNDER-LED',
    title: "You're building, marketing, and supporting your product alone",
    desc: 'Vibe Promote is built for the solo founder. You don’t have time to learn marketing frameworks, brainstorm content daily, or manage five different tools. You just need a faster way to grow your app/saas',
  },
  {
    num: '02 / POSITIONING',
    title: 'Your product is good but nobody gets it',
    desc: "You know your app is valuable but explaining it clearly is harder than building it. Vibe Promote helps you sharpen your positioning so people instantly understand why it matters and why its fo them.",
  },
  {
    num: '03 / BAD CONSISTENCY',
    title: 'You disappear for days because marketing feels exhaustings',
    desc: "Posting consistently is hard when every post takes too much time and mental energy. When posting takes 60 seconds, you actually do it consistently.",
  },
  {
    num: '04 / TOO MANY TOOLS',
    title: "You're tired of jumping between 10 different tools just to market your app",
    desc: 'One tool for analytics, another for writing, another for research, another for planning and somehow marketing still feels messy. Vibe Promote brings everything into one workflow built for founders.',
  },
];

export default function WhySection() {
  return (
    <section id="why-us" className="py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <span className="font-dm text-xs tracking-[0.2em] uppercase text-primary font-medium">Why Vibe Promote</span>
          <h2 className="font-syne text-3xl sm:text-4xl md:text-5xl text-foreground mt-3" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
             Built for founders trying to grow their app/saas without becoming marketers.          </h2>
          <p className="font-dm text-muted-foreground mt-3 max-w-lg mx-auto">
            If any of these sound familiar, Vibe Promote was made for you..
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div
                className="p-8 rounded-xl h-full transition-all duration-300 group cursor-default"
                style={{
                  background: '#111111',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(232,93,4,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
              >
                <span className="font-dm text-xs tracking-[0.15em] text-primary" style={{ fontFamily: 'monospace' }}>
                  {card.num}
                </span>
                <h4 className="font-syne text-xl text-foreground mt-3 mb-3" style={{ fontWeight: 700 }}>
                  {card.title}
                </h4>
                <p className="font-dm text-sm text-muted-foreground leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}