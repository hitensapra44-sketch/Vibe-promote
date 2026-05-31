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
  'Tracking tasks: daily marketing tasks that you can just click start and it will run in the app according to your goal and track the progress for your marketing goal',
];

export default function BeforeAfter() {
  return (
    <section id="difference" className="py-24 px-6 bg-white" style={{ borderTop: '1px solid #f4f4f5' }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <span className="font-geist text-xs tracking-[0.2em] uppercase text-orange-500 font-semibold">The Difference</span>
          <h2 className="font-geist text-3xl sm:text-4xl md:text-5xl text-zinc-900 mt-3" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            With or without Vibe Promote.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WITHOUT */}
          <ScrollReveal>
            <div className="rounded-xl overflow-hidden h-full flex flex-col bg-zinc-50" style={{ border: '1px solid #e4e4e7' }}>
              <div className="px-6 py-4 bg-zinc-100" style={{ borderBottom: '1px solid #e4e4e7' }}>
                <span className="font-geist text-sm text-zinc-700 font-semibold">You without Vibe Promote</span>
              </div>
              <div className="p-6 space-y-3 flex-1">
                {withoutItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs bg-zinc-200 text-zinc-500">✕</span>
                    <span className="font-geist text-sm text-zinc-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* WITH */}
          <ScrollReveal delay={100}>
            <div className="rounded-xl overflow-hidden h-full flex flex-col bg-orange-50/30" style={{ border: '1px solid rgba(249,115,22,0.3)' }}>
              <div className="px-6 py-4 bg-orange-50" style={{ borderBottom: '1px solid rgba(249,115,22,0.2)' }}>
                <span className="font-geist text-sm text-zinc-900 font-semibold">You with Vibe Promote</span>
              </div>
              <div className="p-6 space-y-3 flex-1">
                {withItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs bg-orange-100 text-orange-600">✓</span>
                    <span className="font-geist text-sm text-zinc-800 font-medium">{item}</span>
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