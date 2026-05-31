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
    <section id="benefits" className="py-24 px-4 sm:px-6 font-poppins bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-orange-500">
            Benefits
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-zinc-900" style={{ letterSpacing: '-1px', lineHeight: 1.1 }}>
            Join Free or Go{' '}
            <span className="text-orange-500">
              All In
            </span>
          </h2>
          <p className="mt-3 text-base text-zinc-500">
            Join the free waitlist → get early access&nbsp;&nbsp;·&nbsp;&nbsp;Pre-purchase now → unlock real early advantages
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-400">
            ⚡ Over 146 app/SaaS founders joined already
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50"
        >
          {/* Table header */}
          <div className="grid grid-cols-3 text-center bg-zinc-100">
            <div className="px-4 py-5 text-left text-sm font-semibold text-zinc-900 border-r border-zinc-200">
              Benefit
            </div>
            <div className="px-4 py-5 text-sm font-semibold border-r border-zinc-200 text-zinc-600">
              Join Waitlist<br />
              <span className="text-xs font-normal text-zinc-400">(Free)</span>
            </div>
            <div className="px-4 py-5 text-sm font-semibold text-orange-500">
              Pre-Purchase Now<br />
              <span className="text-xs font-normal text-zinc-400">(less than coffee)</span>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-3 text-center border-t border-zinc-200 hover:bg-zinc-100/50 transition-colors"
            >
              <div className="px-4 py-4 text-left text-sm font-medium text-zinc-800 border-r border-zinc-200 flex items-center">
                {row.benefit}
              </div>
              <div className="px-4 py-4 flex items-center justify-center border-r border-zinc-200">
                {row.free
                  ? <Check className="w-5 h-5 text-green-600" />
                  : <X className="w-5 h-5 text-red-400" />}
              </div>
              <div className="px-4 py-4 flex items-center justify-center">
                {row.paid
                  ? <Check className="w-5 h-5 text-green-600" />
                  : <X className="w-5 h-5 text-red-400" />}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}