import React, { useState } from 'react';

const faqs = [
  {
    q: 'What exactly is Vibe Promote?',
    a: 'Vibe Promote is a marketing co-pilot built for SaaS founders and indie hackers. It helps you position your app better, find potential users, generate content for Reddit, X, and LinkedIn, and improve your marketing strategy using real performance insights.',
  },
  {
    q: 'Who is this built for?',
    a: 'Vibe Promote is built for founders who are doing their own marketing — especially solo founders, indie hackers, and small SaaS teams. If you hate spending hours figuring out what to post or where to find users, this is for you.',
  },
  {
    q: 'How is this different from ChatGPT?',
    a: 'ChatGPT starts from zero every time. Vibe Promote learns your product, audience, positioning, and brand voice through your Brand Brain, so the content and recommendations are tailored specifically to your app instead of generic marketing advice.',
  },
  {
    q: 'What platforms does it support?',
    a: 'Right now Vibe Promote is optimized for Reddit, X (Twitter), and LinkedIn — the platforms where most SaaS founders get organic traction. Each platform gets content tailored to how people actually engage there.',
  },
  {
    q: 'Can it really help me find users?',
    a: 'Yes. User Finder scans Reddit and online communities to surface conversations from people actively discussing problems your product solves. Instead of guessing where your audience is, you see real opportunities to engage.',
  },
  {
    q: 'Will the content sound robotic or AI-generated?',
    a: 'No. Vibe Promote uses your Brand Brain to match your positioning, tone, and writing style so the content feels natural and authentic instead of generic AI copy.',
  },
  {
    q: 'Do I need marketing experience to use this?',
    a: 'Not at all. Vibe Promote is designed for technical founders and builders, not marketers. The goal is to remove the guesswork and make marketing easier to execute consistently.',
  },
  {
    q: 'How long does onboarding take?',
    a: 'Usually under 5 minutes. You answer a few questions about your app or paste your website URL, and Vibe Promote builds your Brand Brain automatically.',
  },
  {
    q: 'Can I edit the generated content?',
    a: 'Of course. You can edit, regenerate, change tone, try different hooks, and experiment with multiple content variations before posting.',
  },
  {
    q: 'What kind of analytics does it provide?',
    a: 'You can track engagement, post performance, audience activity, and growth trends across platforms. Vibe Promote also helps you understand what content is actually driving results.',
  },
  {
    q: 'Can I connect my own accounts?',
    a: 'Yes. You can connect platforms like Reddit, X, and LinkedIn to sync analytics and manage your marketing workflow from one dashboard.',
  },
  {
   q: 'Why not just use multiple free tools?',
  a: 'You can — but most founders end up wasting hours switching between tools for research, writing, analytics, and strategy. Vibe Promote brings everything into one workflow built specifically for marketing apps and SaaS products.',
  },
  {
    q: 'Is my product data private?',
    a: 'Yes. Your product information, positioning, and content stay private and are never shared with other users.',
  },
  {
    q: 'What if my positioning changes later?',
    a: 'No problem. You can update your Brand Brain anytime as your product, audience, or strategy evolves.',
  },
  {
    q: 'What stage is Vibe Promote best for?',  
    a: 'Vibe Promote is especially useful for founders in the MVP, launch, and early growth stages who need help finding users, improving positioning, and marketing consistently without hiring a team.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(-1);

  const toggle = (i) => {
    setOpenIdx(openIdx === i ? -1 : i);
  };

  return (
    <section id="faq" className="py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="max-w-[760px] mx-auto">
        <div className="mb-12">
          <span className="font-dm text-xs tracking-[0.2em] uppercase text-primary font-medium">FAQ</span>
          <h2 className="font-syne text-3xl sm:text-4xl md:text-5xl text-foreground mt-3" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Questions you might be asking.
          </h2>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none', background: '#111111' }}>
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors"
                  onClick={() => toggle(i)}
                >
                  <span className="font-dm text-sm text-foreground font-medium pr-4">{faq.q}</span>
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-xs transition-all duration-300"
                    style={{
                      border: `1px solid ${isOpen ? 'rgba(232,93,4,0.5)' : 'rgba(255,255,255,0.15)'}`,
                      color: isOpen ? '#E85D04' : '#888',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? '300px' : '0', opacity: isOpen ? 1 : 0 }}
                >
                  <p className="font-dm text-sm text-muted-foreground leading-relaxed px-6 pb-5">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}