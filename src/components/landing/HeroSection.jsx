import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import ParticleBackground from './particlebackground';
import { Link } from 'react-router-dom';
import SignupModal from './SignupModal';

export default function HeroSection({ joined, onJoined, onValidateEmail }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden font-poppins bg-transparent">
      <ParticleBackground />
      <SignupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onJoined={onJoined}
        onValidateEmail={onValidateEmail}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #b55933 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl"
        style={{ background: 'radial-gradient(circle, #9e4a2a 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-text-secondary">Love Building But Hate Marketing? You Are in Right Place.</span>
          </div>
        </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight break-words"
            style={{ letterSpacing: '-2px', lineHeight: 1.1 }}
          >
            93% Of App/Saas{' '}
            <span className="text-primary inline-block">
              Fails
            </span>{' '}
            Due To Bad Marketing. Don't Be One Of{' '}
            <span className="text-primary inline-block">
              Them.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-[0.7rem] sm:text-[0.75rem] md:text-[0.875rem] max-w-full mx-auto text-text-secondary"
            style={{ lineHeight: 1.4 }}
          >
        You didn’t build your product to become a full-time marketer. You build it cause you love it. Vibe Promote finds your audience in real conversations, tells you what to say, generates posts that converts and sound like you not gpt, and gives you clear analytics and strategies to grow. so you know what’s working and what’s not. This is app marketing on autopilot.
          </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 px-4"
        >
          <AnimatePresence mode="wait">
            {!joined ? (
              <motion.button
                key="start-free-btn"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(181, 89, 51, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="px-10 py-4 text-white font-bold text-lg rounded-xl bg-gradient-to-r from-[#b55933] to-[#9e4a2a] transition-all duration-300 shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                Start Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
             ) : (
               <motion.div
                 key="survey-btn"
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.5, ease: 'backOut' }}
               >
                 <Link
                   to="/survey"
                   className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold text-base rounded-xl bg-primary hover:bg-primary-hover transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-primary/20"
                 >
                    <span>Do Survey (34s)</span>
                    <ArrowRight className="w-4 h-4" />
                 </Link>
               </motion.div>
             )}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-sm font-medium text-text-secondary"
        >
          246 founders on the waitlist. No spam(pinky promise)
        </motion.p>
      </div>
    </section>
  );
}