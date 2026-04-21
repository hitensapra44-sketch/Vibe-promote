import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import ParticleBackground from '../landing/particlebackground';

export default function WelcomeScreen({ onComplete }) {
  useEffect(() => {
    // Celebration animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

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

    // Redirect after 3 seconds
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
      <ParticleBackground />
      
      {/* Grid background is global, so it will show through if we use bg-transparent or similar, 
          but here we use bg-bg-base to ensure a clean transition if needed, 
          or we can keep it transparent. Let's use transparent to keep the grid. */}
      <div className="absolute inset-0 bg-transparent" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 text-center px-4"
      >
        <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight">
          Welcome To <br />
          Vibe <span className="text-primary">Promote</span>
        </h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-text-secondary text-lg"
        >
          Preparing your marketing cockpit...
        </motion.p>
      </motion.div>
    </div>
  );
}