import React, { useState } from 'react';

const faqs = [
  {
    q: 'What exactly is Vibe Promote?',
    a: "Vibe Promote is an AI marketing co-pilot built specifically for bootstrapped SaaS founders. It learns your product through what we call your \"Brand Brain\" — your positioning, audience, tone, and goals — then generates ready-to-post content for Reddit, X, and LinkedIn. It also finds potential users in real conversations and gives you analytics to track what's working.",
  },
  {
    q: 'Is this actually a one-time payment? No hidden subscriptions?',
    a: "Yes. One payment, full access, forever. No monthly fees, no usage limits, no \"pro tier\" upsell. We built this for founders who are tired of yet another $49/month tool eating into their runway. You buy it once, and it's yours.",
  },
  {
    q: 'How is this different from just using ChatGPT?',
    a: "ChatGPT doesn't know your product, your audience, or your positioning. Every prompt starts from zero. Vibe Promote has your Brand Brain loaded — it knows your niche, your voice, your competitors, and your goals. The output is specific to your SaaS, not generic marketing advice anyone could Google.",
  },
  {
    q: 'What platforms does the content work for?',
    a: "Right now we generate content optimised for Reddit, X (Twitter), and LinkedIn — the three platforms where SaaS founders see the most organic traction. Each platform gets its own format: storytelling for Reddit, threads for X, thought leadership for LinkedIn.",
  },
  {
    q: 'Do I need to be a good writer to use this?',
    a: "Not at all. That's the whole point. You answer questions about your product and the AI handles the writing. You can tweak the output if you want, but most founders copy and post directly. The content is scored before you publish so you know it's good.",
  },
  {
    q: 'Will the AI content sound generic or robotic?',
    a: "No, and here's why: the Brand Brain captures your unique voice and positioning. The AI writes as if it were you — not a corporate blog. We specifically tuned the output to avoid that \"we leverage synergies\" energy. It sounds human because it's modeled on how real founders actually talk.",
  },
  {
    q: 'How long does onboarding take?',
    a: "About 5 minutes. You answer 8 questions about your product — or just paste your URL and the AI extracts everything automatically. Your Brand Brain is built instantly, and you can start generating content right away.",
  },
  {
    q: 'I just launched my product. Is it too early to use this?',
    a: "It's actually the perfect time. Most products fail because of marketing, not features. Getting your positioning right early means every post, every pitch, and every landing page works harder from day one. The earlier you start, the faster you grow.",
  },
  {
    q: "What if I'm not happy with it?",
    a: "We offer a no-questions-asked refund within 14 days. If Vibe Promote doesn't help you create better marketing content, you get your money back. Simple as that. We're confident you'll stay — but we don't want your money if it's not working for you.",
  },
  {
    q: 'Is my product data kept private?',
    a: "Absolutely. Your Brand Brain data is encrypted and never shared with other users or used to train models. Your product information, positioning, and content are yours alone. We take founder privacy seriously — your competitive advantage stays yours.",
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
            Questions founders ask before buying.
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