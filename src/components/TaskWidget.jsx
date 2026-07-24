"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  X, 
  Sparkles, 
  LayoutList, 
  CheckSquare,
  Target,
  Search,
  PenLine,
  Zap
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { cn } from "@/lib/utils";

// Static Setup Tasks
const SETUP_TASKS = [
  { id: 'onboarding', label: 'Complete Onboarding', route: '/onboarding' },
  { id: 'connect_reddit', label: 'Connect Reddit Account', route: '/connected-accounts' },
  { id: 'run_user_finder', label: 'Run User Finder & find first lead', route: '/audience-spotter' },
  { id: 'setup_goal', label: 'Make a goal & track progress', route: '/progress' },
];

/**
 * Utility to mark a setup task as complete in user_meta or similar.
 * Since we don't have a dedicated table for setup tasks, we'll use a local storage
 * key tied to user ID and ideally a metadata column if it existed.
 */
export const markTaskComplete = async (userId, taskId, supabaseClient) => {
  if (!userId) return;
  const storageKey = `vh_setup_tasks_${userId}`;
  const completed = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!completed.includes(taskId)) {
    const updated = [...completed, taskId];
    localStorage.setItem(storageKey, JSON.stringify(updated));
    // Trigger custom event to refresh widget
    window.dispatchEvent(new CustomEvent('vh_task_completed', { detail: { taskId } }));
  }
};

export default function TaskWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [hasShownTooltip, setHasShownTooltip] = useState(false);

  // Hidden on onboarding screen
  if (location.pathname === '/onboarding') return null;

  useEffect(() => {
    if (!user) return;
    const storageKey = `vh_setup_tasks_${user.id}`;
    const completed = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setCompletedTasks(completed);

    // If onboarding is done (we are in dashboard), it's auto-complete
    if (!completed.includes('onboarding') && location.pathname !== '/onboarding') {
      markTaskComplete(user.id, 'onboarding', supabase);
    }

    const handleTaskEvent = (e) => {
      setCompletedTasks(prev => {
        if (prev.includes(e.detail.taskId)) return prev;
        return [...prev, e.detail.taskId];
      });
    };

    window.addEventListener('vh_task_completed', handleTaskEvent);
    
    // Tooltip timer
    const timer = setTimeout(() => setHasShownTooltip(true), 5000);

    return () => {
      window.removeEventListener('vh_task_completed', handleTaskEvent);
      clearTimeout(timer);
    };
  }, [user, location.pathname]);

  const progress = Math.round((completedTasks.length / SETUP_TASKS.length) * 100);
  const isAllDone = completedTasks.length === SETUP_TASKS.length;

  if (isAllDone && !isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[320px] bg-background border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col mb-2"
          >
            <header className="px-5 py-4 border-b border-foreground/5 bg-foreground/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare size={16} className="text-orange-500" />
                <span className="text-sm font-bold text-foreground">Setup Checklist</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-foreground/5 rounded-lg text-zinc-400 transition-all bg-transparent"
              >
                <X size={16} />
              </button>
            </header>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <span>{completedTasks.length} of {SETUP_TASKS.length} complete</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-orange-500" 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                  />
                </div>
              </div>

              <div className="space-y-1 pt-2">
                {SETUP_TASKS.map((task) => {
                  const isDone = completedTasks.includes(task.id);
                  return (
                    <button
                      key={task.id}
                      onClick={() => !isDone && navigate(task.route)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all border-none bg-transparent text-left group",
                        isDone ? "opacity-60" : "hover:bg-foreground/5"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center transition-all",
                        isDone ? "bg-green-500 text-white" : "border-2 border-foreground/10 text-transparent group-hover:border-orange-500/50"
                      )}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                      <span className={cn(
                        "text-xs font-medium transition-all",
                        isDone ? "text-zinc-400 line-through" : "text-foreground"
                      )}>
                        {task.label}
                      </span>
                      {!isDone && <ChevronRight size={14} className="ml-auto text-zinc-300 opacity-0 group-hover:opacity-100 transition-all" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {isAllDone && (
              <div className="p-5 bg-orange-500/5 border-t border-orange-500/10 text-center">
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <Sparkles size={12} /> Setup Complete! You're ready to grow.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        {!isOpen && !hasShownTooltip && !isAllDone && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-zinc-900 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap"
          >
            Get started with setup
            <div className="absolute left-full top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45 -translate-x-1" />
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 relative border-none cursor-pointer",
            isOpen ? "bg-zinc-100 text-zinc-900" : "bg-orange-500 text-white shadow-orange-500/20"
          )}
        >
          {isOpen ? <X size={20} /> : <LayoutList size={20} />}
          
          {!isOpen && !isAllDone && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background flex items-center justify-center text-[8px] font-bold">
              {SETUP_TASKS.length - completedTasks.length}
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
}