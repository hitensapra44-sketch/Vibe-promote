"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Circle, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  LayoutDashboard,
  Calendar
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGrowthState } from '../lib/useGrowthState';
import { cn } from "@/lib/utils";

export default function TaskWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: state, isLoading } = useGrowthState();
  const [isOpen, setIsOpen] = useState(false);
  
  // Auto-open logic
  useEffect(() => {
    if (!state || isLoading) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const lastSeenDay = localStorage.getItem('vh_widget_last_opened');
    
    // Trigger auto-open if it's a new day or first time after onboarding
    if (lastSeenDay !== todayStr) {
      setIsOpen(true);
      localStorage.setItem('vh_widget_last_opened', todayStr);
    }
  }, [state, isLoading]);

  if (isLoading || !state || location.pathname === '/onboarding') return null;

  const completedCount = state.tasks.filter(t => t.status === 'completed').length;
  const totalCount = state.tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isDone = state.isDayComplete;

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-4 pointer-events-none">
      
      {/* 1. FLOATING ACTION PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[340px] bg-white border border-zinc-200 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="p-6 pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sprint Day {state.currentDay}</p>
                    <p className="text-sm font-bold text-zinc-900">{completedCount}/{totalCount} tasks done</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors bg-transparent border-none cursor-pointer"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
              
              <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto max-h-[400px] p-4 pt-0 space-y-2">
              {state.tasks.map((task) => {
                const isTaskDone = task.status === 'completed';
                return (
                  <div 
                    key={task.id}
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex items-center justify-between gap-4",
                      isTaskDone ? "bg-green-50 border-green-100" : "bg-zinc-50 border-zinc-100 hover:border-zinc-200"
                    )}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn(
                        "mt-0.5 flex-shrink-0 transition-colors",
                        isTaskDone ? "text-green-500" : "text-zinc-300"
                      )}>
                        {isTaskDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className={cn("text-xs font-bold text-zinc-900 truncate", isTaskDone && "opacity-40 line-through")}>{task.task_title}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{task.task_description}</p>
                      </div>
                    </div>
                    <button
                      disabled={isTaskDone}
                      onClick={() => {
                        navigate(task.route);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                        isTaskDone ? "bg-green-100 text-green-700" : "bg-zinc-900 text-white"
                      )}
                    >
                      {isTaskDone ? "Done ✓" : "Start Now"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Celebration Footer */}
            {isDone && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="bg-green-500 p-6 text-white text-center space-y-4"
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest">You're on fire! 🔥</p>
                  <p className="text-sm font-medium">Come back tomorrow — consistency is your edge.</p>
                </div>
                <button
                  onClick={() => navigate('/progress')}
                  className="w-full py-3 bg-white text-green-600 font-bold text-xs rounded-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Update your progress →
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. TRIGGER BUTTON */}
      <div className="relative pointer-events-auto">
        {!isDone && (
          <motion.div 
            className="absolute inset-0 rounded-full bg-orange-500/20 pointer-events-none"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 relative",
            isDone ? "bg-green-500 text-white" : "bg-orange-500 text-white"
          )}
        >
          {isOpen ? <ChevronDown className="w-6 h-6" /> : isDone ? <CheckCircle2 className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          
          {/* Badge */}
          {!isDone && !isOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {totalCount - completedCount}
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
}

export function markTaskComplete(userId, taskKey, supabaseClient) {
  return supabaseClient
    .from('user_tasks')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('task_key', taskKey);
}