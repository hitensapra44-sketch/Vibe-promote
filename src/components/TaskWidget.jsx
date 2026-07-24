"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown, 
  LayoutList, 
  ArrowRight,
  Check,
  Circle,
  Sparkles,
  Zap
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGrowthState } from '../lib/useGrowthState';
import { cn } from "@/lib/utils";
import { supabase } from '../supabaseClient';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Global utility to mark a task as complete from anywhere in the app.
 */
export async function markTaskComplete(userId, taskKey, supabaseClient) {
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
    
    // Dispatch event to refresh growth state across the app
    window.dispatchEvent(new CustomEvent('vh_task_completed', { detail: { taskKey } }));
  } catch (err) {
    console.error(`[markTaskComplete] Failed for ${taskKey}:`, err);
  }
}

export default function TaskWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: growth, isLoading } = useGrowthState();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Refresh data when a task is completed anywhere
  useEffect(() => {
    const handleTaskUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['growth-state'] });
    };
    window.addEventListener('vh_task_completed', handleTaskUpdate);
    window.addEventListener('vh_usage_incremented', handleTaskUpdate);
    return () => {
      window.removeEventListener('vh_task_completed', handleTaskUpdate);
      window.removeEventListener('vh_usage_incremented', handleTaskUpdate);
    };
  }, [queryClient]);

  if (isLoading || !growth || growth.tasks.length === 0) return null;

  const completedCount = growth.tasks.filter(t => t.status === 'completed').length;
  const totalCount = growth.tasks.length;
  const allDone = completedCount === totalCount;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Day {growth.currentDay} Focus</p>
                <h3 className="text-sm font-bold text-slate-900">Today's Growth Tasks</h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-orange-500">{completedCount}/{totalCount}</span>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {growth.tasks.map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <div 
                    key={task.id}
                    onClick={() => !isDone && navigate(task.route)}
                    className={cn(
                      "group flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer",
                      isDone ? "opacity-60" : "hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all",
                      isDone ? "bg-green-500 text-white" : "border-2 border-slate-200 text-transparent group-hover:border-orange-300"
                    )}>
                      {isDone ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs font-bold leading-tight",
                        isDone ? "text-slate-400 line-through" : "text-slate-800"
                      )}>
                        {task.task_title}
                      </p>
                      {!isDone && (
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                          {task.task_description}
                        </p>
                      )}
                    </div>
                    {!isDone && <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-orange-500 transition-colors self-center" />}
                  </div>
                );
              })}
            </div>

            {allDone ? (
              <div className="p-4 bg-green-50 border-t border-green-100 text-center">
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" /> Day {growth.currentDay} Complete
                </p>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/progress')}
                className="w-full p-3 bg-white border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-orange-500 transition-colors"
              >
                View full progress map
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl transition-all duration-300 border-none cursor-pointer",
          allDone 
            ? "bg-green-500 text-white shadow-green-500/20" 
            : "bg-slate-900 text-white shadow-slate-900/20"
        )}
      >
        {allDone ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <div className="relative">
            <LayoutList className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-slate-900" />
          </div>
        )}
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider leading-none opacity-60">Tasks</p>
          <p className="text-xs font-bold leading-none mt-1">
            {allDone ? "Done for today" : `${completedCount}/${totalCount} complete`}
          </p>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 opacity-40" /> : <ChevronUp className="w-4 h-4 opacity-40" />}
      </motion.button>
    </div>
  );
}