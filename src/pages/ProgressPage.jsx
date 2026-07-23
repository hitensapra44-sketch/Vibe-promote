"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Sparkles, 
  Target, 
  Rocket, 
  Calendar, 
  Check,
  Loader2,
  Zap,
  Lock,
  Flame
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
  { goal_type: 'users_100', goal_label: 'Get first 100 users', goal_target: 100 },
  { goal_type: 'paying_10', goal_label: 'Get first 10 paying users', goal_target: 10 },
  { goal_type: 'mrr_100', goal_label: 'Touch $100 MRR', goal_target: 100 }
];

export default function ProgressPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: state, isLoading } = useGrowthState();
  const [isSettingGoal, setIsSettingGoal] = useState(false);

  const handleSetGoal = async (goal) => {
    try {
      const { error } = await supabase.from('user_progress').upsert({
        user_id: user.id,
        goal_type: goal.goal_type,
        goal_label: goal.goal_label,
        goal_target: goal.goal_target
      }, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['growth-state'] });
      setIsSettingGoal(false);
      toast.success("Goal set! Time to start the sprint.");
    } catch (err) {
      toast.error("Failed to set goal.");
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  const hasGoal = !!state?.progress?.goal_type;

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />
      <main className="flex-1 min-w-0 overflow-y-auto p-8 sm:p-12">
        <div className="max-w-4xl mx-auto w-full">
          
          {/* HEADER */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold">Growth Sprints</h1>
              <p className="text-zinc-500 text-sm mt-1">
                {hasGoal ? `Day ${state.currentDay} of 15` : 'Set a goal to start your 15-day marketing sprint.'}
              </p>
            </div>
            {hasGoal && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  Day {state.currentDay}
                </div>
              </div>
            )}
          </div>

          {!hasGoal ? (
            /* GOAL SELECTION STATE */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto text-center space-y-12 py-12">
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto">
                  <Target className="w-10 h-10 text-orange-500" />
                </div>
                <h2 className="text-4xl font-bold tracking-tight">What's the mission?</h2>
                <p className="text-zinc-500 text-lg">Pick one goal for the next 15 days. We'll build your daily plan around it.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {GOAL_OPTIONS.map((goal) => (
                  <button
                    key={goal.goal_type}
                    onClick={() => handleSetGoal(goal)}
                    className="group relative bg-zinc-900 border border-white/5 hover:border-orange-500/50 p-8 rounded-2xl text-left transition-all hover:scale-[1.02] shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{goal.goal_label}</h3>
                        <p className="text-zinc-500 text-sm">Focused growth plan to hit {goal.goal_target} users.</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-zinc-700 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* DASHBOARD STATE */
            <div className="space-y-12 animate-in fade-in duration-500">
              {/* GOAL WIDGET */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-8 rounded-2xl bg-zinc-900 border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-3xl -mr-32 -mt-32" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <Target className="w-6 h-6 text-orange-500" />
                      <h2 className="text-xl font-bold">{state.progress.goal_label}</h2>
                    </div>
                    <button 
                      onClick={() => setIsSettingGoal(true)} 
                      className="text-[10px] font-bold text-zinc-600 hover:text-white uppercase tracking-widest bg-transparent transition-colors"
                    >
                      Change Goal
                    </button>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
                      <span>Sprint Progress</span>
                      <span className="text-orange-500">{state.progress.current_value || 0} / {state.progress.goal_target}</span>
                    </div>
                    <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((state.progress.current_value || 0) / state.progress.goal_target) * 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-2xl bg-zinc-900 border border-white/5 flex flex-col justify-center items-center text-center shadow-xl">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="text-4xl font-black mb-1">{state.progress.streak || 0}</div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Day Streak</div>
                </div>
              </div>

              {/* DAILY TASKS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Today's Focus</h3>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase">Day {state.currentDay}</span>
                  </div>

                  <div className="space-y-3">
                    {state.tasks.length > 0 ? (
                      state.tasks.map((task) => {
                        const isDone = task.status === 'completed';
                        return (
                          <div 
                            key={task.id}
                            className={cn(
                              "flex items-center justify-between p-6 rounded-2xl border transition-all",
                              isDone ? "bg-green-500/5 border-green-500/20" : "bg-zinc-900 border-white/5 hover:border-white/10 shadow-lg"
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 transition-colors",
                                isDone ? "bg-green-500 text-white" : "bg-zinc-800 text-zinc-600"
                              )}>
                                {isDone ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4 opacity-20" />}
                              </div>
                              <div>
                                <h4 className={cn("text-base font-bold transition-all", isDone && "opacity-40 line-through")}>{task.task_title}</h4>
                                <p className="text-xs text-zinc-500 mt-1 leading-relaxed max-w-xs">{task.task_description}</p>
                              </div>
                            </div>
                            {!isDone && (
                              <button 
                                onClick={() => navigate(task.route)}
                                className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold transition-all hover:bg-zinc-200 whitespace-nowrap ml-4"
                              >
                                Do Now
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                        <p className="text-zinc-600 text-sm font-medium">No tasks found for today. Check Co-pilot for advice.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* TOMORROW PREVIEW */}
                <div className="space-y-6 opacity-40 grayscale pointer-events-none">
                  <div className="flex items-center gap-2 px-2">
                    <Lock className="w-4 h-4 text-zinc-600" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Tomorrow</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-lg bg-zinc-800" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-zinc-800 rounded" />
                          <div className="h-2 w-48 bg-zinc-800/50 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Goal Modal */}
      <AnimatePresence>
        {isSettingGoal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zinc-900 border border-white/10 p-10 rounded-[2rem] max-w-md w-full shadow-2xl space-y-8">
              <div className="text-center space-y-2">
                <Target className="w-12 h-12 text-orange-500 mx-auto" />
                <h2 className="text-3xl font-bold">Pick your 15-day goal</h2>
              </div>
              <div className="space-y-3">
                {GOAL_OPTIONS.map(g => (
                  <button key={g.goal_type} onClick={() => handleSetGoal(g)} className="w-full text-left p-6 rounded-2xl border border-white/5 hover:border-orange-500/50 transition-all font-bold text-sm bg-zinc-800/50 hover:bg-zinc-800">
                    {g.goal_label}
                  </button>
                ))}
              </div>
              <button onClick={() => setIsSettingGoal(false)} className="w-full py-3 text-zinc-600 hover:text-white text-xs font-bold uppercase tracking-widest bg-transparent transition-colors">Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}