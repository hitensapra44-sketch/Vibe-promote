"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { useGrowthState } from '../lib/useGrowthState';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronUp, ChevronDown, ListTodo, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useQueryClient } from '@tanstack/react-query';

/**
 * Utility function to mark a task as complete in the database.
 * Exported so other components can trigger completion upon user actions.
 */
export const markTaskComplete = async (userId, taskKey, supabaseClient) => {
  try {
    const { error } = await supabaseClient
      .from('user_tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('task_key', taskKey);
    
    if (error) throw error;
    
    // Dispatch custom event to notify components to refresh state
    window.dispatchEvent(new CustomEvent('growth-task-completed'));
  } catch (err) {
    console.error('Error marking task complete:', err);
  }
};

export default function TaskWidget() {
  const { user } = useAuth();
  const { data: state, isLoading } = useGrowthState();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['growth-state', user?.id] });
    };
    window.addEventListener('growth-task-completed', handleUpdate);
    return () => window.removeEventListener('growth-task-completed', handleUpdate);
  }, [queryClient, user?.id]);

  if (!user || isLoading || !state?.onboardingComplete) return null;

  const tasks = state.tasks || [];
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;

  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Day {state.currentDay} Focus</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{completedCount}/{totalCount} Done</span>
            </div>
            
            <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3">
                  <div className={cn(
                    "mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border",
                    task.status === 'completed' ? "bg-green-500 border-green-500" : "border-slate-300"
                  )}>
                    {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "text-xs font-medium leading-tight",
                      task.status === 'completed' ? "text-slate-400 line-through" : "text-slate-700"
                    )}>
                      {task.task_title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-full shadow-lg border transition-all duration-300",
          isOpen 
            ? "bg-slate-900 border-slate-800 text-white" 
            : "bg-white border-slate-200 text-slate-700 hover:border-orange-500/50 hover:bg-orange-50/50"
        )}
      >
        <div className="relative">
          <Sparkles className={cn("w-4 h-4", completedCount === totalCount ? "text-green-500" : "text-orange-500")} />
          {completedCount < totalCount && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          )}
        </div>
        <span className="text-xs font-bold uppercase tracking-wider">
          {isOpen ? 'Close Tasks' : `Today's Sprint (${completedCount}/${totalCount})`}
        </span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}