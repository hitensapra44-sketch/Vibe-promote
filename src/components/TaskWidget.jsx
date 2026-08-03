"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronUp, ChevronDown, Sparkles, X, ArrowRight, Zap } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { useGrowthState } from '../lib/useGrowthState';
import { useQueryClient } from '@tanstack/react-query';
import ReactConfetti from 'react-confetti';

export const markTaskComplete = async (userId, taskKey, supabaseClient) => {
  if (!userId || !taskKey) return;
  
  try {
    const { error } = await supabaseClient
      .from('user_tasks')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString() 
      })
      .eq('user_id', userId)
      .eq('task_key', taskKey);

    if (error) throw error;
    window.dispatchEvent(new CustomEvent('vh_task_completed', { detail: { taskKey } }));
    return true;
  } catch (err) {
    console.error(`[markTaskComplete] Failed for ${taskKey}:`, err);
    return false;
  }
};

export default function TaskWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: growth, isLoading, refetch } = useGrowthState();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['growth-state'] });
    };
    window.addEventListener('vh_task_completed', handleUpdate);
    window.addEventListener('vh_usage_incremented', handleUpdate);
    return () => {
      window.removeEventListener('vh_task_completed', handleUpdate);
      window.removeEventListener('vh_usage_incremented', handleUpdate);
    };
  }, [refetch, queryClient]);

  const currentDay = growth?.currentDay || 1;
  const allTasks = growth?.allTasks || [];
  
  // Show tasks for the CURRENT day of the sprint
  const activeTasks = allTasks.filter(t => t.day === currentDay);

  const completedCount = activeTasks.filter(t => t.status === 'completed').length;
  const totalCount = activeTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (isLoading || activeTasks.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-[200]">
            <ReactConfetti 
              recycle={false} 
              numberOfPieces={200} 
              onConfettiComplete={() => setShowConfetti(false)}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <header className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Zap size={14} className="text-orange-600" />
                </div>
                <span className="text-slate-900 text-xs font-bold uppercase tracking-widest">Day {currentDay} Tasks</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </header>

            <div className="p-2 max-h-[380px] overflow-y-auto">
              {activeTasks.map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <button
                    key={task.id}
                    disabled={isDone}
                    onClick={() => {
                      if (!isDone) {
                        navigate(task.route);
                        setIsOpen(false);
                      }
                    }}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left group border-none bg-transparent cursor-pointer",
                      isDone ? "opacity-60" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="mt-0.5">
                      {isDone ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : (
                        <Circle size={18} className="text-slate-300 group-hover:text-orange-400 transition-colors" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-bold leading-tight",
                        isDone ? "text-slate-400 line-through" : "text-slate-900"
                      )}>
                        {task.task_title}
                      </p>
                    </div>
                    {!isDone && (
                      <ArrowRight size={14} className="mt-1 text-slate-300 group-hover:text-orange-500 transition-all group-hover:translate-x-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Day Progress</span>
                <span className="text-[10px] font-bold text-slate-900">{completedCount}/{totalCount}</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-orange-500"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl transition-all duration-300 border-none cursor-pointer",
          isOpen ? "bg-slate-900 text-white" : "bg-white text-slate-900 border border-slate-200"
        )}
      >
        <div className="relative">
          <div className={cn(
            "w-2 h-2 rounded-full absolute -top-0.5 -right-0.5 border border-white",
            completedCount === totalCount ? "bg-green-500" : "bg-orange-500 animate-pulse"
          )} />
          <CheckCircle2 size={20} className={cn(isOpen ? "text-orange-400" : "text-slate-400")} />
        </div>
        <span className="text-sm font-bold">
          {completedCount === totalCount ? `Day ${currentDay} Done` : `Day ${currentDay}: ${activeTasks.find(t => t.status !== 'completed')?.task_title || 'Continue'}`}
        </span>
        {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </motion.button>
    </div>
  );
}