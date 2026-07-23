"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronUp, ChevronDown, Rocket, Target, Zap, Check } from 'lucide-react';
import { useGrowthState } from '../lib/useGrowthState';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';

export default function TaskWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { data: state, isLoading } = useGrowthState();

  if (isLoading || !state) return null;

  const tasks = state.onboardingComplete ? state.tasks : state.onboardingTasks;
  const completedCount = tasks.filter(t => t.completed || t.status === 'completed').length;
  const progressPercent = (completedCount / tasks.length) * 100;

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[300px] bg-background border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <header className="px-5 py-4 border-b border-foreground/5 bg-foreground/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {state.onboardingComplete ? <Rocket className="w-4 h-4 text-orange-500" /> : <Zap className="w-4 h-4 text-orange-500" />}
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {state.onboardingComplete ? `Day ${state.currentDay} Sprint` : 'Onboarding'}
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-foreground/40 hover:text-foreground bg-transparent border-none">
                <ChevronDown className="w-4 h-4" />
              </button>
            </header>

            <div className="p-2 max-h-[320px] overflow-y-auto scrollbar-hide">
              {tasks.map((task, i) => {
                const isDone = task.completed || task.status === 'completed';
                return (
                  <button
                    key={task.id || i}
                    onClick={() => {
                      if (!isDone) navigate(task.route || '/dashboard');
                    }}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left bg-transparent border-none",
                      isDone ? "opacity-40" : "hover:bg-foreground/5"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                      isDone ? "bg-green-500 text-white" : "border-2 border-foreground/10"
                    )}>
                      {isDone && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className={cn("text-xs font-bold leading-tight", isDone && "line-through")}>
                        {task.label || task.task_title}
                      </p>
                      {!isDone && task.target > 1 && (
                        <p className="text-[9px] text-foreground/40 font-bold uppercase mt-1">
                          Progress: {task.current || 0}/{task.target}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-foreground/5 bg-foreground/[0.02]">
               <button 
                 onClick={() => { navigate('/progress'); setIsOpen(false); }}
                 className="w-full py-2.5 rounded-lg bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
               >
                 View My Progress
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-12 flex items-center gap-3 px-4 rounded-full shadow-2xl transition-all duration-300 border-none group",
          isOpen ? "bg-background text-foreground border border-foreground/10" : "bg-orange-500 text-white"
        )}
      >
        <div className="relative">
          <Target className={cn("w-5 h-5", isOpen ? "text-orange-500" : "text-white")} />
          {completedCount < tasks.length && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full border-2 border-orange-500" />
          )}
        </div>
        {!isOpen && (
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold uppercase tracking-tighter leading-none">Your Tasks</span>
            <span className="text-[9px] opacity-80 font-medium">{completedCount}/{tasks.length} done</span>
          </div>
        )}
        {isOpen ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronUp className="w-4 h-4 ml-1 group-hover:-translate-y-0.5 transition-transform" />}
      </button>
    </div>
  );
}