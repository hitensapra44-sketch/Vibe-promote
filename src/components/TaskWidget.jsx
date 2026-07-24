"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  Zap, 
  ArrowRight,
  Target
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGrowthState } from '../lib/useGrowthState';
import { useAuth } from '../lib/AuthContext';
import { cn } from "@/lib/utils";
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

/**
 * Global helper to mark a task as complete.
 */
export async function markTaskComplete(userId, taskKey, supabaseClient) {
  try {
    const { error } = await supabaseClient
      .from('user_tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('task_key', taskKey);

    if (error) throw error;
    
    // Dispatch event to trigger local UI updates if needed
    window.dispatchEvent(new CustomEvent('vh_task_completed', { detail: { taskKey } }));
  } catch (err) {
    console.error('[markTaskComplete] Error:', err);
  }
}

export default function TaskWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { data: growth, isLoading, refetch } = useGrowthState();

  // Listen for external task completion events or usage increments
  useEffect(() => {
    const handleRefresh = () => refetch();
    window.addEventListener('vh_task_completed', handleRefresh);
    window.addEventListener('vh_usage_incremented', handleRefresh);
    return () => {
      window.removeEventListener('vh_task_completed', handleRefresh);
      window.removeEventListener('vh_usage_incremented', handleRefresh);
    };
  }, [refetch]);

  // ONBOARDING (GET STARTED) TASKS
  const getStartedTasks = useMemo(() => {
    if (!growth?.allTasks) return [];
    
    const setupBrain = growth.allTasks.find(t => t.task_key === 'setup_brain') || {
      task_title: 'Setup Brand Brain',
      task_description: 'Complete your initial product profile.',
      status: 'completed', // If they see this widget, brain is usually done
      route: '/brand-brain'
    };

    const connectAccount = growth.allTasks.find(t => t.task_key === 'connect_reddit') || {
      task_title: 'Connect Reddit Account',
      task_description: 'Link your Reddit to track performance.',
      status: 'pending',
      route: '/connected-accounts'
    };

    // This is the renamed task
    const firstPost = growth.allTasks.find(t => t.task_key === 'growth_action' || t.task_key === 'first_post') || {
      task_title: 'Make your first post',
      task_description: 'Use the Post Maker to create content for any platform.',
      status: growth?.counts?.postMaker >= 1 ? 'completed' : 'pending',
      route: '/post-maker'
    };

    return [
      { ...setupBrain, task_title: 'Setup Brand Brain' },
      { ...connectAccount, task_title: 'Connect Reddit Account' },
      { ...firstPost, task_title: 'Make your first post' }
    ];
  }, [growth]);

  const isGettingStartedDone = useMemo(() => {
    return getStartedTasks.every(t => t.status === 'completed');
  }, [getStartedTasks]);

  // Decide which tasks to show: Onboarding or Day X
  const activeTasks = isGettingStartedDone ? (growth?.tasks || []) : getStartedTasks;
  const completedCount = activeTasks.filter(t => t.status === 'completed').length;
  const totalCount = activeTasks.length;

  if (isLoading || activeTasks.length === 0) return null;

  // Don't show on specific paths
  const hiddenPaths = ['/onboarding', '/', '/auth', '/pricing'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] w-72 sm:w-80 font-poppins">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white border-2 border-slate-100 rounded-3xl shadow-2xl overflow-hidden mb-4"
          >
            <header className="px-6 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-zinc-900">
                  {isGettingStartedDone ? `Day ${growth?.currentDay} Progress` : "Get Started"}
                </h3>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">
                  {completedCount} of {totalCount} tasks done
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center">
                 <Target className="w-5 h-5 text-zinc-300" />
              </div>
            </header>

            <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
              {activeTasks.map((task, idx) => {
                const isDone = task.status === 'completed';
                return (
                  <button
                    key={idx}
                    onClick={() => !isDone && navigate(task.route)}
                    className={cn(
                      "w-full flex items-start gap-4 p-4 rounded-2xl transition-all border-2 text-left group",
                      isDone 
                        ? "bg-slate-50 border-transparent opacity-60" 
                        : "bg-white border-slate-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5"
                    )}
                  >
                    <div className={cn(
                      "mt-1 w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                      isDone ? "bg-orange-500 text-white" : "border-2 border-slate-200 text-transparent"
                    )}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={cn(
                        "text-xs font-bold leading-tight",
                        isDone ? "text-zinc-400 line-through" : "text-zinc-900"
                      )}>
                        {task.task_title}
                      </p>
                      {!isDone && (
                        <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                          {task.task_description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-50 bg-white">
              <button 
                onClick={() => navigate('/progress')}
                className="w-full py-3 bg-zinc-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                View Full Roadmap <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-14 rounded-2xl flex items-center px-5 justify-between shadow-2xl transition-all border-2",
          isOpen ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-900 border-slate-100"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
            isOpen ? "bg-white/10" : "bg-orange-500 text-white"
          )}>
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div className="text-left">
            <p className="text-xs font-black uppercase tracking-widest">
              {isGettingStartedDone ? `Day ${growth?.currentDay}` : "Setup"}
            </p>
            <p className={cn("text-[10px] font-bold", isOpen ? "text-white/60" : "text-zinc-400")}>
              {completedCount}/{totalCount} Tasks
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                className="h-full bg-orange-500"
              />
           </div>
           {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </motion.button>
    </div>
  );
}