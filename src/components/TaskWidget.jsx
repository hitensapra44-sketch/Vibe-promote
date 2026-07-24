"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronUp, ChevronDown, Rocket, Target, ListTodo, ArrowRight, Check, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { cn } from "@/lib/utils";

// Utility to mark tasks as complete across the app
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
      .eq('task_key', taskKey)
      .eq('status', 'pending');
      
    if (error) throw error;
    
    // Dispatch event to refresh widget
    window.dispatchEvent(new CustomEvent('task_completed', { detail: { taskKey } }));
  } catch (err) {
    console.error('Error marking task complete:', err);
  }
};

const INITIAL_TASKS = [
  { key: 'run_user_finder', title: 'Run user finder and find your first user', route: '/audience-spotter' },
  { key: 'make_first_post', title: 'Make your first post', route: '/post-maker' },
  { key: 'connect_social', title: 'Connect your social account', route: '/connected-accounts' },
  { key: 'setup_goal', title: 'Choose a growth goal', route: '/progress' },
];

export default function TaskWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSetupPhase, setIsSetupPhase] = useState(true);

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      // 1. Check for initial setup tasks
      const { data: setupTasks, error: setupError } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user.id)
        .in('task_key', INITIAL_TASKS.map(t => t.key));

      if (setupError) throw setupError;

      // If no setup tasks exist, create them
      if (!setupTasks || setupTasks.length === 0) {
        const toInsert = INITIAL_TASKS.map(t => ({
          user_id: user.id,
          day: 0,
          task_key: t.key,
          task_title: t.title,
          task_description: t.title,
          task_time: '5m',
          route: t.route,
          status: 'pending'
        }));
        await supabase.from('user_tasks').insert(toInsert);
        setTasks(toInsert);
        setIsSetupPhase(true);
      } else {
        const allSetupDone = setupTasks.every(t => t.status === 'completed');
        
        if (!allSetupDone) {
          setTasks(setupTasks);
          setIsSetupPhase(true);
        } else {
          // Setup phase done, fetch daily tasks
          setIsSetupPhase(false);
          
          // Determine current day from user_progress
          const { data: progress } = await supabase
            .from('user_progress')
            .select('trial_start_date, created_at')
            .eq('user_id', user.id)
            .maybeSingle();
            
          let dayNum = 1;
          if (progress?.trial_start_date) {
            const start = new Date(progress.trial_start_date);
            const now = new Date();
            const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
            dayNum = Math.max(1, Math.min(15, diff + 1));
          }
          setCurrentDay(dayNum);

          const { data: dailyTasks } = await supabase
            .from('user_tasks')
            .select('*')
            .eq('user_id', user.id)
            .eq('day', dayNum);
            
          setTasks(dailyTasks || []);
        }
      }
    } catch (err) {
      console.error('Error fetching widget tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    
    // Listen for completion events from other pages
    const handleRefresh = () => fetchTasks();
    window.addEventListener('task_completed', handleRefresh);
    window.addEventListener('vh_usage_incremented', handleRefresh);
    
    return () => {
      window.removeEventListener('task_completed', handleRefresh);
      window.removeEventListener('vh_usage_incremented', handleRefresh);
    };
  }, [user, location.pathname]);

  if (!user || loading || tasks.length === 0) return null;

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-poppins">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-orange-500 p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isSetupPhase ? <Rocket className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                  <span className="font-bold text-sm uppercase tracking-widest">
                    {isSetupPhase ? 'Get Started' : `Growth Day ${currentDay}`}
                  </span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-md transition-colors bg-transparent border-none cursor-pointer text-white"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                  <span>Progress</span>
                  <span>{completedCount}/{tasks.length} Done</span>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="p-2 bg-white max-h-[400px] overflow-y-auto">
              {tasks.map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <button
                    key={task.id || task.key}
                    disabled={isDone}
                    onClick={() => {
                      if (task.route) navigate(task.route);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-start gap-4 p-4 rounded-xl transition-all text-left group bg-transparent border-none",
                      isDone ? "opacity-60" : "hover:bg-slate-50 cursor-pointer"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                      isDone ? "bg-orange-500 text-white" : "border-2 border-slate-200 text-transparent group-hover:border-orange-300"
                    )}>
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-bold leading-tight",
                        isDone ? "text-slate-400 line-through" : "text-slate-900"
                      )}>
                        {task.task_title}
                      </p>
                      {!isDone && (
                        <div className="flex items-center gap-1 mt-1 text-orange-500 text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                          Start Task <ArrowRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {progressPercent === 100 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-xs font-bold text-slate-500">🔥 Day Complete! See you tomorrow.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 border-none cursor-pointer",
          isOpen ? "bg-white text-orange-500" : "bg-orange-500 text-white"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <ListTodo className="w-6 h-6" />
            {completedCount < tasks.length && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              </span>
            )}
          </div>
        )}
      </motion.button>
    </div>
  );
}