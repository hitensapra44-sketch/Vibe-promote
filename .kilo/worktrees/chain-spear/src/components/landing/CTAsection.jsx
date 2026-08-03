import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 font-poppins bg-transparent">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ letterSpacing: '-1px', lineHeight: 1.1 }}>
            Be First Now. Pay Less Later.{' '}
            <span className="text-primary">
              Win Big Forever.
            </span>
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Ready to make that headache marketing into vibe marketing?
          </p>
        </motion.div>

      </div>
    </section>
  );
}