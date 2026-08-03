"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  X, 
  ListTodo, 
  ArrowRight, 
  Search, 
  PenLine, 
  Link2, 
  Target,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { completeOnboardingTask } from '../lib/onboarding';

export default function OnboardingChecklist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ['onboarding_status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('onboarding_status')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // If record doesn't exist, create it (fallback for existing users)
      if (!data && !error) {
        const { data: newData, error: insertError } = await supabase
          .from('onboarding_status')
          .insert({ user_id: user.id })
          .select()
          .single();
        if (insertError) throw insertError;
        return newData;
      }

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Don't show on landing page or onboarding page
  const isHiddenPath = location.pathname === '/' || location.pathname === '/onboarding' || location.pathname === '/auth';
  
  if (isHiddenPath || isLoading || !status || status.dismissed) return null;

  const tasks = [
    {
      key: 'run_scan',
      label: 'Run your first User Finder scan',
      icon: Search,
      path: '/audience-spotter',
      completed: status.run_scan
    },
    {
      key: 'create_post',
      label: 'Create your first post',
      icon: PenLine,
      path: '/post-maker',
      completed: status.create_post
    },
    {
      key: 'set_goal',
      label: 'Set a growth goal',
      icon: Target,
      path: '/progress',
      completed: status.set_goal
    }
  ];

  const completedCount = tasks.filter(t => t.completed).length;
  const allCompleted = completedCount === tasks.length;

  // Hide the icon permanently if all are completed, unless the panel is open
  if (allCompleted && !isOpen) return null;

  const handleDismiss = () => {
    completeOnboardingTask(user.id, 'dismissed');
    setIsOpen(false);
  };

  return (
    <div className="fixed right-6 bottom-6 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="w-[320px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col mb-2"
          >
            <header className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-orange-50/30">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-orange-500" />
                <span className="text-zinc-900 text-sm font-bold">Get Started</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors bg-transparent border-none p-0 cursor-pointer">
                <X size={18} />
              </button>
            </header>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {completedCount} of {tasks.length} completed
                </span>
                <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-500" 
                    style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {tasks.map((task) => (
                  <button
                    key={task.key}
                    onClick={() => {
                      navigate(task.path);
                      if (window.innerWidth < 768) setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all group relative overflow-hidden bg-transparent",
                      task.completed 
                        ? "border-orange-100 bg-orange-50/20 opacity-70" 
                        : "border-slate-100 hover:border-orange-200 hover:bg-orange-50/10"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 transition-colors",
                      task.completed ? "text-orange-500" : "text-zinc-300 group-hover:text-orange-400"
                    )}>
                      {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs font-medium transition-colors truncate",
                        task.completed ? "text-zinc-400 line-through" : "text-zinc-700"
                      )}>
                        {task.label}
                      </p>
                    </div>

                    {!task.completed && (
                      <ArrowRight size={14} className="text-zinc-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    )}
                  </button>
                ))}
              </div>

              {allCompleted ? (
                <div className="pt-2">
                  <button
                    onClick={handleDismiss}
                    className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-lg shadow-orange-500/20 border-none cursor-pointer"
                  >
                    Ready to Grow! (Hide)
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleDismiss}
                  className="w-full text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-colors bg-transparent border-none cursor-pointer"
                >
                  Dismiss Checklist
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-none cursor-pointer relative",
          isOpen ? "bg-white text-orange-500 rotate-90" : "bg-orange-500 text-white shadow-orange-500/30"
        )}
      >
        {isOpen ? <X size={28} /> : <ListTodo size={28} />}
        {!isOpen && completedCount < tasks.length && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-zinc-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            {tasks.length - completedCount}
          </div>
        )}
      </motion.button>
    </div>
  );
}