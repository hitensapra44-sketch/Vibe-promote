import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: "I'm a solo founder and I barely have time for marketing.will this actually save me time?",
    a: "Yes you will save a lot of time. You do one quick 5-minute setup, then the AI handles everything else.",
  },
  {
    q: "I hate generic AI content that doesn't sound like me. Will the posts actually feel authentic?",
    a: "100%. You describe your app and your vibe once. The AI learns your product, your voice, and your audience so every post sounds exactly like something you would write.",
  },
  {
    q: "How do I know it's finding the right audience for my specific SaaS?",
    a: "It scans real-time conversations on Reddit, X, TikTok, and forums about the exact problems you solve. You'll see the actual threads where people are already looking for your app.",
  },
  {
    q: "Is this just another content tool, or does it actually drive sign-ups and growth?",
    a: "It's end-to-end growth. It tracks real engagement, reach, and sign-ups, then tells you exactly what to change so you get measurable increases. not just more posts.",
  },
  {
    q: "What happens if I pre-purchase the early bird now?",
    a: "You lock in early access at $1.99 — the lowest price we'll ever charge. You get notified first when the full tool goes. live, and you skip the waitlist completely.",
  },
];

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="border border-border-muted rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left bg-bg-surface hover:bg-bg-elevated transition-colors"
      >
        <span className="text-sm sm:text-base font-semibold text-white leading-snug">{faq.q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-primary" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-5 sm:px-6 pb-5 pt-1 text-sm sm:text-base leading-relaxed text-text-secondary">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 font-poppins bg-transparent">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-primary">
            FAQs
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-white" style={{ letterSpacing: '-1px', lineHeight: 1.1 }}>
            Got{' '}
            <span className="text-primary">
              Questions?
            </span>
          </h2>
          <p className="mt-3 text-base text-text-secondary">
            Everything you need to know before joining the hype.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}