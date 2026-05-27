import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ParticleBackground from '../landing/particlebackground';
import GridBackground from '../ui/grid-background';

export default function StartScreen({ onStart }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-base overflow-hidden font-poppins">
      <GridBackground />
      <ParticleBackground />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-primary" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl bg-primary" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl text-center px-6"
      >
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
          Welcome to the era of <br />
          <span className="text-primary">vibe marketing.</span>
        </h1>
        
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground/90 mb-6">
          You build it. We grow it.
        </h2>
        
        <p className="text-text-secondary text-base sm:text-lg mb-10 leading-relaxed">
          Let’s get you set up. We’ll find your audience, shape your message, and put your app in front of the right people in 60 seconds.
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="px-10 py-4 text-white font-bold text-lg rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-colors flex items-center gap-2 mx-auto"
        >
          Let's go
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}