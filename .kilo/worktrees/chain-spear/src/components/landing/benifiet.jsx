import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const rows = [
  { benefit: 'Early beta access when Vibe Hype launches', free: true, paid: true },
  { benefit: 'Weekly founder updates + community access(When launched)', free: true, paid: true },
  { benefit: '!st month pro subscription discount', free: false, paid: true },
  { benefit: 'Unlimited agentic mode + priority support(When launched)', free: false, paid: true },
  { benefit: 'Personal brand voice setup + 3 custom vibe packs', free: false, paid: true },
];

export default function BenefitsTable() {
  return (
    <section id="benefits" className="py-24 px-4 sm:px-6 font-poppins bg-transparent">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <span className="text-xs font-semibold tracking-widest uppercase bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg, #7C3AED, #EC4899)' }}>
            Benefits
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-white" style={{ letterSpacing: '-1px', lineHeight: 1.1 }}>
            Join Free or Go{' '}
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #7C3AED, #EC4899)' }}>
              All In
            </span>
          </h2>
          <p className="mt-3 text-base" style={{ color: '#A1A1AA' }}>
            Join the free waitlist → get early access&nbsp;&nbsp;·&nbsp;&nbsp;Pre-purchase now → unlock real early advantages
          </p>
          <p className="mt-2 text-sm font-medium" style={{ color: '#71717A' }}>
            ⚡ Over 146 app/SaaS founders joined already
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 rounded-2xl overflow-hidden border border-white/8"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          {/* Table header */}
          <div className="grid grid-cols-3 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.1))' }}>
            <div className="px-4 py-5 text-left text-sm font-semibold text-white border-r border-white/5">
              Benefit
            </div>
            <div className="px-4 py-5 text-sm font-semibold border-r border-white/5"
              style={{ color: '#A1A1AA' }}>
              Join Waitlist<br />
              <span className="text-xs font-normal text-gray-500">(Free)</span>
            </div>
            <div className="px-4 py-5 text-sm font-semibold bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #7C3AED, #EC4899)' }}>
              Pre-Purchase Now<br />
              <span className="text-xs font-normal text-gray-400">(less than coffee)</span>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-3 text-center border-t border-white/5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="px-4 py-4 text-left text-sm font-medium text-white border-r border-white/5 flex items-center">
                {row.benefit}
              </div>
              <div className="px-4 py-4 flex items-center justify-center border-r border-white/5">
                {row.free
                  ? <Check className="w-5 h-5 text-green-400" />
                  : <X className="w-5 h-5 text-red-400/60" />}
              </div>
              <div className="px-4 py-4 flex items-center justify-center">
                {row.paid
                  ? <Check className="w-5 h-5 text-green-400" />
                  : <X className="w-5 h-5 text-red-400/60" />}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}