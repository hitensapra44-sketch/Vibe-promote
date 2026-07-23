"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Flame, 
  Lock, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { useGrowthState } from '../lib/useGrowthState';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const GOAL_OPTIONS = [
  { type: 'users_100', label: 'Get first 100 users', target: 100 },
  { type: 'paying_10', label: 'Get first 10 paying users', target: 10 },
  { type: 'mrr_100', label: 'Touch $100 MRR', target: 100 },
  { type: 'consistency', label: 'Consistency in marketing', target: 15, locked: true }
];

const QUOTES = [
  "Consistency beats perfection every time.",
  "Most founders quit before the compounding starts.",
  "You showed up today. Most didn't.",
  "Small wins every day lead to massive outcomes.",
  "The secret to getting ahead is getting started."
];

export default function ProgressPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: state, isLoading } = useGrowthState();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateValue, setUpdateValue] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [randomQuote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    if (state?.isDayComplete && !state.progress.last_modal_shown_day?.includes(state.currentDay)) {
      setShowCompleteModal(true);
      // Mark this day's modal as shown
      const shown = state.progress.last_modal_shown_day || [];
      supabase.from('user_progress').update({ 
        last_modal_shown_day: [...shown, state.currentDay] 
      }).eq('user_id', user.id).then(() => queryClient.invalidateQueries(['growth-state']));
    }
  }, [state?.isDayComplete, state?.currentDay]);

  const handleSetGoal = async (goal) => {
    try {
      const { error } = await supabase.from('user_progress').upsert({
        user_id: user.id,
        goal_type: goal.type,
        goal_label: goal.label,
        goal_target: goal.target,
        current_value: 0,
        sprint_start_date: new Date().toISOString(),
        streak: 1
      }, { onConflict: 'user_id' });
      
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['growth-state'] });
      toast.success("Goal set! Let's get to work.");
    } catch (err) {
      toast.error("Failed to set goal.");
    }
  };

  const handleUpdateProgress = async () => {
    const val = parseInt(updateValue);
    if (isNaN(val)) return;

    try {
      const { error } = await supabase.from('user_progress').update({
        current_value: (state.progress.current_value || 0) + val
      }).eq('user_id', user.id);
      
      if (error) throw error;
      setUpdateValue('');
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: ['growth-state'] });
      toast.success("Progress updated! Keep going.");
    } catch (err) {
      toast.error("Failed to update progress.");
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
    </div>
  );

  const hasGoal = !!state?.progress?.goal_type;

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />
      <main className="flex-1 min-w-0 overflow-y-auto p-6 sm:p-12">
        <div className="max-w-4xl mx-auto w-full">
          
          {!hasGoal ? (
            /* GOAL SELECTION */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto text-center space-y-12 py-20">
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-orange-500" />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">What's the mission?</h1>
                <p className="text-zinc-500 text-lg">Pick one goal for the next 15 days. We'll track your growth daily.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {GOAL_OPTIONS.map((goal) => (
                  <div key={goal.type} className="relative group">
                    {goal.locked && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-[2px] rounded-2xl cursor-not-allowed">
                        <p className="text-xs font-bold text-zinc-600 bg-white px-3 py-1.5 rounded-full border border-zinc-100 shadow-sm">
                          This tracks automatically — pick a revenue or user goal alongside it.
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => !goal.locked && handleSetGoal(goal)}
                      disabled={goal.locked}
                      className={cn(
                        "w-full p-8 rounded-2xl border text-left transition-all flex items-center justify-between",
                        goal.locked 
                          ? "bg-zinc-50 border-zinc-100 opacity-60" 
                          : "bg-white border-zinc-100 hover:border-orange-500/50 hover:shadow-xl hover:-translate-y-0.5"
                      )}
                    >
                      <div>
                        <h3 className="text-xl font-bold mb-1">{goal.label}</h3>
                        <p className="text-zinc-500 text-sm">Sprint towards {goal.target} {goal.type.includes('mrr') ? 'revenue' : 'users'}.</p>
                      </div>
                      {goal.locked ? <Lock className="w-5 h-5 text-zinc-400" /> : <ArrowRight className="w-6 h-6 text-zinc-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ACTIVE DASHBOARD */
            <div className="space-y-12 animate-in fade-in duration-500">
              
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900">Sprint Dashboard</h1>
                  <p className="text-zinc-500 text-sm mt-1">Day {state.currentDay} of 15</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  {state.progress.streak || 1} day streak
                </div>
              </div>

              {/* 1. GOAL CARD */}
              <div className="p-8 rounded-[2rem] bg-zinc-900 text-white space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] -mr-32 -mt-32" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                    <span className="text-orange-500 text-[10px] font-bold uppercase tracking-[0.2em]">Current Mission</span>
                    <h2 className="text-2xl font-bold">{state.progress.goal_label}</h2>
                  </div>
                  {!isUpdating ? (
                    <button 
                      onClick={() => setIsUpdating(true)}
                      className="px-6 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all"
                    >
                      Update Progress
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input 
                        autoFocus
                        type="number"
                        placeholder="+0"
                        className="w-20 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                        value={updateValue}
                        onChange={(e) => setUpdateValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateProgress()}
                      />
                      <button onClick={handleUpdateProgress} className="p-2 rounded-lg bg-orange-500 text-white"><ArrowRight className="w-4 h-4" /></button>
                      <button onClick={() => setIsUpdating(false)} className="p-2 text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-end">
                    <div className="text-5xl font-black">{state.progress.current_value || 0}<span className="text-white/20 text-2xl font-bold ml-2">/ {state.progress.goal_target}</span></div>
                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest">
                      {Math.round(((state.progress.current_value || 0) / state.progress.goal_target) * 100)}% Complete
                    </div>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((state.progress.current_value || 0) / state.progress.goal_target) * 100)}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. TODAY'S TASKS */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Today's Focus</h3>
                </div>
                <div className="space-y-3">
                  {state.tasks.map((task) => {
                    const isDone = task.status === 'completed';
                    return (
                      <div 
                        key={task.id}
                        className={cn(
                          "flex items-center justify-between p-8 rounded-[1.5rem] border transition-all",
                          isDone ? "bg-green-50 border-green-100" : "bg-white border-zinc-100 hover:border-zinc-200 shadow-sm"
                        )}
                      >
                        <div className="flex items-start gap-5">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center mt-1 transition-colors",
                            isDone ? "bg-green-500 text-white" : "bg-zinc-50 text-zinc-400"
                          )}>
                            {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6 stroke-[1.5px]" />}
                          </div>
                          <div>
                            <h4 className={cn("text-lg font-bold transition-all", isDone && "opacity-40 line-through")}>{task.task_title}</h4>
                            <div className="flex items-center gap-3 mt-1.5">
                              <p className="text-sm text-zinc-500 leading-relaxed max-w-md">{task.task_description}</p>
                              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">~{task.task_time || '10 min'}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          disabled={isDone}
                          onClick={() => navigate(task.route)}
                          className={cn(
                            "px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ml-8",
                            isDone 
                              ? "bg-green-100 text-green-700 cursor-default" 
                              : "bg-zinc-900 text-white hover:scale-105 active:scale-95 shadow-lg"
                          )}
                        >
                          {isDone ? "Done ✓" : "Start Now"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. TOMORROW'S TASKS (LOCKED) */}
              <div className="space-y-6 opacity-40 grayscale-[0.5]">
                <div className="flex items-center gap-2 px-2">
                  <Lock className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Available Tomorrow</h3>
                </div>
                <div className="space-y-3 pointer-events-none">
                  {state.allTasks.filter(t => t.day === state.currentDay + 1).map((task) => (
                    <div key={task.id} className="p-8 rounded-[1.5rem] border border-zinc-100 bg-zinc-50 flex items-center justify-between">
                      <div className="flex items-start gap-5">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-300">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-zinc-400">{task.task_title}</h4>
                          <p className="text-sm text-zinc-400 mt-1">Day {state.currentDay + 1} exclusive focus.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. STREAK TRACKER */}
              <div className="pt-8 border-t border-zinc-100 text-center">
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                  🔥 {state.progress.streak || 1} day streak — don't break it.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* DAY COMPLETE MODAL */}
      <AnimatePresence>
        {showCompleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-[2.5rem] max-w-md w-full shadow-2xl text-center space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500" />
              
              <div className="relative">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20"
                >
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Day {state.currentDay} complete 🔥</h2>
                <p className="text-zinc-500 mt-3 italic font-medium">"{randomQuote}"</p>
              </div>

              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">New Streak</p>
                <div className="text-3xl font-black text-zinc-900">{state.progress.streak || 1} Days</div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    setIsUpdating(true);
                  }}
                  className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
                >
                  Update your progress
                </button>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Come back tomorrow for Day {state.currentDay + 1} tasks
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const X = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);