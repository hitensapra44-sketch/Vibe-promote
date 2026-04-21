import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import ParticleBackground from '../landing/particlebackground';
import GridBackground from '../ui/grid-background';

export default function WelcomeScreen({ onComplete }) {
  useEffect(() => {
    // Celebration animation (Crackers/Confetti)
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 110 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // Redirect after 3.5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-base overflow-hidden font-poppins">
      {/* Background elements to match Hero section */}
      <GridBackground />
      <ParticleBackground />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-primary" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl bg-primary" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 text-center px-4"
      >
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white leading-tight whitespace-nowrap">
          Welcome To Vibe <span className="text-primary">Promote</span>
        </h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-text-secondary text-lg sm:text-xl"
        >
          Preparing your marketing cockpit...
        </motion.p>
      </motion.div>
    </div>
  );
}