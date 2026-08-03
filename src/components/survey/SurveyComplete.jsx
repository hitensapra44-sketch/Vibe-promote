import React, { useEffect, useRef } from 'react'; 
import { motion } from 'framer-motion'; 
import { Sparkles } from 'lucide-react'; 

function randomBetween(min, max) { 
  return Math.random() * (max - min) + min; 
} 

export default function SurveyComplete({ onDone }) { 
  const canvasRef = useRef(null); 

  useEffect(() => { 
    const canvas = canvasRef.current; 
    if (!canvas) return; 
    const ctx = canvas.getContext('2d'); 
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 

    const particles = []; 
    const colors = ['#b55933', '#9e4a2a', '#e5e5e5', '#3f3835', '#fff']; 

    class Particle { 
      constructor(x, y) { 
        this.x = x; 
        this.y = y; 
        this.vx = randomBetween(-6, 6); 
        this.vy = randomBetween(-10, -2); 
        this.alpha = 1; 
        this.size = randomBetween(3, 7); 
        this.color = colors[Math.floor(Math.random() * colors.length)]; 
        this.gravity = 0.18; 
        this.rotation = randomBetween(0, Math.PI * 2); 
        this.rotationSpeed = randomBetween(-0.1, 0.1); 
        this.shape = Math.random() > 0.5 ? 'circle' : 'rect'; 
      } 
      update() { 
        this.vy += this.gravity; 
        this.x += this.vx; 
        this.y += this.vy; 
        this.alpha -= 0.012; 
        this.rotation += this.rotationSpeed; 
      } 
      draw() { 
        ctx.save(); 
        ctx.globalAlpha = Math.max(0, this.alpha); 
        ctx.fillStyle = this.color; 
        ctx.translate(this.x, this.y); 
        ctx.rotate(this.rotation); 
        if (this.shape === 'circle') { 
          ctx.beginPath(); 
          ctx.arc(0, 0, this.size, 0, Math.PI * 2); 
          ctx.fill(); 
        } else { 
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.5); 
        } 
        ctx.restore(); 
      } 
    } 

    const burst = (x, y, count = 80) => { 
      for (let i = 0; i < count; i++) { 
        particles.push(new Particle(x, y)); 
      } 
    }; 

    // Multiple burst points 
    burst(canvas.width * 0.3, canvas.height * 0.4, 80); 
    burst(canvas.width * 0.7, canvas.height * 0.35, 80); 
    burst(canvas.width * 0.5, canvas.height * 0.55, 100); 

    setTimeout(() => burst(canvas.width * 0.2, canvas.height * 0.5, 60), 300); 
    setTimeout(() => burst(canvas.width * 0.8, canvas.height * 0.45, 60), 500); 
    setTimeout(() => burst(canvas.width * 0.5, canvas.height * 0.3, 90), 700); 

    let animId; 
    const animate = () => { 
      ctx.clearRect(0, 0, canvas.width, canvas.height); 
      for (let i = particles.length - 1; i >= 0; i--) { 
        particles[i].update(); 
        particles[i].draw(); 
        if (particles[i].alpha <= 0) particles.splice(i, 1); 
      } 
      if (particles.length > 0) { 
        animId = requestAnimationFrame(animate); 
      } 
    }; 
    animate(); 

    // Navigate after animation 
    const timer = setTimeout(() => onDone(), 2400); 

    return () => { 
      cancelAnimationFrame(animId); 
      clearTimeout(timer); 
    }; 
  }, [onDone]); 

  return ( 
    <div className="fixed inset-0 z-50 flex items-center justify-center font-poppins bg-bg-base"> 
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" /> 
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ duration: 0.5, ease: 'backOut' }} 
        className="relative z-10 text-center px-6" 
      > 
        <motion.div 
          animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }} 
          transition={{ duration: 0.6, delay: 0.3 }} 
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-primary" 
        > 
          <Sparkles className="w-10 h-10 text-white" /> 
        </motion.div> 
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }} 
          className="text-4xl font-bold text-text-primary mb-3" 
          style={{ letterSpacing: '-1px' }} 
        > 
          You're a Vibe! 🎉 
        </motion.h2> 
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.6 }} 
          className="text-lg text-text-secondary" 
        > 
          Survey complete. Taking you to your early-bird offer… 
        </motion.p> 
      </motion.div> 
    </div> 
  ); 
}
