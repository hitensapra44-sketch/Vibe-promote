import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function FooterSection({ joined }) {
  const navigate = useNavigate();

  return (
    <footer id="waitlist" className="font-poppins bg-transparent">
      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ letterSpacing: '-1px' }}>
              Ready to Make Your App/Saas{' '}
              <span className="text-primary">
                Impossible to Ignore?
              </span>
            </h2>
            <p className="text-base mb-8 text-text-secondary">
              {joined ? "You're already on the list! Start your survey above." : "Get early access + free viral template pack"}
            </p>

            {!joined && (
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(181, 89, 51, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
                className="px-10 py-4 text-white font-bold text-lg rounded-xl bg-gradient-to-r from-[#b55933] to-[#9e4a2a] transition-all duration-300 shadow-lg shadow-primary/20 flex items-center gap-2 mx-auto"
              >
                Start Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="border-t border-border-muted py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center bg-primary">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Vibe Promote</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-text-secondary">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Features
            </button>
            <button onClick={() => document.getElementById('howitworks')?.scrollIntoView({ behavior: 'smooth' })}>
              How it Works
            </button>
            <button onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}>
              Benefits
            </button>
          </div>

          <p className="text-sm text-text-secondary/60">
            © 2026 Vibe Promote. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}