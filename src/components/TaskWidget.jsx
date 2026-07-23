"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Zap, 
  Target, 
  Search, 
  PenLine, 
  Link2,
  ArrowRight,
  ListTodo
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { useGrowthState } from '../lib/useGrowthState';
import { supabase } from '../supabaseClient';

export const markTaskComplete = async (userId, taskKey, supabaseClient) => {
  const { error } = await supabaseClient
    .from('user_tasks')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('task_key', taskKey);
  
  if (error) console.error('[markTaskComplete] error:', error);
  window.dispatchEvent(new CustomEvent('vh_task_completed', { detail: { taskKey } }));
};

export default function TaskWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: state, isLoading, refetch } = useGrowthState();
  const navigate = useNavigate();
  const location = useLocation();

  // Refresh state when tasks are completed globally
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener('vh_task_completed', handler);
    window.addEventListener('vh_usage_incremented', handler);
    return () => {
      window.removeEventListener('vh_task_completed', handler);
      window.removeEventListener('vh_usage_incremented', handler);
    };
  }, [refetch]);

  if (isLoading || !state) return null;

  // Onboarding logic
  const showOnboarding = !state.onboardingComplete;
  const onboardingTasks = state.onboardingTasks || [];
  const dailyTasks = state.tasks || [];

  const completedCount = showOnboarding 
    ? onboardingTasks.filter(t => t.completed).length 
    : dailyTasks.filter(t => t.status === 'completed').length;
  
  const totalCount = showOnboarding ? onboardingTasks.length : dailyTasks.length;

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start gap-4 font-poppins">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[320px] bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <header className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                  {showOnboarding ? "Getting Started" : `Day ${state.currentDay} Plan`}
                </span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-white/5 text-zinc-500 transition-colors bg-transparent border-none"
              >
                <X size={14} />
              </button>
            </header>

            {/* List */}
            <div className="p-3 space-y-1.5 max-h-[380px] overflow-y-auto scrollbar-hide">
              {(showOnboarding ? onboardingTasks : dailyTasks).map((task, idx) => {
                const isDone = showOnboarding ? task.completed : task.status === 'completed';
                const id = task.id || task.task_key;
                
                return (
                  <div 
                    key={id}
                    onClick={() => {
                      if (task.route) navigate(task.route);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                      isDone 
                        ? "bg-green-500/[0.03] border-green-500/20" 
                        : "bg-white/[0.02] border-white/5 hover:border-orange-500/30 hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle size={16} className="text-zinc-700 group-hover:text-orange-500/50 flex-shrink-0" />
                      )}
                      <div>
                        <p className={cn(
                          "text-xs font-bold leading-tight transition-all",
                          isDone ? "text-green-500/50 line-through" : "text-white/90"
                        )}>
                          {task.label || task.task_title}
                        </p>
                        {!isDone && (
                          <p className="text-[9px] text-zinc-500 mt-0.5 line-clamp-1">
                            {task.task_description || (task.target ? `${task.current}/${task.target} complete` : 'Pending action')}
                          </p>
                        )}
                      </div>
                    </div>
                    {!isDone && <ArrowRight size={10} className="text-zinc-700 group-hover:text-white transition-all" />}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            {!showOnboarding && totalCount > 0 && (
              <div className="px-5 py-3 border-t border-white/5 bg-zinc-900/50">
                <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  <span>Today's Progress</span>
                  <span>{Math.round((completedCount / totalCount) * 100)}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-500" 
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-12 flex items-center gap-3 px-5 rounded-full shadow-2xl border transition-all duration-300",
          isOpen 
            ? "bg-zinc-800 border-white/10 text-white" 
            : "bg-white text-black border-transparent"
        )}
      >
        {showOnboarding ? (
          <ListTodo size={18} />
        ) : (
          <div className="relative">
            <Zap size={18} className={cn(completedCount === totalCount ? "text-green-500" : "text-orange-500")} />
            {completedCount < totalCount && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
            )}
          </div>
        )}
        <span className="text-xs font-bold tracking-tight">
          {isOpen ? "Close List" : (showOnboarding ? "Get Started" : `Day ${state.currentDay} Checklist`)}
        </span>
        {!isOpen && (
          <div className="flex items-center gap-1.5 ml-1 pl-3 border-l border-current/10">
            <span className="text-[10px] font-black">{completedCount}/{totalCount}</span>
          </div>
        )}
      </motion.button>
    </div>
  );
}