import React from 'react';
import { motion } from 'framer-motion';
import { UserX, HelpCircle, Layers, BarChart3, Clock, RefreshCw } from 'lucide-react';

const problems = [
  {
    icon: UserX,
    text: "You have no clue who your real target audience is, where they are, or who they even are",
  },
  {
    icon: HelpCircle,
    text: "Writing posts in ChatGPT that sound nothing like you",
  },
  {
    icon: Layers,
    text: "You're using 10+ apps still doing badly in marketing",
  },
  {
    icon: BarChart3,
    text: "You don't have detailed analytics to see whats working and whats not",
  },
  {
    icon: Clock,
    text: "Marketing takes too much manual work like research, create, post and analyze",
  },
  {
    icon: RefreshCw,
    text: "You don't know what to change in your strategy based on this week's or month's growth",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-24 px-4 sm:px-6 font-poppins bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-zinc-900 px-2" style={{ letterSpacing: '-1px', lineHeight: 1.2 }}>
            Problems You Are Facing That{' '}
            <span className="text-orange-500">
              Our App Solves
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative group p-6 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-white transition-all duration-300 hover:border-orange-500/30"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-orange-50">
                  <p.icon className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-base leading-relaxed text-zinc-700">
                  {p.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}